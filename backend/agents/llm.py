"""
Central LLM Factory with Automatic Fallback Chains.

This module provides a single source of truth for all LLM instances used across
the agent pipeline. Instead of hardcoding a single model in each agent, we configure
a primary model with automatic fallbacks. If the primary model hits a rate limit (429),
API error (500), or timeout, the system automatically retries with the next model
in the chain — zero human intervention required.

Architecture Decision Record (ADR):
    Why fallbacks instead of retries on the same model?
    - Rate limits (429) are quota-based, not transient. Retrying the same model
      will fail again immediately. Switching to a different model uses a separate
      quota pool, which is the correct recovery strategy.
    - Different models have independent rate limits in the Gemini API.
    - with_fallbacks() is a LangChain native pattern that preserves the Runnable
      interface, so callers don't need to change their invocation code at all.
"""

import os
from langchain_google_genai import ChatGoogleGenerativeAI


# ---------------------------------------------------------------------------
# Model Fallback Chain Configuration
# ---------------------------------------------------------------------------
# Order matters: primary model first, then progressively broader fallbacks.
# Each model in the Gemini API has its own independent quota pool.

PRIMARY_MODEL = os.getenv("LLM_PRIMARY_MODEL", "gemini-2.0-flash")
FALLBACK_MODELS = [
    os.getenv("LLM_FALLBACK_1", "gemini-2.0-flash-lite"),
    os.getenv("LLM_FALLBACK_2", "gemini-2.5-flash-lite"),
    os.getenv("LLM_FALLBACK_3", "gemini-3.5-flash-lite"),
]


def _normalize_content(content) -> str:
    """
    Normalize LLM response content to a plain string.
    
    Newer Gemini models (3.x+) return response.content as a list of content
    parts instead of a single string. This helper handles both formats
    transparently so callers never need to worry about it.
    """
    if isinstance(content, list):
        return "".join(
            part.get("text", str(part)) if isinstance(part, dict) else str(part)
            for part in content
        )
    return str(content)


def get_llm(temperature: float = 0.0, max_retries: int = 1) -> ChatGoogleGenerativeAI:
    """
    Build an LLM instance with automatic model fallbacks.
    
    Returns a LangChain Runnable that tries the primary model first,
    then cascades through fallback models if the primary fails.
    
    Args:
        temperature: Sampling temperature (0.0 = deterministic, 1.0 = creative)
        max_retries: Number of retries per individual model before falling back
        
    Returns:
        A LangChain ChatModel with .with_fallbacks() configured.
        
    Interview Explanation:
        "We use LangChain's with_fallbacks() pattern to build a resilient
        LLM invocation chain. If our primary Gemini model hits its rate limit,
        the system automatically cascades to alternative models that have
        independent quota pools. This eliminates single-point-of-failure
        on any one model endpoint."
    """
    primary = ChatGoogleGenerativeAI(
        model=PRIMARY_MODEL,
        temperature=temperature,
        max_retries=max_retries,
    )
    
    fallbacks = [
        ChatGoogleGenerativeAI(
            model=model,
            temperature=temperature,
            max_retries=max_retries,
        )
        for model in FALLBACK_MODELS
        if model  # Skip empty env vars
    ]
    
    if fallbacks:
        return primary.with_fallbacks(fallbacks)
    
    return primary
