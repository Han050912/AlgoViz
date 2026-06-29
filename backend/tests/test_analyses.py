"""Tests for POST /api/v1/analyses/stream — SSE streaming analysis endpoint."""
import httpx
import time

BASE_URL = "http://127.0.0.1:8001/api/v1"

def setup():
    email = f"analysistest_{int(time.time())}@example.com"
    r = httpx.post(f"{BASE_URL}/auth/register", json={"email": email, "password": "secure123"}, timeout=10)
    assert r.status_code == 201
    token = r.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    # Create project
    r = httpx.post(f"{BASE_URL}/projects", json={
        "name": "Test Algo", "language": "python",
        "source_code": "def fib(n):\\n    if n <= 1: return n\\n    return fib(n-1) + fib(n-2)"
    }, headers=headers, timeout=10)
    assert r.status_code == 201, f"Project creation failed: {r.status_code} {r.text}"
    project_id = r.json()["data"]["id"]
    # Create AI config
    r = httpx.post(f"{BASE_URL}/configs", json={
        "label": "TestAI", "base_url": "https://api.openai.com/v1", "api_key": "sk-fake", "model_name": "gpt-4o"
    }, headers=headers, timeout=10)
    assert r.status_code == 201
    config_id = r.json()["data"]["id"]
    return token, headers, project_id, config_id

def run_tests():
    passed = 0
    failed = 0

    def test(name, fn):
        nonlocal passed, failed
        try:
            fn()
            passed += 1
            print(f"  [PASS] {name}")
        except AssertionError as e:
            failed += 1
            print(f"  [FAIL] {name}: {e}")
        except Exception as e:
            failed += 1
            print(f"  [ERROR] {name}: {type(e).__name__}: {e}")

    token, headers, project_id, config_id = setup()

    print("=" * 60)
    print("POST /api/v1/analyses/stream — SSE Tests")
    print("=" * 60)

    def test_stream_no_auth():
        r = httpx.post(f"{BASE_URL}/analyses/stream?project_id={project_id}&api_config_id={config_id}", timeout=10)
        assert r.status_code == 401, f"Expected 401, got {r.status_code}: {r.text}"
    test("[Exception] SSE stream without auth", test_stream_no_auth)

    def test_stream_bad_project():
        r = httpx.post(
            f"{BASE_URL}/analyses/stream?project_id=00000000-0000-0000-0000-000000000000&api_config_id={config_id}",
            headers=headers, timeout=10
        )
        assert r.status_code == 404, f"Expected 404, got {r.status_code}: {r.text}"
    test("[Exception] SSE stream with nonexistent project", test_stream_bad_project)

    def test_stream_bad_config():
        r = httpx.post(
            f"{BASE_URL}/analyses/stream?project_id={project_id}&api_config_id=00000000-0000-0000-0000-000000000000",
            headers=headers, timeout=10
        )
        assert r.status_code == 404, f"Expected 404, got {r.status_code}: {r.text}"
    test("[Exception] SSE stream with nonexistent config", test_stream_bad_config)

    def test_stream_missing_params():
        r = httpx.post(f"{BASE_URL}/analyses/stream", headers=headers, timeout=10)
        assert r.status_code == 422, f"Expected 422, got {r.status_code}"
    test("[Exception] SSE stream without query params", test_stream_missing_params)

    def test_stream_sse_events():
        """Test SSE stream produces expected events. Since we have a fake API key,
           the stream should produce status events and then an error event."""
        with httpx.stream(
            "POST",
            f"{BASE_URL}/analyses/stream?project_id={project_id}&api_config_id={config_id}",
            headers=headers,
            timeout=30,
        ) as response:
            assert response.status_code == 200, f"Expected 200, got {response.status_code}"
            # Collect events
            events = []
            buffer = ""
            for raw_bytes in response.iter_bytes():
                chunk = raw_bytes.decode("utf-8", errors="replace")
                buffer += chunk
                # Process complete SSE events
                while "\n\n" in buffer:
                    event_str, buffer = buffer.split("\n\n", 1)
                    for line in event_str.strip().split("\n"):
                        if line.startswith("event: "):
                            events.append(("event", line[7:]))
                        elif line.startswith("data: "):
                            events.append(("data", line[6:]))

            assert len(events) > 0, f"No SSE events received"
            # Should get at least a status event
            status_events = [e[1] for e in events if e[0] == "event" and "status" in e[1]]
            print(f"    Received {len(events)} SSE events, status events: {status_events}")
    test("[Positive] SSE stream produces events", test_stream_sse_events)

    print()
    print(f"Results: {passed} passed, {failed} failed out of {passed + failed} tests")
    return failed == 0

if __name__ == "__main__":
    success = run_tests()
    exit(0 if success else 1)
