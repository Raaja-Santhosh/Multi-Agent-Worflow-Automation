"""
Failure Attribution Engine for OrchestraAI

ADR: This module is responsible for analyzing execution logs of a run and determining
the root cause of failure. It uses the LLM to process logs around the failure point
and attributes the failure to a specific agent and step.
"""

import json
import logging
from app.models.db import FailureAttribution, ObsLog
from agents.emit import SessionLocal
from agents.llm import get_llm

logger = logging.getLogger(__name__)

def run_attribution(run_id: str) -> dict | None:
    """
    Analyzes logs for a given run ID to attribute the root cause of a failure.
    
    Args:
        run_id: The ID of the run to analyze.
        
    Returns:
        A dictionary containing the attribution details if a failure occurred, 
        otherwise None. Returns None on errors as well.
    """
    try:
        with SessionLocal() as db:
            # Query all logs for the run, ordered by creation time
            logs = db.query(ObsLog).filter(ObsLog.run_id == run_id).order_by(ObsLog.created_at.asc()).all()
            
            if not logs:
                return None
                
            # Find the first log where success=False
            failure_index = -1
            for i, log in enumerate(logs):
                if hasattr(log, 'success') and not log.success:
                    failure_index = i
                    break
                    
            if failure_index == -1:
                return None
                
            # Gather context: 2 logs before, the failure log, 2 logs after
            start_idx = max(0, failure_index - 2)
            end_idx = min(len(logs), failure_index + 3)
            context_logs = logs[start_idx:end_idx]
            
            # Format logs for the LLM
            log_text = "\n".join([f"Step: {getattr(log, 'step_name', 'unknown')}, Agent: {getattr(log, 'agent_id', 'unknown')}, Success: {getattr(log, 'success', False)}, Details: {getattr(log, 'details', '')}" for log in context_logs])
            
            prompt = (
                "You are a Failure Attribution Engine. Based on the following execution logs, "
                "identify the root cause of the failure.\n\n"
                f"Logs:\n{log_text}\n\n"
                "Provide your response in JSON format with the following keys:\n"
                "- 'root_cause_agent': (string) The agent responsible for the failure.\n"
                "- 'root_cause_step': (string) The step where the root cause occurred.\n"
                "- 'confidence': (float between 0.0 and 1.0) Your confidence in this attribution.\n"
                "- 'explanation': (string) A one-sentence explanation of the failure."
            )
            
            llm = get_llm(temperature=0.0)
            response_text = llm.invoke(prompt)
            
            # Extract JSON from response if needed (naive approach assuming pure JSON or code block)
            try:
                # Basic cleanup in case of markdown backticks
                if "```json" in response_text:
                    json_str = response_text.split("```json")[1].split("```")[0].strip()
                elif "```" in response_text:
                    json_str = response_text.split("```")[1].split("```")[0].strip()
                else:
                    json_str = response_text.strip()
                    
                attribution_data = json.loads(json_str)
            except json.JSONDecodeError:
                logger.error(f"Failed to parse LLM response as JSON: {response_text}")
                return None
                
            # Create a FailureAttribution record
            attribution_record = FailureAttribution(
                run_id=run_id,
                root_cause_agent=attribution_data.get('root_cause_agent'),
                root_cause_step=attribution_data.get('root_cause_step'),
                confidence=float(attribution_data.get('confidence', 0.0)),
                explanation=attribution_data.get('explanation')
            )
            db.add(attribution_record)
            db.commit()
            
            return attribution_data
            
    except Exception as e:
        logger.error(f"Error in run_attribution for run {run_id}: {e}")
        return None
