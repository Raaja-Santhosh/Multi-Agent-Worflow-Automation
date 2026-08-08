from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.database import get_db
from app.models.db import TaskRun, FailureAttribution
from app.schemas.schemas import TaskRunCreate, TaskRunResponse
from app.auth.routes import get_current_user
from app.tasks.worker import run_agent_workflow

router = APIRouter(prefix="/task-runs", tags=["Tasks"])

@router.post("/", response_model=TaskRunResponse)
async def create_task_run(
    task_in: TaskRunCreate,
    db: AsyncSession = Depends(get_db),
):
    # H6 Fix: Set status to "running" immediately
    task_run = TaskRun(goal=task_in.goal, status="running")
    db.add(task_run)
    await db.commit()
    await db.refresh(task_run)
    
    run_agent_workflow.delay(str(task_run.id), task_in.goal)
    return task_run

@router.get("/", response_model=List[TaskRunResponse])
async def list_task_runs(
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(TaskRun).order_by(TaskRun.created_at.desc()))
    return result.scalars().all()

@router.get("/{task_id}", response_model=TaskRunResponse)
async def get_task_run(
    task_id: str,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(TaskRun).where(TaskRun.id == task_id))
    task_run = result.scalars().first()
    if not task_run:
        raise HTTPException(status_code=404, detail="TaskRun not found")
    return task_run

@router.get("/{task_id}/attribution")
async def get_failure_attribution(
    task_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve the failure attribution analysis for a specific task run.
    Returns the root cause agent, step, confidence, and explanation.
    """
    result = await db.execute(
        select(FailureAttribution)
        .where(FailureAttribution.run_id == task_id)
        .order_by(FailureAttribution.created_at.desc())
    )
    attribution = result.scalars().first()
    if not attribution:
        raise HTTPException(status_code=404, detail="No failure attribution found for this run")
    
    return {
        "run_id": str(attribution.run_id),
        "root_cause_agent": attribution.root_cause_agent,
        "root_cause_step": attribution.root_cause_step,
        "confidence": attribution.confidence,
        "explanation": attribution.explanation,
        "context_logs": attribution.context_logs,
        "created_at": attribution.created_at.isoformat() if attribution.created_at else None,
    }
