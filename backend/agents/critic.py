"""
Critic Agent — Autonomous Quality Gate with Scoring and Retry Routing.

Architecture Decision Record (ADR):
    The Critic evaluates each worker's output against the original task criteria
    and returns a numeric quality score (0.0–1.0). If the score falls below 0.6
    AND the subtask has been retried fewer than 2 times, the router loops the
    subtask back to the worker with a corrective prompt from the Critic.

    This creates a genuine self-correction loop — the single most impressive
    demo moment in the project. Submit a vague goal, watch the Critic reject
    a subtask, and see the worker retry with corrective feedback.
"""

import time
import json
from langchain_core.messages import HumanMessage
from agents.state import AgentState
from agents.emit import emit_event, log_observation
from agents.llm import get_llm, _normalize_content

# Keywords that indicate quality issues in the Critic's assessment
REJECTION_KEYWORDS = [
    "incomplete", "insufficient", "missing", "unclear", "incorrect",
    "vague", "superficial", "lacks", "absent", "shallow", "inaccurate"
]

MAX_RETRIES = 2
QUALITY_THRESHOLD = 0.6


def _parse_critic_score(review_text: str) -> tuple[float, str]:
    """
    Extract a numeric score and feedback from the Critic's LLM response.
    
    Strategy:
    1. Try to parse JSON with explicit score field
    2. Fall back to keyword-based scoring from natural language
    """
    # Attempt 1: Parse JSON response
    try:
        clean = review_text.strip()
        if "```json" in clean:
            clean = clean.split("```json")[1].split("```")[0]
        elif "```" in clean:
            clean = clean.split("```")[1].split("```")[0]
        
        data = json.loads(clean)
        score = float(data.get("score", data.get("quality_score", 0.7)))
        feedback = data.get("feedback", data.get("issues", review_text))
        if isinstance(feedback, list):
            feedback = "; ".join(feedback)
        return (min(max(score, 0.0), 1.0), str(feedback))
    except (json.JSONDecodeError, ValueError, KeyError):
        pass
    
    # Attempt 2: Keyword-based scoring
    lower = review_text.lower()
    rejection_count = sum(1 for kw in REJECTION_KEYWORDS if kw in lower)
    
    if rejection_count >= 3:
        score = 0.3
    elif rejection_count >= 2:
        score = 0.5
    elif rejection_count >= 1:
        score = 0.65
    else:
        score = 0.85
    
    return (score, review_text)


def critic_node(state: AgentState) -> AgentState:
    """
    Reviews the most recently completed subtask output and scores it.
    
    If score < 0.6 and retry_count < 2:
        → Set subtask status to 'retrying' with critic feedback
        → Router will loop it back to the worker
    If score < 0.6 and retry_count >= 2:
        → Mark subtask as 'failed' — move on
    If score >= 0.6:
        → Approved — router moves to next subtask
    """
    run_id = state["run_id"]
    
    # Find the most recently completed subtask
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
    retry_count = subtask.get("retry_count", 0)
    
    prompt = f"""You are the Critic Agent. Evaluate the following output against the task criteria.

Task Description: {desc}
Expected Output Criteria: {expected}

Actual Output Received:
{output[:3000]}

Return your evaluation as JSON:
{{
  "score": <float 0.0 to 1.0, where 1.0 is perfect>,
  "feedback": "<specific issues found, or 'Output meets all criteria' if good>"
}}

Scoring guide:
- 1.0: Exceptional, exceeds criteria
- 0.8: Good, meets all criteria with minor stylistic notes
- 0.6: Acceptable, meets minimum criteria
- 0.4: Below standard, missing key elements
- 0.2: Poor, fundamentally incomplete or incorrect

Be fair but rigorous. Focus on whether the core requirements are met."""

    try:
        llm = get_llm(temperature=0.1)
        response = llm.invoke([HumanMessage(content=prompt)])
        
        review_text = _normalize_content(response.content).strip()
        score, feedback = _parse_critic_score(review_text)
        latency = int((time.time() - start_t) * 1000)
        
        # Store score in state
        state["critic_score"] = score
        
        if score >= QUALITY_THRESHOLD:
            # APPROVED — subtask stays as 'complete'
            emit_event(run_id, "critic", "llm_call", "complete",
                       f"Approved {st_id} (score: {score:.2f})")
            log_observation(run_id, "critic", "llm_call",
                           f"Review {st_id}", f"Approved (score={score:.2f}): {feedback[:200]}",
                           latency, True)
        
        elif retry_count < MAX_RETRIES:
            # REJECTED + RETRY — send back to worker with feedback
            subtask["status"] = "retrying"
            subtask["retry_count"] = retry_count + 1
            subtask["retry_prompt"] = feedback
            state["critic_issues"].append(f"{st_id}: {feedback[:200]}")
            
            emit_event(run_id, "critic", "llm_call", "retrying",
                       f"Rejected {st_id} (score: {score:.2f}, retry {retry_count + 1}/{MAX_RETRIES}). Issues: {feedback[:100]}")
            log_observation(run_id, "critic", "llm_call",
                           f"Review {st_id}", f"Rejected (score={score:.2f}): {feedback[:200]}",
                           latency, True)
        
        else:
            # REJECTED + MAX RETRIES — mark as failed, move on
            subtask["status"] = "failed"
            subtask["error"] = f"Critic rejected after {MAX_RETRIES} retries: {feedback[:300]}"
            state["critic_issues"].append(f"{st_id}: FAILED after {MAX_RETRIES} retries")
            
            emit_event(run_id, "critic", "llm_call", "failed",
                       f"Failed {st_id} after {MAX_RETRIES} retries (score: {score:.2f})")
            log_observation(run_id, "critic", "llm_call",
                           f"Review {st_id}", f"Failed (score={score:.2f}): {feedback[:200]}",
                           latency, False, f"Max retries exceeded")
        
    except Exception as e:
        latency = int((time.time() - start_t) * 1000)
        error_msg = str(e)
        # On critic failure, approve to avoid blocking the pipeline
        emit_event(run_id, "critic", "llm_call", "complete",
                   f"Critic error on {st_id}, auto-approving: {error_msg[:100]}")
        log_observation(run_id, "critic", "llm_call",
                       f"Review {st_id}", "", latency, False, error_msg)

    return state
