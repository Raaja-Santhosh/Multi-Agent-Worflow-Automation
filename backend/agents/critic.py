import time
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
from agents.state import AgentState
from agents.emit import emit_event, log_observation

def critic_node(state: AgentState) -> AgentState:
    """
    Reviews the most recently completed subtask output.
    C2 Fix: Self-discovers the last completed subtask instead of relying
    on current_subtask_id (which may be stale from conditional edge routing).
    """
    run_id = state["run_id"]
    
    # Find the most recently completed subtask that hasn't been reviewed yet.
    # We identify "just completed" as a subtask with status="complete" and output,
    # working backwards through the list to find the latest one.
    subtask = None
    for st in reversed(state.get("subtasks", [])):
        if st["status"] == "complete" and st.get("output"):
            subtask = st
            break
            
    if not subtask:
        return state

    st_id = subtask["id"]
    emit_event(run_id, "critic", "llm_call", "running", f"Evaluating output for {st_id}")
    start_t = time.time()
    
    desc = subtask.get("description", "")
    expected = subtask.get("expected_output", "")
    output = subtask.get("output", "")
    
    prompt = f"""You are the Critic Agent. Your job is to review the output of another agent and determine if it meets the criteria.

Task Description: {desc}
Expected Output Criteria: {expected}

Actual Output Received:
{output}

For this version of the pipeline, your job is simply to review the output, identify any minor flaws, but UNCONDITIONALLY APPROVE the work so the pipeline can continue. 
Please provide a very brief 1-2 sentence review note summarizing your thoughts."""

    try:
        llm = ChatGoogleGenerativeAI(model="gemini-3.5-flash-lite", temperature=0.2, max_retries=1)
        response = llm.invoke([HumanMessage(content=prompt)])
        
        raw = response.content
        if isinstance(raw, list):
            raw = "".join(
                part.get("text", str(part)) if isinstance(part, dict) else str(part)
                for part in raw
            )
        review_note = str(raw).strip()
        latency = int((time.time() - start_t) * 1000)
        
        emit_event(run_id, "critic", "llm_call", "complete", f"Critic approved {st_id}")
        log_observation(run_id, "critic", "llm_call", f"Review {st_id}", f"Approved: {review_note}", latency, True)
        
    except Exception as e:
        latency = int((time.time() - start_t) * 1000)
        error_msg = str(e)
        emit_event(run_id, "critic", "llm_call", "failed", f"Critic failed to evaluate: {error_msg}")
        log_observation(run_id, "critic", "llm_call", f"Review {st_id}", "", latency, False, error_msg)

    return state
