"""
Cross-Session Memory System for OrchestraAI

ADR: This module handles long-term memory across sessions. To avoid heavy dependencies
like sentence-transformers (800MB+), it uses a deterministic hash-based embedding
approach (384 dimensions) combined with pgvector for similarity search.
Memories decay over time to prioritize fresh insights.
"""

import os
import math
import numpy as np
import logging
from datetime import datetime, timezone
from app.models.db import AgentMemory
from agents.emit import SessionLocal

logger = logging.getLogger(__name__)

def _generate_hash_embedding(text_input: str, dim: int = 384) -> list[float]:
    """
    Generates a deterministic embedding for a given text using a hash-based approach.
    Avoids heavy dependencies.
    """
    words = text_input.lower().split()
    vector = np.zeros(dim)
    
    for word in words:
        # Simple string hash
        h = 0
        for char in word:
            h = (31 * h + ord(char)) & 0xFFFFFFFF
            
        # Distribute the hash value across the vector
        index = h % dim
        value = (h / 0xFFFFFFFF) * 2 - 1  # Map to [-1, 1]
        vector[index] += value
        
    # L2 normalize
    norm = np.linalg.norm(vector)
    if norm > 0:
        vector = vector / norm
        
    return vector.tolist()

def store_memory(run_id: str, user_id: str, goal: str, findings: str) -> None:
    """
    Stores a new memory in the database.
    """
    if os.environ.get('MEMORY_ENABLED', '').lower() != 'true':
        return
        
    try:
        embedding = _generate_hash_embedding(goal)
        
        with SessionLocal() as db:
            memory = AgentMemory(
                run_id=run_id,
                user_id=user_id,
                goal_text=goal,
                embedding=embedding,
                findings=findings
            )
            db.add(memory)
            db.commit()
    except Exception as e:
        logger.error(f"Failed to store memory for run {run_id}: {e}")

def retrieve_memory(user_id: str, goal: str, top_k: int = 3) -> list[dict]:
    """
    Retrieves the most relevant memories for a given user and goal.
    """
    if os.environ.get('MEMORY_ENABLED', '').lower() != 'true':
        return []
        
    try:
        query_embedding = _generate_hash_embedding(goal)
        
        with SessionLocal() as db:
            # Use cosine_distance method provided by pgvector
            results = (
                db.query(AgentMemory, AgentMemory.embedding.cosine_distance(query_embedding).label("distance"))
                .filter(AgentMemory.user_id == user_id)
                .order_by("distance")
                .limit(top_k)
                .all()
            )
            
            memories = []
            now = datetime.now(timezone.utc)
            
            for memory, distance in results:
                # Convert distance to similarity (1 - distance for cosine)
                similarity = 1.0 - float(distance) if distance is not None else 0.0
                
                # Calculate age in days
                created_at = memory.created_at
                if created_at is None:
                    created_at = now
                elif created_at.tzinfo is None:
                    created_at = created_at.replace(tzinfo=timezone.utc)
                    
                age_days = (now - created_at).days
                
                # Decay 0.1 per week of age
                weeks_old = max(0, age_days / 7.0)
                freshness_weight = max(0.3, 1.0 - (0.1 * weeks_old))
                
                confidence = similarity * freshness_weight
                
                label = "[VERIFIED MEMORY]" if confidence > 0.7 else "[LOW CONFIDENCE — treat as hint]"
                
                memories.append({
                    "goal": memory.goal_text,
                    "findings": memory.findings,
                    "confidence": confidence,
                    "age_days": age_days,
                    "label": label
                })
                
            return memories
            
    except Exception as e:
        logger.error(f"Failed to retrieve memory for user {user_id}: {e}")
        return []
