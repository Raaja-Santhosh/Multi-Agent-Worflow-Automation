"""
Tests for agents.planner — the planner_node that decomposes goals into subtask DAGs.

All LLM calls are mocked. emit_event/log_observation are pre-mocked via
conftest.py sys.modules injection.
"""
import json
import pytest
from unittest.mock import patch, MagicMock
from tests.conftest import make_state


class TestPlannerNode:
    """Tests for planner_node which parses LLM JSON output into subtasks."""

    def test_parses_valid_json_response(self):
        """planner_node correctly parses a clean JSON response from the LLM."""
        from agents.planner import planner_node

        plan_json = json.dumps({
            "subtasks": [
                {
                    "id": "subtask_1",
                    "type": "research",
                    "description": "Research AI trends",
                    "depends_on": [],
                    "expected_output": "A summary of trends",
                },
                {
                    "id": "subtask_2",
                    "type": "write",
                    "description": "Write the report",
                    "depends_on": ["subtask_1"],
                    "expected_output": "Final report",
                },
            ]
        })

        mock_resp = MagicMock()
        mock_resp.content = plan_json

        mock_llm = MagicMock()
        mock_llm.invoke.return_value = mock_resp

        with patch("agents.planner.get_llm", return_value=mock_llm):
            state = make_state()
            result = planner_node(state)

        assert len(result["subtasks"]) == 2
        assert result["subtasks"][0]["id"] == "subtask_1"
        assert result["subtasks"][1]["depends_on"] == ["subtask_1"]

    def test_handles_json_fenced_response(self):
        """planner_node strips ```json ... ``` fencing before parsing."""
        from agents.planner import planner_node

        fenced = '```json\n{"subtasks": [{"id": "s1", "type": "research", "description": "d", "depends_on": [], "expected_output": "e"}]}\n```'

        mock_resp = MagicMock()
        mock_resp.content = fenced

        mock_llm = MagicMock()
        mock_llm.invoke.return_value = mock_resp

        with patch("agents.planner.get_llm", return_value=mock_llm):
            state = make_state()
            result = planner_node(state)

        assert len(result["subtasks"]) == 1
        assert result["subtasks"][0]["id"] == "s1"

    def test_handles_generic_code_fence(self):
        """planner_node strips generic ``` ... ``` fencing (no language tag)."""
        from agents.planner import planner_node

        fenced = '```\n{"subtasks": [{"id": "s1", "type": "analyze", "description": "d", "depends_on": [], "expected_output": "e"}]}\n```'

        mock_resp = MagicMock()
        mock_resp.content = fenced

        mock_llm = MagicMock()
        mock_llm.invoke.return_value = mock_resp

        with patch("agents.planner.get_llm", return_value=mock_llm):
            state = make_state()
            result = planner_node(state)

        assert len(result["subtasks"]) == 1
        assert result["subtasks"][0]["type"] == "analyze"

    def test_handles_llm_failure_gracefully(self):
        """planner_node sets subtasks to [] when the LLM call raises an exception."""
        from agents.planner import planner_node

        mock_llm = MagicMock()
        mock_llm.invoke.side_effect = RuntimeError("API timeout")

        with patch("agents.planner.get_llm", return_value=mock_llm):
            state = make_state()
            result = planner_node(state)

        assert result["subtasks"] == []

    def test_handles_invalid_json_gracefully(self):
        """planner_node sets subtasks to [] when LLM returns non-JSON garbage."""
        from agents.planner import planner_node

        mock_resp = MagicMock()
        mock_resp.content = "I'm not JSON at all, just some text."

        mock_llm = MagicMock()
        mock_llm.invoke.return_value = mock_resp

        with patch("agents.planner.get_llm", return_value=mock_llm):
            state = make_state()
            result = planner_node(state)

        assert result["subtasks"] == []

    def test_initializes_subtask_status_fields(self):
        """planner_node adds status='pending', output=None, error=None, retry_count=0."""
        from agents.planner import planner_node

        plan_json = json.dumps({
            "subtasks": [
                {
                    "id": "s1",
                    "type": "research",
                    "description": "Do stuff",
                    "depends_on": [],
                    "expected_output": "Stuff",
                }
            ]
        })

        mock_resp = MagicMock()
        mock_resp.content = plan_json

        mock_llm = MagicMock()
        mock_llm.invoke.return_value = mock_resp

        with patch("agents.planner.get_llm", return_value=mock_llm):
            state = make_state()
            result = planner_node(state)

        st = result["subtasks"][0]
        assert st["status"] == "pending"
        assert st["output"] is None
        assert st["error"] is None
        assert st["retry_count"] == 0

    def test_handles_list_content_format(self):
        """planner_node handles LLM responses where content is a list (Gemini 3.x style)."""
        from agents.planner import planner_node

        plan_json = json.dumps({
            "subtasks": [
                {"id": "s1", "type": "summarize", "description": "d", "depends_on": [], "expected_output": "e"}
            ]
        })

        mock_resp = MagicMock()
        # Simulate list-of-dicts content format
        mock_resp.content = [{"text": plan_json}]

        mock_llm = MagicMock()
        mock_llm.invoke.return_value = mock_resp

        with patch("agents.planner.get_llm", return_value=mock_llm):
            state = make_state()
            result = planner_node(state)

        assert len(result["subtasks"]) == 1
        assert result["subtasks"][0]["type"] == "summarize"

    def test_empty_subtasks_key_in_response(self):
        """planner_node handles a valid JSON response with an empty subtasks list."""
        from agents.planner import planner_node

        mock_resp = MagicMock()
        mock_resp.content = json.dumps({"subtasks": []})

        mock_llm = MagicMock()
        mock_llm.invoke.return_value = mock_resp

        with patch("agents.planner.get_llm", return_value=mock_llm):
            state = make_state()
            result = planner_node(state)

        assert result["subtasks"] == []

    def test_returns_state_dict(self):
        """planner_node always returns the state dictionary."""
        from agents.planner import planner_node

        mock_llm = MagicMock()
        mock_llm.invoke.side_effect = RuntimeError("fail")

        with patch("agents.planner.get_llm", return_value=mock_llm):
            state = make_state()
            result = planner_node(state)

        assert isinstance(result, dict)
        assert "subtasks" in result
        assert "run_id" in result
