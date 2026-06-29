"""Tests for GET /api/v1/history endpoint."""
import httpx
import time

BASE_URL = "http://127.0.0.1:8001/api/v1"

def setup():
    email = f"histtest_{int(time.time())}@example.com"
    r = httpx.post(f"{BASE_URL}/auth/register", json={"email": email, "password": "secure123"}, timeout=10)
    assert r.status_code == 201
    token = r.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    # Create a project (needed for analyses to have history)
    r = httpx.post(f"{BASE_URL}/projects", json={"language": "python", "source_code": "print(1)"}, headers=headers, timeout=10)
    return token, headers

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

    token, headers = setup()

    print("=" * 60)
    print("GET /api/v1/history — Tests")
    print("=" * 60)

    def test_history_empty_with_pagination():
        r = httpx.get(f"{BASE_URL}/history?page=1&page_size=20", headers=headers, timeout=10)
        assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
        data = r.json()["data"]
        assert "items" in data
        assert data["total"] >= 0
        assert data["page"] == 1
        assert data["page_size"] == 20
        assert "total_pages" in data
    test("[Positive] List history with default pagination", test_history_empty_with_pagination)

    def test_history_no_auth():
        r = httpx.get(f"{BASE_URL}/history", timeout=10)
        assert r.status_code == 401
    test("[Exception] List history without auth", test_history_no_auth)

    def test_history_filter_language():
        r = httpx.get(f"{BASE_URL}/history?language=python", headers=headers, timeout=10)
        assert r.status_code == 200
    test("[Positive] List history filtered by language (python)", test_history_filter_language)

    def test_history_filter_status():
        r = httpx.get(f"{BASE_URL}/history?status=completed", headers=headers, timeout=10)
        assert r.status_code == 200
    test("[Positive] List history filtered by status", test_history_filter_status)

    def test_history_pagination():
        r = httpx.get(f"{BASE_URL}/history?page=1&page_size=5", headers=headers, timeout=10)
        assert r.status_code == 200
        data = r.json()["data"]
        assert data["page_size"] == 5
    test("[Positive] List history with custom page size", test_history_pagination)

    def test_history_invalid_page():
        r = httpx.get(f"{BASE_URL}/history?page=0", headers=headers, timeout=10)
        assert r.status_code == 422  # page must be >= 1
    test("[Exception] List history with page=0", test_history_invalid_page)

    print()
    print(f"Results: {passed} passed, {failed} failed out of {passed + failed} tests")
    return failed == 0

if __name__ == "__main__":
    success = run_tests()
    exit(0 if success else 1)
