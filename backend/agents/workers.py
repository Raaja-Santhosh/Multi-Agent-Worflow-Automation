import time
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage
from agents.state import AgentState
from agents.emit import emit_event, log_observation

def execute_worker_node(state: AgentState) -> AgentState:
    run_id = state["run_id"]
    goal = state["goal"]
    st_id = None
    subtask = None
    for st in state.get("subtasks", []):
        if st["status"] in ["pending", "retrying"]:
            st_id = st["id"]
            subtask = st
            break
            
    if not subtask:
        return state
        
    state["current_subtask_id"] = st_id

    agent_type = subtask["type"]
    desc = subtask.get("description", "")
    expected = subtask.get("expected_output", "")
    
    emit_event(run_id, agent_type, "llm_call", "running", f"Generating content for {st_id}")
    start_t = time.time()
    
    # Optional: compile memory/context from previously completed subtasks
    context_blocks = []
    for st in state.get("subtasks", []):
        if st["status"] == "complete" and st.get("output") and st["id"] != st_id:
            context_blocks.append(f"--- Output from {st['id']} ({st['type']}) ---\n{st['output']}")
            
    context_str = "\n\n".join(context_blocks)
    
    prompt = f"""You are an elite autonomous AI agent acting as a {agent_type}.
Your overarching mission is to contribute to this ultimate goal: {goal}

Your specific assignment right now is:
{desc}

Your output must fulfill this criteria:
{expected}

"""
    if context_str:
        prompt += f"\nHere is the context of work previously completed by other agents:\n{context_str}\n"
        
    prompt += "\nPlease produce your final deliverable now. Format your response cleanly using Markdown."

    try:
        llm = ChatGoogleGenerativeAI(model="gemini-3.5-flash-lite", temperature=0.4, max_retries=1)
        response = llm.invoke([HumanMessage(content=prompt)])
        
        raw = response.content
        if isinstance(raw, list):
            raw = "".join(
                part.get("text", str(part)) if isinstance(part, dict) else str(part)
                for part in raw
            )
        output = str(raw).strip()
        subtask["output"] = output
        subtask["status"] = "complete"
        
        latency = int((time.time() - start_t) * 1000)
        emit_event(run_id, agent_type, "llm_call", "complete", f"Successfully completed {st_id}")
        log_observation(run_id, agent_type, "llm_call", desc, "Generated response", latency, True)
        
    except Exception as e:
        latency = int((time.time() - start_t) * 1000)
        error_msg = str(e)
        subtask["status"] = "failed"
        subtask["error"] = error_msg
        emit_event(run_id, agent_type, "llm_call", "failed", f"Execution failed: {error_msg}")
        log_observation(run_id, agent_type, "llm_call", desc, "", latency, False, error_msg)

    return state
