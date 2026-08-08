import json
import time
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage
from agents.state import AgentState
from agents.emit import emit_event, log_observation

def planner_node(state: AgentState) -> AgentState:
    run_id = state["run_id"]
    goal = state["goal"]
    
    emit_event(run_id, "planner", "llm_call", "running", "Analyzing goal and generating DAG plan...")
    start_t = time.time()
    
    prompt = f"""You are the Planner Agent. Decompose the following goal into a JSON list of subtasks.
Goal: {goal}

Return ONLY valid JSON matching this schema:
{{
  "subtasks": [
    {{
      "id": "subtask_1",
      "type": "research" | "analyze" | "summarize" | "write",
      "description": "...",
      "depends_on": ["subtask_id", ...],
      "expected_output": "..."
    }}
  ]
}}"""

    try:
        llm = ChatGoogleGenerativeAI(model="gemini-3.5-flash-lite", temperature=0, max_retries=1)
        response = llm.invoke([HumanMessage(content=prompt)])
        
        # Parse JSON from response — handle both string and list content formats
        content = response.content
        if isinstance(content, list):
            # Newer Gemini models return a list of content parts
            content = "".join(
                part.get("text", str(part)) if isinstance(part, dict) else str(part)
                for part in content
            )
        content = str(content)
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0]
        elif "```" in content:
            content = content.split("```")[1].split("```")[0]
            
        plan_data = json.loads(content.strip())
        subtasks = plan_data.get("subtasks", [])
        
        # Initialize status for subtasks
        for st in subtasks:
            st["status"] = "pending"
            st["output"] = None
            st["error"] = None
            st["retry_count"] = 0
            
        state["subtasks"] = subtasks
        
        latency = int((time.time() - start_t) * 1000)
        emit_event(run_id, "planner", "llm_call", "complete", f"Generated {len(subtasks)} subtasks.", data=plan_data)
        log_observation(run_id, "planner", "llm_call", goal, f"Generated {len(subtasks)} subtasks", latency, True)
        
    except Exception as e:
        latency = int((time.time() - start_t) * 1000)
        error_msg = str(e)
        emit_event(run_id, "planner", "llm_call", "failed", f"Failed to generate plan: {error_msg}")
        log_observation(run_id, "planner", "llm_call", goal, "", latency, False, error_msg)
        state["subtasks"] = []

    return state
