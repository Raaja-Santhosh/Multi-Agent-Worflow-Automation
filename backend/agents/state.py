from typing import TypedDict, List, Dict, Any, Optional
class SubTask(TypedDict):
    id: str
    type: str # 'research', 'analyze', 'summarize', 'write'
    description: str
    depends_on: List[str]
    expected_output: str
    status: str # 'pending', 'running', 'complete', 'failed', 'retrying'
    output: Optional[str]
    error: Optional[str]
    retry_count: int

class AgentState(TypedDict):
    run_id: str
    goal: str
    subtasks: List[SubTask]
    current_subtask_id: Optional[str]
    
    # Accumulated context
    memory_context: List[str]
    research_results: List[Dict[str, Any]]
    analysis_results: List[Dict[str, Any]]
    
    # Critic State
    critic_score: float
    critic_issues: List[str]
    critic_retry_prompt: Optional[str]
    
    final_result: Optional[str]
