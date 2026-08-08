"""
Worker Agents — Specialized Subtask Executors with Tool Calling.

Architecture Decision Record (ADR):
    Workers are not generic LLM callers. They branch by subtask type:
    
    - "research" → Calls Tavily web search first, then synthesizes with real sources
    - "analyze"  → Optionally generates and executes Python code for calculations
    - "summarize" / "write" → Pure LLM synthesis with full context from prior subtasks
    
    If a subtask has a retry_prompt (set by the Critic), it's prepended to the
    worker's context so the LLM knows what to fix on the retry attempt.
"""

import time
from langchain_core.messages import HumanMessage
from agents.state import AgentState
from agents.emit import emit_event, log_observation
from agents.llm import get_llm, _normalize_content


def _find_next_subtask(state: AgentState):
    """Find the first pending or retrying subtask."""
    for st in state.get("subtasks", []):
        if st["status"] in ["pending", "retrying"]:
            return st
    return None


def _compile_context(state: AgentState, current_id: str) -> str:
    """Build context from previously completed subtasks for chain-of-thought."""
    context_blocks = []
    for st in state.get("subtasks", []):
        if st["status"] == "complete" and st.get("output") and st["id"] != current_id:
            context_blocks.append(
                f"--- Output from {st['id']} ({st['type']}) ---\n{st['output']}"
            )
    return "\n\n".join(context_blocks)


def _do_web_search(description: str) -> tuple[str, list[str]]:
    """
    Execute Tavily web search for research subtasks.
    Returns (search_context_string, list_of_source_urls).
    Gracefully returns empty results if Tavily is unavailable.
    """
    try:
        from agents.tools.web_search import search_web, fetch_url_content
    except ImportError:
        return ("", [])
    
    results = search_web(description, max_results=5)
    if not results:
        return ("", [])
    
    source_urls = [r["url"] for r in results if r.get("url")]
    
    # Build search context from snippets
    search_blocks = []
    for r in results:
        block = f"**{r.get('title', 'Untitled')}** ({r.get('url', '')})\n{r.get('snippet', '')}"
        search_blocks.append(block)
    
    # Optionally fetch full content from top 2 results
    for r in results[:2]:
        url = r.get("url", "")
        if url:
            full_text = fetch_url_content(url, max_chars=3000)
            if full_text:
                search_blocks.append(f"--- Full content from {url} ---\n{full_text}")
    
    search_context = "\n\n".join(search_blocks)
    return (search_context, source_urls)


def _do_code_execution(description: str, goal: str) -> str:
    """
    Generate and execute Python code for analysis subtasks.
    Returns the execution result string, or empty string if disabled/failed.
    """
    try:
        from agents.tools.code_exec import execute_python
    except ImportError:
        return ""
    
    # Ask the LLM to generate a Python script
    code_prompt = f"""Generate a short Python script to help analyze the following task.
The script should print its results to stdout.
Task: {description}
Context: {goal}

Return ONLY the Python code, no explanations. Keep it under 50 lines.
Use only standard library modules (math, statistics, json, csv, datetime)."""

    try:
        llm = get_llm(temperature=0.0)
        response = llm.invoke([HumanMessage(content=code_prompt)])
        code = _normalize_content(response.content).strip()
        
        # Clean code fences
        if "```python" in code:
            code = code.split("```python")[1].split("```")[0]
        elif "```" in code:
            code = code.split("```")[1].split("```")[0]
        
        result = execute_python(code.strip())
        if result["success"]:
            return f"\n\n--- Code Execution Output ---\n{result['output']}"
        else:
            return f"\n\n--- Code Execution Failed ---\n{result['error']}"
    except Exception:
        return ""


def execute_worker_node(state: AgentState) -> AgentState:
    """
    Execute the next pending/retrying subtask.
    
    Branches by type:
    - research: Web search → LLM synthesis with real sources
    - analyze: Optional code execution → LLM analysis
    - summarize/write: Pure LLM synthesis with full context
    """
    run_id = state["run_id"]
    goal = state["goal"]
    
    subtask = _find_next_subtask(state)
    if not subtask:
        return state
        
    st_id = subtask["id"]
    state["current_subtask_id"] = st_id

    agent_type = subtask["type"]
    desc = subtask.get("description", "")
    expected = subtask.get("expected_output", "")
    retry_prompt = subtask.get("retry_prompt")
    
    emit_event(run_id, agent_type, "llm_call", "running", f"Generating content for {st_id}")
    start_t = time.time()
    
    # Compile context from completed subtasks
    context_str = _compile_context(state, st_id)
    
    # --- Type-specific tool calling ---
    search_context = ""
    source_urls = []
    code_output = ""
    
    if agent_type == "research":
        emit_event(run_id, agent_type, "web_search", "running", f"Searching the web for: {desc[:80]}...")
        search_context, source_urls = _do_web_search(desc)
        if search_context:
            emit_event(run_id, agent_type, "web_search", "complete",
                       f"Found {len(source_urls)} sources")
        else:
            emit_event(run_id, agent_type, "web_search", "complete",
                       "No web search results (Tavily not configured), using LLM knowledge")
    
    elif agent_type == "analyze":
        emit_event(run_id, agent_type, "code_exec", "running", "Generating analysis code...")
        code_output = _do_code_execution(desc, goal)
        if code_output:
            emit_event(run_id, agent_type, "code_exec", "complete", "Code executed successfully")
    
    # --- Build the prompt ---
    prompt = f"""You are an elite autonomous AI agent acting as a {agent_type}.
Your overarching mission is to contribute to this ultimate goal: {goal}

Your specific assignment right now is:
{desc}

Your output must fulfill this criteria:
{expected}
"""

    # Inject retry feedback from Critic
    if retry_prompt:
        prompt += f"""
⚠️ IMPORTANT: This is a RETRY attempt. The Critic Agent reviewed your previous output and found these issues:
{retry_prompt}

You MUST address these specific issues in your revised output. Do not repeat the same mistakes.
"""

    # Inject web search results for research tasks
    if search_context:
        prompt += f"""
Here are REAL web search results to ground your research (use these as primary sources):
{search_context}

You MUST cite these sources in your output using their URLs.
"""

    # Inject code execution results for analysis tasks
    if code_output:
        prompt += f"""
Here are the results from running a Python analysis script:
{code_output}

Use these computed results to support your analysis.
"""

    # Inject context from prior subtasks
    if context_str:
        prompt += f"\nHere is the context of work previously completed by other agents:\n{context_str}\n"
        
    prompt += "\nPlease produce your final deliverable now. Format your response cleanly using Markdown."

    try:
        llm = get_llm(temperature=0.4)
        response = llm.invoke([HumanMessage(content=prompt)])
        
        output = _normalize_content(response.content).strip()
        
        # Append source URLs to output for research tasks
        if source_urls:
            sources_section = "\n\n---\n**Sources:**\n" + "\n".join(
                f"- {url}" for url in source_urls
            )
            output += sources_section
        
        subtask["output"] = output
        subtask["status"] = "complete"
        subtask["sources"] = source_urls
        
        latency = int((time.time() - start_t) * 1000)
        emit_event(run_id, agent_type, "llm_call", "complete", f"Successfully completed {st_id}")
        log_observation(run_id, agent_type, "llm_call", desc, "Generated response", latency, True)
        
    except Exception as e:
        latency = int((time.time() - start_t) * 1000)
        error_msg = str(e)
        subtask["status"] = "failed"
        subtask["error"] = error_msg
        emit_event(run_id, agent_type, "llm_call", "failed", f"Execution failed: {error_msg}")
        log_observation(run_id, agent_type, "llm_call", desc, "", latency, False, error_msg)

    return state
