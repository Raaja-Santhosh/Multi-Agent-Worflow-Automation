from langgraph.graph import StateGraph, END
from agents.state import AgentState
from agents.planner import planner_node
from agents.emit import emit_event, log_observation
from agents.workers import execute_worker_node
from agents.critic import critic_node

def router_node(state: AgentState) -> str:
    """
    Examines the subtasks and routes to the next pending subtask worker.
    If all subtasks are complete, routes to END.
    
    IMPORTANT: This is a conditional edge function — it must NOT mutate state.
    It only inspects state and returns a routing key string.
    """
    for subtask in state.get("subtasks", []):
        # H3 Fix: Check dependency fulfillment before routing
        depends_on = subtask.get("depends_on", [])
        all_deps_met = True
        for dep_id in depends_on:
            for other in state.get("subtasks", []):
                if other["id"] == dep_id and other["status"] != "complete":
                    all_deps_met = False
                    break
            if not all_deps_met:
                break
        
        if not all_deps_met:
            continue  # Skip this subtask, its dependencies aren't done yet
            
        if subtask["status"] in ["pending", "retrying"]:
            emit_event(state["run_id"], "router", "none", "running", f"Routing subtask {subtask['id']} to {subtask['type']}")
            # C1 Fix: Do NOT mutate state here. Workers self-assign.
            return subtask["type"]
            
    emit_event(state["run_id"], "router", "none", "complete", "All subtasks completed.")
    return END

# Build the Graph
workflow = StateGraph(AgentState)

workflow.add_node("planner", planner_node)
workflow.add_node("research", execute_worker_node)
workflow.add_node("analyze", execute_worker_node)
workflow.add_node("summarize", execute_worker_node)
workflow.add_node("write", execute_worker_node)
workflow.add_node("critic", critic_node)

workflow.set_entry_point("planner")

# After planner, go to router (conditional edge)
workflow.add_conditional_edges("planner", router_node, {
    "research": "research",
    "analyze": "analyze",
    "summarize": "summarize",
    "write": "write",
    END: END
})

# All workers go to critic
workflow.add_edge("research", "critic")
workflow.add_edge("analyze", "critic")
workflow.add_edge("summarize", "critic")
workflow.add_edge("write", "critic")

# Critic goes back to router to pick next task (or retry)
workflow.add_conditional_edges("critic", router_node, {
    "research": "research",
    "analyze": "analyze",
    "summarize": "summarize",
    "write": "write",
    END: END
})

app = workflow.compile()
