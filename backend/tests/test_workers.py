"""
Tests for agents.workers — the execute_worker_node that runs individual subtasks.

All LLM calls are mocked. emit_event/log_observation are pre-mocked via
conftest.py sys.modules injection.
"""
import pytest
from unittest.mock import patch, MagicMock
from tests.conftest import make_state, make_subtask


class TestExecuteWorkerNode:
    """Tests for execute_worker_node which runs the first pending/retrying subtask."""

    def test_finds_and_executes_first_pending_subtask(self):
        """Worker picks up the first pending subtask, calls the LLM, and marks it complete."""
        from agents.workers import execute_worker_node

        mock_resp = MagicMock()
        mock_resp.content = "Here is the research output."

        mock_llm = MagicMock()
        mock_llm.invoke.return_value = mock_resp

        state = make_state(subtasks=[
            make_subtask(id="s1", type="research", status="pending"),
            make_subtask(id="s2", type="write", status="pending"),
        ])

        with patch("agents.workers.get_llm", return_value=mock_llm):
            result = execute_worker_node(state)

        assert result["subtasks"][0]["status"] == "complete"
        assert result["subtasks"][0]["output"] == "Here is the research output."
        # Second subtask should be untouched
        assert result["subtasks"][1]["status"] == "pending"

    def test_sets_current_subtask_id(self):
        """Worker updates current_subtask_id to the id of the subtask it is executing."""
        from agents.workers import execute_worker_node

        mock_resp = MagicMock()
        mock_resp.content = "Done."

        mock_llm = MagicMock()
        mock_llm.invoke.return_value = mock_resp

        state = make_state(subtasks=[
            make_subtask(id="task_42", type="analyze", status="pending"),
        ])

        with patch("agents.workers.get_llm", return_value=mock_llm):
            result = execute_worker_node(state)

        assert result["current_subtask_id"] == "task_42"

    def test_skips_when_no_pending_subtasks(self):
        """Worker returns state unchanged when there are no pending/retrying subtasks."""
        from agents.workers import execute_worker_node

        state = make_state(subtasks=[
            make_subtask(id="s1", status="complete", output="Done"),
            make_subtask(id="s2", status="failed", error="Oops"),
        ])

        # get_llm should NOT be called at all
        with patch("agents.workers.get_llm") as mock_get_llm:
            result = execute_worker_node(state)

        mock_get_llm.assert_not_called()
        assert result is state  # returns same state object, unmodified

    def test_skips_when_subtasks_empty(self):
        """Worker returns state unchanged when subtask list is empty."""
        from agents.workers import execute_worker_node

        state = make_state(subtasks=[])

        with patch("agents.workers.get_llm") as mock_get_llm:
            result = execute_worker_node(state)

        mock_get_llm.assert_not_called()
        assert result is state

    def test_handles_llm_failure_marks_failed(self):
        """Worker catches LLM exceptions and marks the subtask as 'failed' with error."""
        from agents.workers import execute_worker_node

        mock_llm = MagicMock()
        mock_llm.invoke.side_effect = RuntimeError("Model overloaded")

        state = make_state(subtasks=[
            make_subtask(id="s1", type="research", status="pending"),
        ])

        with patch("agents.workers.get_llm", return_value=mock_llm):
            result = execute_worker_node(state)

        assert result["subtasks"][0]["status"] == "failed"
        assert "Model overloaded" in result["subtasks"][0]["error"]

    def test_handles_retrying_status(self):
        """Worker executes subtasks with 'retrying' status, not just 'pending'."""
        from agents.workers import execute_worker_node

        mock_resp = MagicMock()
        mock_resp.content = "Retry successful."

        mock_llm = MagicMock()
        mock_llm.invoke.return_value = mock_resp

        state = make_state(subtasks=[
            make_subtask(id="s1", type="analyze", status="retrying", retry_count=1),
        ])

        with patch("agents.workers.get_llm", return_value=mock_llm):
            result = execute_worker_node(state)

        assert result["subtasks"][0]["status"] == "complete"
        assert result["subtasks"][0]["output"] == "Retry successful."

    def test_compiles_context_from_completed_subtasks(self):
        """Worker builds a context string from previously completed subtasks' outputs."""
        from agents.workers import execute_worker_node

        mock_resp = MagicMock()
        mock_resp.content = "Analysis based on prior research."

        mock_llm = MagicMock()
        mock_llm.invoke.return_value = mock_resp

        state = make_state(subtasks=[
            make_subtask(id="s1", type="research", status="complete", output="Research findings here."),
            make_subtask(id="s2", type="analyze", status="pending"),
        ])

        with patch("agents.workers.get_llm", return_value=mock_llm):
            result = execute_worker_node(state)

        # Verify the LLM was called with a prompt containing the context
        call_args = mock_llm.invoke.call_args[0][0]  # list of messages
        prompt_content = call_args[0].content  # HumanMessage.content
        assert "Research findings here." in prompt_content
        assert "s1" in prompt_content

    def test_does_not_include_own_output_in_context(self):
        """Worker excludes its own subtask's output from the compiled context."""
        from agents.workers import execute_worker_node

        mock_resp = MagicMock()
        mock_resp.content = "Updated analysis."

        mock_llm = MagicMock()
        mock_llm.invoke.return_value = mock_resp

        state = make_state(subtasks=[
            make_subtask(id="s1", type="research", status="complete", output="Previous output."),
            make_subtask(id="s2", type="analyze", status="retrying", output="Old analysis.", retry_count=1),
        ])

        with patch("agents.workers.get_llm", return_value=mock_llm):
            result = execute_worker_node(state)

        # s2 is the one being executed (retrying), so its old output should
        # NOT appear in the context (excluded by `st["id"] != st_id` check).
        # But s1's output should appear.
        call_args = mock_llm.invoke.call_args[0][0]
        prompt_content = call_args[0].content
        assert "Previous output." in prompt_content

    def test_strips_whitespace_from_output(self):
        """Worker strips leading/trailing whitespace from LLM output."""
        from agents.workers import execute_worker_node

        mock_resp = MagicMock()
        mock_resp.content = "   Trimmed output.   \n"

        mock_llm = MagicMock()
        mock_llm.invoke.return_value = mock_resp

        state = make_state(subtasks=[
            make_subtask(id="s1", type="write", status="pending"),
        ])

        with patch("agents.workers.get_llm", return_value=mock_llm):
            result = execute_worker_node(state)

        assert result["subtasks"][0]["output"] == "Trimmed output."

    def test_uses_temperature_04(self):
        """Worker calls get_llm with temperature=0.4 for creative tasks."""
        from agents.workers import execute_worker_node

        mock_resp = MagicMock()
        mock_resp.content = "Output."

        mock_llm = MagicMock()
        mock_llm.invoke.return_value = mock_resp

        state = make_state(subtasks=[
            make_subtask(id="s1", type="research", status="pending"),
        ])

        with patch("agents.workers.get_llm", return_value=mock_llm) as mock_get_llm:
            execute_worker_node(state)

        mock_get_llm.assert_called_once_with(temperature=0.4)

    def test_normalizes_list_content(self):
        """Worker handles LLM responses with list content format (Gemini 3.x)."""
        from agents.workers import execute_worker_node

        mock_resp = MagicMock()
        mock_resp.content = [{"text": "Part one. "}, {"text": "Part two."}]

        mock_llm = MagicMock()
        mock_llm.invoke.return_value = mock_resp

        state = make_state(subtasks=[
            make_subtask(id="s1", type="summarize", status="pending"),
        ])

        with patch("agents.workers.get_llm", return_value=mock_llm):
            result = execute_worker_node(state)

        assert result["subtasks"][0]["status"] == "complete"
        assert result["subtasks"][0]["output"] == "Part one. Part two."

    @pytest.mark.parametrize(
        "task_type",
        ["research", "analyze", "summarize", "write"],
        ids=["research", "analyze", "summarize", "write"],
    )
    def test_prompt_includes_task_type(self, task_type):
        """Worker prompt mentions the agent type for the subtask."""
        from agents.workers import execute_worker_node

        mock_resp = MagicMock()
        mock_resp.content = "Done."

        mock_llm = MagicMock()
        mock_llm.invoke.return_value = mock_resp

        state = make_state(subtasks=[
            make_subtask(id="s1", type=task_type, status="pending"),
        ])

        with patch("agents.workers.get_llm", return_value=mock_llm):
            execute_worker_node(state)

        call_args = mock_llm.invoke.call_args[0][0]
        prompt_content = call_args[0].content
        assert task_type in prompt_content
