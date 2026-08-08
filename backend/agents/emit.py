import os
import json
import datetime
import uuid
import redis
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.config import settings
from app.models.db import ObsLog

# Sync Redis client for emit
redis_client = redis.Redis.from_url(settings.REDIS_URL)

# Sync DB engine for logging inside agents
# We use the sync psycopg2 driver for LangGraph nodes since they might be sync
db_url = settings.DATABASE_URL.replace("postgresql+asyncpg", "postgresql")
engine = create_engine(db_url)
SessionLocal = sessionmaker(bind=engine)

def emit_event(run_id: str, agent: str, tool: str, status: str, message: str, data: dict = None):
    """Publish WebSocket event to Redis."""
    event_payload = {
        "run_id": str(run_id),
        "agent": agent,
        "tool": tool,
        "status": status,
        "message": message,
        "data": data or {},
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }
    redis_client.publish(f"run:{run_id}", json.dumps(event_payload))

def log_observation(run_id: str, agent: str, tool: str, input_summary: str, output_summary: str, latency_ms: int, success: bool, error_msg: str = None):
    """Write to obs_logs table."""
    # C3 Fix: Safely parse UUID, skip DB write if invalid
    try:
        parsed_run_id = uuid.UUID(str(run_id))
    except (ValueError, AttributeError):
        # If run_id is not a valid UUID (e.g., during testing), skip the DB write
        # but don't crash the caller's error handler
        print(f"[emit] WARNING: Skipping obs_log write — invalid run_id: {run_id}")
        return
    
    try:
        with SessionLocal() as db:
            obs = ObsLog(
                run_id=parsed_run_id,
                agent=agent,
                tool=tool,
                input_summary=input_summary[:500] if input_summary else "",
                output_summary=output_summary[:500] if output_summary else "",
                latency_ms=latency_ms,
                success=success,
                error_msg=error_msg[:1000] if error_msg else None
            )
            db.add(obs)
            db.commit()
    except Exception as e:
        # Never let a logging failure crash the agent pipeline
        print(f"[emit] WARNING: Failed to write obs_log: {e}")
