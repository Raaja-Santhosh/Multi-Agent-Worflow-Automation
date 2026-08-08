import os
import subprocess
from typing import Dict, Any

# ADR:
# - Code execution must be explicitly enabled via the ENABLE_CODE_EXEC environment variable for security.
# - The tool runs code in an isolated subprocess (`subprocess.run`).
# - We strip sensitive environment variables (API keys, secrets) before spawning the subprocess.
# - Outputs (stdout/stderr) are captured and truncated to a reasonable limit (5000 chars).
# - Explicit exception handling captures timeouts and generic errors to return a safe schema.

def execute_python(code: str, timeout: int = 10) -> Dict[str, Any]:
    """
    Execute Python code in a sandboxed subprocess.
    
    Args:
        code: The Python code to execute.
        timeout: Execution timeout in seconds (default: 10).
        
    Returns:
        Dictionary with 'success' (bool), 'output' (str), and 'error' (str).
    """
    if os.environ.get("ENABLE_CODE_EXEC", "").lower() != "true":
        return {
            "success": False, 
            "output": "", 
            "error": "Code execution is disabled"
        }

    # Prepare safe environment by removing sensitive variables
    safe_env = os.environ.copy()
    sensitive_vars = [
        "GOOGLE_API_KEY", 
        "DATABASE_URL", 
        "REDIS_URL", 
        "TAVILY_API_KEY", 
        "JWT_SECRET"
    ]
    for var in sensitive_vars:
        safe_env.pop(var, None)

    try:
        # Run code via subprocess
        result = subprocess.run(
            ["python", "-c", code],
            timeout=timeout,
            capture_output=True,
            text=True,
            env=safe_env
        )
        
        success = result.returncode == 0
        output = result.stdout[:5000] if result.stdout else ""
        error = result.stderr[:5000] if result.stderr else ""
        
        return {
            "success": success,
            "output": output,
            "error": error
        }
        
    except subprocess.TimeoutExpired as e:
        return {
            "success": False,
            "output": e.stdout[:5000] if (e.stdout and isinstance(e.stdout, str)) else "",
            "error": f"Execution timed out after {timeout} seconds"
        }
    except Exception as e:
        return {
            "success": False,
            "output": "",
            "error": f"Execution failed: {str(e)}"[:5000]
        }
