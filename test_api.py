import urllib.request
import json
import time

def test_endpoint(url, method="GET", data=None):
    req = urllib.request.Request(url, method=method)
    if data:
        req.add_header('Content-Type', 'application/json')
        data = json.dumps(data).encode('utf-8')
    try:
        with urllib.request.urlopen(req, data=data, timeout=5) as response:
            return response.status, json.loads(response.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode())
    except Exception as e:
        return 0, str(e)

print("1. Health Check")
print(test_endpoint("http://localhost:8000/"))

print("\n2. Create Task Run")
status, data = test_endpoint("http://localhost:8000/api/task-runs/", "POST", {"goal": "Test goal"})
print(status, data)
task_id = data.get("id") if isinstance(data, dict) else None

if task_id:
    print("\n3. Poll Task Run")
    time.sleep(2)
    print(test_endpoint(f"http://localhost:8000/api/task-runs/{task_id}"))

print("\n4. List Task Runs")
status, data = test_endpoint("http://localhost:8000/api/task-runs/")
print(status, f"Count: len(data)" if isinstance(data, list) else data)

print("\n5. Error Cases - Empty Goal")
print(test_endpoint("http://localhost:8000/api/task-runs/", "POST", {}))

print("\n6. Error Cases - Invalid UUID")
print(test_endpoint("http://localhost:8000/api/task-runs/not-a-uuid"))
