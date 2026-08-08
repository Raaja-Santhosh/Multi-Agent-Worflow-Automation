import os
import json
from datetime import datetime, timezone
from celery import Celery
import redis
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "orchestra_tasks",
    broker=REDIS_URL,
    backend=REDIS_URL
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

# H1 Fix: Create DB engine once at module level, not per-invocation
_sync_engine = None
_SyncSessionLocal = None

def _get_sync_session():
    """Lazy-init a module-level sync DB session factory."""
    global _sync_engine, _SyncSessionLocal
    if _sync_engine is None:
        from app.config import settings
        db_url = settings.DATABASE_URL.replace("postgresql+asyncpg", "postgresql")
        _sync_engine = create_engine(db_url, pool_pre_ping=True)
        _SyncSessionLocal = sessionmaker(bind=_sync_engine)
    return _SyncSessionLocal()

@celery_app.task(bind=True, name="app.tasks.worker.run_agent_workflow")
def run_agent_workflow(self, run_id: str, goal: str):
    """
    Entry point for Celery to execute the LangGraph workflow.
    """
    import sys
    # Add backend root to sys.path so agents module can be found
    backend_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))
    if backend_root not in sys.path:
        sys.path.append(backend_root)
        
    from agents.graph import app
    from agents.emit import emit_event
    from app.models.db import TaskRun
    
    emit_event(run_id, "system", "none", "running", f"Starting LangGraph workflow for goal: {goal}")
    
    initial_state = {
        "run_id": run_id,
        "goal": goal,
        "subtasks": [],
        "current_subtask_id": None,
        "memory_context": [],
        "research_results": [],
        "analysis_results": [],
        "critic_score": 0.0,
        "critic_issues": [],
        "critic_retry_prompt": None,
        "final_result": None
    }
    
    try:
        # C4 Fix: Set generous recursion_limit for complex multi-subtask workflows
        final_state = app.invoke(initial_state, config={"recursion_limit": 150})
        
        # C5 Fix: Check if the planner actually produced subtasks
        subtasks = final_state.get("subtasks", [])
        has_completed_work = any(st.get("status") == "complete" and st.get("output") for st in subtasks)
        
        if not subtasks or not has_completed_work:
            # Planner failed or produced no work — mark as failed, not complete
            emit_event(run_id, "system", "none", "failed", "Workflow produced no output — planner may have failed.")
            with _get_sync_session() as db:
                task = db.query(TaskRun).filter(TaskRun.id == run_id).first()
                if task:
                    task.status = "failed"
                    task.result = "No output was generated. The planner may have encountered an error."
                    task.completed_at = datetime.now(timezone.utc)  # H2 Fix
                    db.commit()
            return {"status": "failed", "run_id": run_id}
        
        emit_event(run_id, "system", "none", "complete", "LangGraph workflow completed successfully.")
        
        # Save final result to Postgres
        with _get_sync_session() as db:
            task = db.query(TaskRun).filter(TaskRun.id == run_id).first()
            if task:
                task.status = "complete"
                task.completed_at = datetime.now(timezone.utc)  # H2 Fix
                
                final_res = final_state.get("final_result")
                if not final_res:
                    outputs = []
                    for st in subtasks:
                        if st.get("status") == "complete" and st.get("output"):
                            outputs.append(f"## {str(st['type']).capitalize()} Phase\n{st['output']}")
                    
                    if outputs:
                        final_res = "# Orchestration Deliverable\n\n" + "\n\n".join(outputs)
                    else:
                        final_res = "No final output generated."
                        
                task.result = final_res
                db.commit()
                
    except Exception as e:
        emit_event(run_id, "system", "none", "failed", f"Workflow failed: {str(e)}")
        
        with _get_sync_session() as db:
            task = db.query(TaskRun).filter(TaskRun.id == run_id).first()
            if task:
                task.status = "failed"
                task.result = str(e)
                task.completed_at = datetime.now(timezone.utc)  # H2 Fix
                db.commit()
    
    return {"status": "finished", "run_id": run_id}
