from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from typing import Dict, Any

from app.database import get_db
from app.models.db import ObsLog, TaskRun

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/metrics", response_model=Dict[str, Any])
async def get_metrics(db: AsyncSession = Depends(get_db)):
    """Fetch high level metrics for the Recharts dashboard."""
    # H5 Fix: Use SQL COUNT instead of loading all rows into memory
    total_runs_result = await db.execute(select(func.count(TaskRun.id)))
    total_runs = total_runs_result.scalar() or 0
    
    total_logs_result = await db.execute(select(func.count(ObsLog.id)))
    total_logs = total_logs_result.scalar() or 0
    
    # Count successes with SQL
    success_count_result = await db.execute(
        select(func.count(ObsLog.id)).where(ObsLog.success == True)
    )
    successes = success_count_result.scalar() or 0
    success_rate = (successes / total_logs * 100) if total_logs > 0 else 100
    
    # Calculate average latency per agent using SQL aggregation
    from sqlalchemy import case
    avg_latency_result = await db.execute(
        select(
            ObsLog.agent,
            func.avg(ObsLog.latency_ms).label("avg_latency")
        ).group_by(ObsLog.agent)
    )
    avg_latencies = [
        {"name": row.agent, "latency": round(row.avg_latency, 2) if row.avg_latency else 0}
        for row in avg_latency_result
    ]
    
    return {
        "total_task_runs": total_runs,
        "total_agent_invocations": total_logs,
        "success_rate_percentage": round(success_rate, 2),
        "avg_latencies_by_agent": avg_latencies
    }
