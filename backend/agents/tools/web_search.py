import os
import re
import httpx
from typing import List, Dict, Any

try:
    from tavily import TavilyClient
except ImportError:
    TavilyClient = None

# ADR: 
# - Web Search Tool uses Tavily API via tavily-python (if installed and API key present).
# - We gracefully fallback to an empty list if TavilyClient isn't present or TAVILY_API_KEY is not set.
# - URL fetching leverages httpx with a simple 10-second timeout.
# - We strip HTML tags using basic regular expressions to avoid heavy dependencies like BeautifulSoup.

def search_web(query: str, max_results: int = 5) -> List[Dict[str, Any]]:
    """
    Perform a web search using Tavily API.
    
    Args:
        query: The search query string.
        max_results: Maximum number of results to return (default: 5).
        
    Returns:
        List of dictionaries containing 'title', 'url', and 'snippet'.
        Returns an empty list if API key is missing or on error.
    """
    api_key = os.environ.get("TAVILY_API_KEY")
    if not api_key or not TavilyClient:
        return []

    try:
        client = TavilyClient(api_key=api_key)
        response = client.search(query=query, max_results=max_results)
        
        results = []
        for result in response.get("results", []):
            results.append({
                "title": result.get("title", ""),
                "url": result.get("url", ""),
                "snippet": result.get("content", "")
            })
        return results
    except Exception:
        # Prevent failures from crashing the agent pipeline
        return []

def fetch_url_content(url: str, max_chars: int = 5000) -> str:
    """
    Fetch content from a URL and extract clean text.
    
    Args:
        url: The URL to fetch.
        max_chars: Maximum characters of clean text to return (default: 5000).
        
    Returns:
        Extracted text up to max_chars. Returns an empty string on error.
    """
    try:
        with httpx.Client(timeout=10.0) as client:
            response = client.get(url)
            response.raise_for_status()
            
            # Simple regex to strip HTML tags
            clean_text = re.sub(r'<[^>]+>', ' ', response.text)
            
            # Remove extra whitespace
            clean_text = re.sub(r'\s+', ' ', clean_text).strip()
            
            return clean_text[:max_chars]
    except Exception:
        return ""
