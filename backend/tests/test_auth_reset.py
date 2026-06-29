"""Tests for POST /api/v1/auth/send-reset-code and POST /api/v1/auth/reset-password"""
import httpx
import time

BASE_URL = "http://127.0.0.1:8001/api/v1"
TEST_EMAIL = f"resetpwd_{int(time.time())}@example.com"
TEST_PASS = "secure123"

def setup():
    r = httpx.post(f"{BASE_URL}/auth/register", json={
        "email": TEST_EMAIL, "password": TEST_PASS
    }, timeout=10)
    assert r.status_code == 201, f"Setup failed: {r.status_code}"

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

    setup()

    print("=" * 60)
    print("POST /api/v1/auth/send-reset-code бк Tests")
    print("=" * 60)

    def test_send_code_existing():
        r = httpx.post(f"{BASE_URL}/auth/send-reset-code", json={"email": TEST_EMAIL}, timeout=10)
        assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
        data = r.json()
        assert data["code"] == 200
        assert data.get("data") and "verification_code" in data["data"], f"No code: {data}"
    test("[Positive] Send reset code for existing user", test_send_code_existing)

    def test_send_code_nonexistent():
        r = httpx.post(f"{BASE_URL}/auth/send-reset-code", json={"email": "ghost@nowhere.com"}, timeout=10)
        assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
        data = r.json()
        assert data["data"] is None or "verification_code" not in data.get("data", {}), f"Should not reveal existence: {data}"
    test("[Security] Send reset code for nonexistent user (masked)", test_send_code_nonexistent)

    def test_send_code_invalid_email():
        r = httpx.post(f"{BASE_URL}/auth/send-reset-code", json={"email": "not-valid"}, timeout=10)
        assert r.status_code == 422
    test("[Exception] Send reset code with invalid email", test_send_code_invalid_email)

    def test_send_code_missing():
        r = httpx.post(f"{BASE_URL}/auth/send-reset-code", json={}, timeout=10)
        assert r.status_code == 422
    test("[Exception] Send reset code with empty body", test_send_code_missing)

    print()
    print("=" * 60)
    print("POST /api/v1/auth/reset-password бк Tests")
    print("=" * 60)

    def test_reset_password_success():
        r = httpx.post(f"{BASE_URL}/auth/reset-password", json={
            "email": TEST_EMAIL, "verification_code": "123456",
            "new_password": "newpass123", "confirm_password": "newpass123"
        }, timeout=10)
        assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
        r2 = httpx.post(f"{BASE_URL}/auth/login", json={"email": TEST_EMAIL, "password": "newpass123"}, timeout=10)
        assert r2.status_code == 200, f"Login with new password failed: {r2.status_code}"
    test("[Positive] Reset password and login with new password", test_reset_password_success)

    def test_reset_password_nonexistent():
        r = httpx.post(f"{BASE_URL}/auth/reset-password", json={
            "email": "ghost@nowhere.com", "verification_code": "123456",
            "new_password": "pass123456", "confirm_password": "pass123456"
        }, timeout=10)
        assert r.status_code == 404
    test("[Exception] Reset password for nonexistent user", test_reset_password_nonexistent)

    def test_reset_password_mismatch():
        r = httpx.post(f"{BASE_URL}/auth/reset-password", json={
            "email": TEST_EMAIL, "verification_code": "123456",
            "new_password": "newpass456", "confirm_password": "DIFFERENT"
        }, timeout=10)
        assert r.status_code == 422
    test("[Exception] Reset password with mismatched confirmation", test_reset_password_mismatch)

    def test_reset_password_short_code():
        r = httpx.post(f"{BASE_URL}/auth/reset-password", json={
            "email": TEST_EMAIL, "verification_code": "12345",
            "new_password": "pass123456", "confirm_password": "pass123456"
        }, timeout=10)
        assert r.status_code == 422
    test("[Exception] Reset password with 5-digit code", test_reset_password_short_code)

    def test_reset_password_short_new_pass():
        r = httpx.post(f"{BASE_URL}/auth/reset-password", json={
            "email": TEST_EMAIL, "verification_code": "123456",
            "new_password": "12345", "confirm_password": "12345"
        }, timeout=10)
        assert r.status_code == 422
    test("[Exception] Reset password with short new password", test_reset_password_short_new_pass)

    print()
    print(f"Results: {passed} passed, {failed} failed out of {passed + failed} tests")
    return failed == 0

if __name__ == "__main__":
    success = run_tests()
    exit(0 if success else 1)
