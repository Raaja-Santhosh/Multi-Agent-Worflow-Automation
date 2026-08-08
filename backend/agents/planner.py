"""
Planner Agent — Goal Decomposition with Cross-Session Memory.

If MEMORY_ENABLED=true, the Planner retrieves semantically similar past runs
from PostgreSQL (pgvector) and injects them into the planning context. This
allows the system to learn from prior sessions — the single most concrete
proof that the platform is more than a stateless LLM wrapper.
"""

import json
import time
from langchain_core.messages import HumanMessage
from agents.state import AgentState
from agents.emit import emit_event, log_observation
from agents.llm import get_llm, _normalize_content


def _retrieve_memories(goal: str) -> str:
    """Retrieve relevant memories from past sessions, if enabled."""
    try:
        from agents.memory import retrieve_memory
        memories = retrieve_memory(user_id=None, goal=goal, top_k=3)
        if not memories:
            return ""
        
        blocks = []
        for m in memories:
            label = m.get("label", "[MEMORY]")
            past_goal = m.get("goal", "")
            findings = m.get("findings", "")
            confidence = m.get("confidence", 0.0)
            blocks.append(
                f"{label} (confidence: {confidence:.0%})\n"
                f"Past Goal: {past_goal}\n"
                f"Key Findings: {findings[:500]}"
            )
        return "\n\n".join(blocks)
    except Exception:
        return ""


def planner_node(state: AgentState) -> AgentState:
    run_id = state["run_id"]
    goal = state["goal"]
    
    emit_event(run_id, "planner", "llm_call", "running", "Analyzing goal and generating DAG plan...")
    start_t = time.time()
    
    # Retrieve memories from past sessions
    memory_context = _retrieve_memories(goal)
    if memory_context:
        emit_event(run_id, "planner", "memory", "complete", "Retrieved relevant memories from past sessions")
    
    prompt = f"""You are the Planner Agent. Decompose the following goal into a JSON list of subtasks.
Goal: {goal}
"""

    if memory_context:
        prompt += f"""
Here is relevant context from past sessions that may help you plan better:
{memory_context}

Use this context to inform your subtask design, but always generate a fresh plan.
"""

    prompt += """
Return ONLY valid JSON matching this schema:
{
  "subtasks": [
    {
      "id": "subtask_1",
      "type": "research" | "analyze" | "summarize" | "write",
      "description": "...",
      "depends_on": ["subtask_id", ...],
      "expected_output": "..."
    }
  ]
}"""

    try:
        llm = get_llm(temperature=0.0)
        response = llm.invoke([HumanMessage(content=prompt)])
        
        # Parse JSON from response
        content = _normalize_content(response.content)
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0]
        elif "```" in content:
            content = content.split("```")[1].split("```")[0]
            
        plan_data = json.loads(content.strip())
        subtasks = plan_data.get("subtasks", [])
        
        # Initialize status fields for each subtask
        for st in subtasks:
            st["status"] = "pending"
            st["output"] = None
            st["error"] = None
            st["retry_count"] = 0
            st["retry_prompt"] = None
            st["sources"] = []
            
        state["subtasks"] = subtasks
        
        latency = int((time.time() - start_t) * 1000)
        emit_event(run_id, "planner", "llm_call", "complete",
                   f"Generated {len(subtasks)} subtasks.", data=plan_data)
        log_observation(run_id, "planner", "llm_call", goal,
                       f"Generated {len(subtasks)} subtasks", latency, True)
        
    except Exception as e:
        latency = int((time.time() - start_t) * 1000)
        error_msg = str(e)
        emit_event(run_id, "planner", "llm_call", "failed",
                   f"Failed to generate plan: {error_msg}")
        log_observation(run_id, "planner", "llm_call", goal, "", latency, False, error_msg)
        state["subtasks"] = []

    return state
