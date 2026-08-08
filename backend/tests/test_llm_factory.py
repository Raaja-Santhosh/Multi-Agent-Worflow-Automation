"""
Tests for agents.llm — the LLM factory and content normalization.

All ChatGoogleGenerativeAI instantiations are mocked so no API keys or
network access are required.
"""
import pytest
from unittest.mock import patch, MagicMock


# ---------------------------------------------------------------------------
# _normalize_content tests
# ---------------------------------------------------------------------------

class TestNormalizeContent:
    """Tests for the _normalize_content helper that flattens LLM response content."""

    def test_string_input_passthrough(self):
        """_normalize_content returns the same string when given a plain string."""
        from agents.llm import _normalize_content
        assert _normalize_content("hello world") == "hello world"

    def test_list_of_dicts_with_text_key(self):
        """_normalize_content extracts 'text' from each dict and concatenates."""
        from agents.llm import _normalize_content
        parts = [{"text": "Hello, "}, {"text": "world!"}]
        assert _normalize_content(parts) == "Hello, world!"

    def test_list_of_dicts_missing_text_key(self):
        """_normalize_content falls back to str(part) when 'text' key is absent."""
        from agents.llm import _normalize_content
        parts = [{"type": "image", "url": "https://example.com/img.png"}]
        result = _normalize_content(parts)
        # Should contain the dict's string representation
        assert "image" in result
        assert "example.com" in result

    def test_list_of_strings(self):
        """_normalize_content concatenates plain string elements in a list."""
        from agents.llm import _normalize_content
        parts = ["Hello, ", "world!"]
        assert _normalize_content(parts) == "Hello, world!"

    def test_empty_list(self):
        """_normalize_content returns empty string for an empty list."""
        from agents.llm import _normalize_content
        assert _normalize_content([]) == ""

    def test_integer_input(self):
        """_normalize_content coerces non-string scalars via str()."""
        from agents.llm import _normalize_content
        assert _normalize_content(42) == "42"

    def test_none_input(self):
        """_normalize_content coerces None to the string 'None'."""
        from agents.llm import _normalize_content
        assert _normalize_content(None) == "None"

    @pytest.mark.parametrize(
        "content, expected",
        [
            ("simple", "simple"),
            ([{"text": "a"}, {"text": "b"}], "ab"),
            (["x", "y"], "xy"),
            ([], ""),
            (123, "123"),
        ],
        ids=["string", "list-of-dicts", "list-of-strings", "empty-list", "integer"],
    )
    def test_parametrized_normalize(self, content, expected):
        """Parametrized sweep of _normalize_content covering multiple input shapes."""
        from agents.llm import _normalize_content
        assert _normalize_content(content) == expected

    def test_mixed_list_of_dicts_and_strings(self):
        """_normalize_content handles a mixed list containing dicts and strings."""
        from agents.llm import _normalize_content
        parts = [{"text": "Hello "}, "world"]
        assert _normalize_content(parts) == "Hello world"


# ---------------------------------------------------------------------------
# get_llm tests
# ---------------------------------------------------------------------------

class TestGetLlm:
    """Tests for get_llm which builds a ChatGoogleGenerativeAI with fallbacks."""

    @patch("agents.llm.ChatGoogleGenerativeAI")
    def test_returns_runnable_with_fallbacks(self, MockChat):
        """get_llm returns a RunnableWithFallbacks when fallback models exist."""
        from agents.llm import get_llm

        # Each call to ChatGoogleGenerativeAI() returns a distinct mock
        instances = [MagicMock(name=f"llm_{i}") for i in range(4)]
        MockChat.side_effect = instances

        # The primary mock needs with_fallbacks to return something
        fallback_chain = MagicMock(name="fallback_chain")
        instances[0].with_fallbacks.return_value = fallback_chain

        result = get_llm(temperature=0.5, max_retries=2)

        # Should have been called 4 times: 1 primary + 3 fallbacks
        assert MockChat.call_count == 4
        instances[0].with_fallbacks.assert_called_once_with(instances[1:])
        assert result is fallback_chain

    @patch("agents.llm.ChatGoogleGenerativeAI")
    def test_returns_primary_when_no_fallbacks(self, MockChat):
        """get_llm returns the raw primary model when FALLBACK_MODELS is empty."""
        from agents.llm import get_llm

        primary = MagicMock(name="primary")
        MockChat.return_value = primary

        with patch("agents.llm.FALLBACK_MODELS", []):
            result = get_llm()

        assert result is primary

    @patch("agents.llm.ChatGoogleGenerativeAI")
    def test_passes_temperature_and_retries(self, MockChat):
        """get_llm forwards temperature and max_retries to ChatGoogleGenerativeAI."""
        from agents.llm import get_llm

        mock_instance = MagicMock()
        mock_instance.with_fallbacks.return_value = MagicMock()
        MockChat.return_value = mock_instance

        get_llm(temperature=0.7, max_retries=3)

        # Every call should have the same temperature and max_retries
        for call in MockChat.call_args_list:
            assert call.kwargs["temperature"] == 0.7
            assert call.kwargs["max_retries"] == 3

    @patch("agents.llm.ChatGoogleGenerativeAI")
    def test_respects_primary_model_env_override(self, MockChat):
        """get_llm uses the PRIMARY_MODEL module-level constant for the primary model."""
        from agents.llm import get_llm

        mock_instance = MagicMock()
        mock_instance.with_fallbacks.return_value = MagicMock()
        MockChat.return_value = mock_instance

        with patch("agents.llm.PRIMARY_MODEL", "custom-model-v9"):
            get_llm()

        first_call = MockChat.call_args_list[0]
        assert first_call.kwargs["model"] == "custom-model-v9"

    @patch("agents.llm.ChatGoogleGenerativeAI")
    def test_skips_empty_fallback_entries(self, MockChat):
        """get_llm filters out empty/None entries from FALLBACK_MODELS."""
        from agents.llm import get_llm

        primary = MagicMock(name="primary")
        fallback = MagicMock(name="fallback")
        MockChat.side_effect = [primary, fallback]
        primary.with_fallbacks.return_value = MagicMock()

        with patch("agents.llm.FALLBACK_MODELS", ["", None, "gemini-ok"]):
            get_llm()

        # Should be called twice: 1 primary + 1 non-empty fallback
        assert MockChat.call_count == 2
        primary.with_fallbacks.assert_called_once_with([fallback])
