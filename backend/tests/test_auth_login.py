"""Comprehensive tests for POST /api/v1/auth/login"""
import httpx
import time

BASE_URL = "http://127.0.0.1:8001/api/v1"
TEST_EMAIL = f"logintest_{int(time.time())}@example.com"
TEST_PASS = "secure123"

# Setup: register a user first
def setup():
    r = httpx.post(f"{BASE_URL}/auth/register", json={
        "email": TEST_EMAIL, "password": TEST_PASS, "nickname": "LoginTester"
    }, timeout=10)
    assert r.status_code == 201, f"Setup failed: {r.status_code} {r.text}"
    print(f"Setup: user {TEST_EMAIL} registered")

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

    print("=" * 60)
    print("POST /api/v1/auth/login — Test Suite")
    print("=" * 60)

    # Positive
    def test_login_success():
        r = httpx.post(f"{BASE_URL}/auth/login", json={
            "email": TEST_EMAIL, "password": TEST_PASS
        }, timeout=10)
        assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
        data = r.json()
        assert data["code"] == 200
        assert data["data"]["user"]["email"] == TEST_EMAIL
        assert "access_token" in data["data"]
        assert "refresh_token" in data["data"]
        assert data["data"]["token_type"] == "bearer"
        assert "password" not in str(data)
        assert "hashed_password" not in str(data)

    test("[Positive] Login with correct credentials", test_login_success)

    # Exception: wrong password
    def test_login_wrong_password():
        r = httpx.post(f"{BASE_URL}/auth/login", json={
            "email": TEST_EMAIL, "password": "wrongpass"
        }, timeout=10)
        assert r.status_code == 401, f"Expected 401, got {r.status_code}"
        assert "错误" in r.text

    test("[Exception] Login with wrong password", test_login_wrong_password)

    # Exception: nonexistent email
    def test_login_nonexistent():
        r = httpx.post(f"{BASE_URL}/auth/login", json={
            "email": "noone@nowhere.com", "password": "whatever"
        }, timeout=10)
        assert r.status_code == 401, f"Expected 401, got {r.status_code}"

    test("[Exception] Login with nonexistent email", test_login_nonexistent)

    # Exception: invalid email format
    def test_login_invalid_email():
        r = httpx.post(f"{BASE_URL}/auth/login", json={
            "email": "not-an-email", "password": "secure123"
        }, timeout=10)
        assert r.status_code == 422, f"Expected 422, got {r.status_code}"

    test("[Exception] Login with invalid email format", test_login_invalid_email)

    # Exception: missing fields
    def test_login_missing_password():
        r = httpx.post(f"{BASE_URL}/auth/login", json={"email": TEST_EMAIL}, timeout=10)
        assert r.status_code == 422

    test("[Exception] Login missing password", test_login_missing_password)

    def test_login_empty_body():
        r = httpx.post(f"{BASE_URL}/auth/login", json={}, timeout=10)
        assert r.status_code == 422

    test("[Exception] Login with empty body", test_login_empty_body)

    # Boundary: very long password
    def test_login_long_password():
        r = httpx.post(f"{BASE_URL}/auth/login", json={
            "email": TEST_EMAIL, "password": "a" * 200
        }, timeout=10)
        # Should reject because wrong password, not because of length
        assert r.status_code == 401, f"Expected 401, got {r.status_code}"

    test("[Boundary] Login with very long password (wrong)", test_login_long_password)

    print()
    print(f"Results: {passed} passed, {failed} failed out of {passed + failed} tests")
    return failed == 0

if __name__ == "__main__":
    setup()
    success = run_tests()
    exit(0 if success else 1)
