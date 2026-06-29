"""Tests for POST /api/v1/auth/refresh and GET /api/v1/auth/me"""
import httpx
import time

BASE_URL = "http://127.0.0.1:8001/api/v1"
TEST_EMAIL = f"refreshtest_{int(time.time())}@example.com"
TEST_PASS = "secure123"

def setup():
    r = httpx.post(f"{BASE_URL}/auth/register", json={
        "email": TEST_EMAIL, "password": TEST_PASS
    }, timeout=10)
    assert r.status_code == 201, f"Setup failed: {r.status_code}"
    data = r.json()
    return data["data"]["access_token"], data["data"]["refresh_token"]

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

    access_token, refresh_token = setup()

    print("=" * 60)
    print("POST /api/v1/auth/refresh — Tests")
    print("=" * 60)

    def test_refresh_success():
        r = httpx.post(f"{BASE_URL}/auth/refresh", json={
            "refresh_token": refresh_token
        }, timeout=10)
        assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
        data = r.json()
        assert data["code"] == 200
        assert "access_token" in data["data"]
        assert "refresh_token" in data["data"]

    test("[Positive] Refresh with valid refresh token", test_refresh_success)

    def test_refresh_invalid_token():
        r = httpx.post(f"{BASE_URL}/auth/refresh", json={
            "refresh_token": "this.is.not.a.valid.jwt.token"
        }, timeout=10)
        assert r.status_code == 401, f"Expected 401, got {r.status_code}: {r.text}"

    test("[Exception] Refresh with garbage token", test_refresh_invalid_token)

    def test_refresh_access_token():
        r = httpx.post(f"{BASE_URL}/auth/refresh", json={
            "refresh_token": access_token  # wrong token type
        }, timeout=10)
        assert r.status_code == 401, f"Expected 401, got {r.status_code}: {r.text}"

    test("[Exception] Refresh with access token (wrong type)", test_refresh_access_token)

    def test_refresh_missing_field():
        r = httpx.post(f"{BASE_URL}/auth/refresh", json={}, timeout=10)
        assert r.status_code == 422, f"Expected 422, got {r.status_code}"

    test("[Exception] Refresh with empty body", test_refresh_missing_field)

    # ---- GET /me ----
    print()
    print("=" * 60)
    print("GET /api/v1/auth/me — Tests")
    print("=" * 60)

    def test_me_success():
        r = httpx.get(f"{BASE_URL}/auth/me", headers={
            "Authorization": f"Bearer {access_token}"
        }, timeout=10)
        assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
        data = r.json()
        assert data["code"] == 200
        assert data["data"]["user"]["email"] == TEST_EMAIL
        assert "password" not in str(data)

    test("[Positive] Get /me with valid token", test_me_success)

    def test_me_no_token():
        r = httpx.get(f"{BASE_URL}/auth/me", timeout=10)
        assert r.status_code == 401, f"Expected 401, got {r.status_code}: {r.text}"

    test("[Exception] Get /me without token", test_me_no_token)

    def test_me_expired_token():
        # Create a deliberately expired JWT
        expired_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0IiwidHlwZSI6ImFjY2VzcyIsImV4cCI6MTcwMDAwMDAwMH0.DQ5ovq9J0BRr2-5LL9qWEcQN8Vjh3XZYYmKJzy3YFZo"
        r = httpx.get(f"{BASE_URL}/auth/me", headers={
            "Authorization": f"Bearer {expired_token}"
        }, timeout=10)
        assert r.status_code == 401, f"Expected 401, got {r.status_code}: {r.text}"

    test("[Exception] Get /me with expired token", test_me_expired_token)

    def test_me_bad_token():
        r = httpx.get(f"{BASE_URL}/auth/me", headers={
            "Authorization": "Bearer not.a.valid.token"
        }, timeout=10)
        assert r.status_code == 401, f"Expected 401, got {r.status_code}: {r.text}"

    test("[Exception] Get /me with garbage token", test_me_bad_token)

    def test_me_wrong_auth_format():
        r = httpx.get(f"{BASE_URL}/auth/me", headers={
            "Authorization": "Basic YWRtaW46cGFzcw=="
        }, timeout=10)
        assert r.status_code == 401, f"Expected 401, got {r.status_code}: {r.text}"

    test("[Exception] Get /me with Basic auth instead of Bearer", test_me_wrong_auth_format)

    print()
    print(f"Results: {passed} passed, {failed} failed out of {passed + failed} tests")
    return failed == 0

if __name__ == "__main__":
    success = run_tests()
    exit(0 if success else 1)
