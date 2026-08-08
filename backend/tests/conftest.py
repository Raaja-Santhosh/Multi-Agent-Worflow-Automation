"""
Shared pytest fixtures for OrchestraAI backend tests.

This conftest patches heavy infrastructure (Redis, Postgres, LangChain model
constructors) at the module level BEFORE any agents code is imported, so that
tests never need real network connections or API keys.
"""
import sys
import pytest
from unittest.mock import MagicMock, patch


# ---------------------------------------------------------------------------
# Module-level mocking: prevent infrastructure connections on import
# ---------------------------------------------------------------------------
# agents.emit creates Redis clients and SQLAlchemy engines at import time.
# We install mocked versions of the underlying modules/objects BEFORE any
# test imports the agents package.

# 1. Mock the entire agents.emit module so no Redis/Postgres connection is made
_mock_emit = MagicMock()
_mock_emit.emit_event = MagicMock()
_mock_emit.log_observation = MagicMock()
sys.modules.setdefault("agents.emit", _mock_emit)


# ---------------------------------------------------------------------------
# Subtask factory helpers
# ---------------------------------------------------------------------------

def make_subtask(
    id: str = "subtask_1",
    type: str = "research",
    description: str = "Do research",
    depends_on: list = None,
    expected_output: str = "Research output",
    status: str = "pending",
    output: str = None,
    error: str = None,
    retry_count: int = 0,
) -> dict:
    """Create a single SubTask dict with sensible defaults."""
    return {
        "id": id,
        "type": type,
        "description": description,
        "depends_on": depends_on or [],
        "expected_output": expected_output,
        "status": status,
        "output": output,
        "error": error,
        "retry_count": retry_count,
    }


def make_state(
    run_id: str = "test-run-001",
    goal: str = "Write a report on AI trends",
    subtasks: list = None,
    current_subtask_id: str = None,
) -> dict:
    """Create a minimal AgentState dict with sensible defaults."""
    return {
        "run_id": run_id,
        "goal": goal,
        "subtasks": subtasks or [],
        "current_subtask_id": current_subtask_id,
        "memory_context": [],
        "research_results": [],
        "analysis_results": [],
        "critic_score": 0.0,
        "critic_issues": [],
        "critic_retry_prompt": None,
        "final_result": None,
    }


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def sample_subtask():
    """A single pending research subtask."""
    return make_subtask()


@pytest.fixture
def sample_state():
    """An AgentState with no subtasks."""
    return make_state()


@pytest.fixture
def state_with_pending_subtask():
    """An AgentState containing one pending research subtask."""
    return make_state(subtasks=[make_subtask()])


@pytest.fixture
def state_all_complete():
    """An AgentState where every subtask is already complete."""
    return make_state(subtasks=[
        make_subtask(id="subtask_1", status="complete", output="Research done"),
        make_subtask(id="subtask_2", type="write", status="complete", output="Written"),
    ])


@pytest.fixture
def state_with_dependencies():
    """An AgentState with subtask_2 depending on subtask_1."""
    return make_state(subtasks=[
        make_subtask(id="subtask_1", type="research", status="complete", output="Done"),
        make_subtask(
            id="subtask_2",
            type="analyze",
            depends_on=["subtask_1"],
            status="pending",
        ),
    ])


@pytest.fixture
def state_with_unmet_dependencies():
    """An AgentState with subtask_2 depending on an incomplete subtask_1."""
    return make_state(subtasks=[
        make_subtask(id="subtask_1", type="research", status="pending"),
        make_subtask(
            id="subtask_2",
            type="analyze",
            depends_on=["subtask_1"],
            status="pending",
        ),
    ])


@pytest.fixture
def mock_llm_response():
    """A MagicMock mimicking a LangChain LLM response with .content attribute."""
    resp = MagicMock()
    resp.content = "This is the LLM output."
    return resp


@pytest.fixture
def mock_llm(mock_llm_response):
    """A MagicMock LLM that returns mock_llm_response on .invoke()."""
    llm = MagicMock()
    llm.invoke.return_value = mock_llm_response
    return llm
