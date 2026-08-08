"""
Tests for the router_node conditional edge function in agents.graph.

router_node inspects subtask statuses and dependencies to decide the next
worker node to route to, or END if all work is done.  emit_event is already
mocked at the module level via conftest.py (sys.modules mock).
"""
import pytest
from tests.conftest import make_state, make_subtask


class TestRouterNode:
    """Tests for the router_node conditional routing logic."""

    def test_routes_to_first_pending_subtask(self):
        """router_node returns the type of the first pending subtask."""
        from agents.graph import router_node

        state = make_state(subtasks=[
            make_subtask(id="s1", type="research", status="pending"),
            make_subtask(id="s2", type="write", status="pending"),
        ])
        assert router_node(state) == "research"

    def test_returns_end_when_all_complete(self, state_all_complete):
        """router_node returns END when every subtask has status 'complete'."""
        from agents.graph import router_node
        from langgraph.graph import END

        result = router_node(state_all_complete)
        assert result == END

    def test_returns_end_when_empty_subtasks(self):
        """router_node returns END when the subtask list is empty."""
        from agents.graph import router_node
        from langgraph.graph import END

        state = make_state(subtasks=[])
        assert router_node(state) == END

    def test_returns_end_when_subtasks_key_missing(self):
        """router_node returns END when 'subtasks' key is absent from state."""
        from agents.graph import router_node
        from langgraph.graph import END

        state = {"run_id": "test", "goal": "test"}
        assert router_node(state) == END

    def test_skips_subtask_with_unmet_dependencies(self, state_with_unmet_dependencies):
        """router_node skips subtask_2 (depends on pending subtask_1) and routes subtask_1."""
        from agents.graph import router_node

        # subtask_1 is pending with no deps → should be routed
        result = router_node(state_with_unmet_dependencies)
        assert result == "research"

    def test_routes_when_all_dependencies_met(self, state_with_dependencies):
        """router_node routes subtask_2 when its dependency subtask_1 is complete."""
        from agents.graph import router_node

        # subtask_1 is complete, subtask_2 is pending with dep on subtask_1
        result = router_node(state_with_dependencies)
        assert result == "analyze"

    def test_handles_retrying_status(self):
        """router_node routes subtasks with 'retrying' status just like 'pending'."""
        from agents.graph import router_node

        state = make_state(subtasks=[
            make_subtask(id="s1", type="analyze", status="retrying", retry_count=1),
        ])
        assert router_node(state) == "analyze"

    def test_skips_failed_subtasks(self):
        """router_node does NOT route subtasks with 'failed' status."""
        from agents.graph import router_node
        from langgraph.graph import END

        state = make_state(subtasks=[
            make_subtask(id="s1", type="research", status="failed"),
        ])
        assert router_node(state) == END

    def test_skips_running_subtasks(self):
        """router_node does NOT route subtasks that are already 'running'."""
        from agents.graph import router_node
        from langgraph.graph import END

        state = make_state(subtasks=[
            make_subtask(id="s1", type="research", status="running"),
        ])
        assert router_node(state) == END

    def test_complex_dag_chain_dependencies(self):
        """
        Complex DAG: s3 depends on s2, s2 depends on s1.
        When s1 is complete and s2/s3 are pending, router should pick s2.
        """
        from agents.graph import router_node

        state = make_state(subtasks=[
            make_subtask(id="s1", type="research", status="complete", output="Done"),
            make_subtask(id="s2", type="analyze", depends_on=["s1"], status="pending"),
            make_subtask(id="s3", type="write", depends_on=["s2"], status="pending"),
        ])
        assert router_node(state) == "analyze"

    def test_complex_dag_all_deps_complete(self):
        """
        Complex DAG: s1→s2→s3.  When s1 and s2 are complete, router picks s3.
        """
        from agents.graph import router_node

        state = make_state(subtasks=[
            make_subtask(id="s1", type="research", status="complete", output="r"),
            make_subtask(id="s2", type="analyze", depends_on=["s1"], status="complete", output="a"),
            make_subtask(id="s3", type="write", depends_on=["s2"], status="pending"),
        ])
        assert router_node(state) == "write"

    def test_multiple_deps_all_must_be_met(self):
        """
        Subtask with multiple dependencies is only routed when ALL are complete.
        """
        from agents.graph import router_node

        state = make_state(subtasks=[
            make_subtask(id="s1", type="research", status="complete", output="done"),
            make_subtask(id="s2", type="analyze", status="pending"),  # not complete!
            make_subtask(
                id="s3", type="write", depends_on=["s1", "s2"], status="pending"
            ),
        ])
        # s2 has no deps and is pending → router picks s2
        assert router_node(state) == "analyze"

    @pytest.mark.parametrize(
        "status, should_route",
        [
            ("pending", True),
            ("retrying", True),
            ("complete", False),
            ("failed", False),
            ("running", False),
        ],
        ids=["pending", "retrying", "complete", "failed", "running"],
    )
    def test_routes_only_actionable_statuses(self, status, should_route):
        """Parametrized: only 'pending' and 'retrying' subtasks are routable."""
        from agents.graph import router_node
        from langgraph.graph import END

        state = make_state(subtasks=[
            make_subtask(id="s1", type="summarize", status=status),
        ])
        result = router_node(state)
        if should_route:
            assert result == "summarize"
        else:
            assert result == END
