"""
Comprehensive tests for POST /api/v1/auth/register
Tests: positive, exception (duplicate, invalid email, short password), permission (none needed for register)
"""
import httpx
import json

BASE_URL = "http://127.0.0.1:8001/api/v1"

def run_tests():
    passed = 0
    failed = 0
    results = []

    def test(name: str, fn):
        nonlocal passed, failed
        try:
            fn()
            passed += 1
            results.append(f"  [PASS] {name}")
        except AssertionError as e:
            failed += 1
            results.append(f"  [FAIL] {name}: {e}")
        except Exception as e:
            failed += 1
            results.append(f"  [ERROR] {name}: {type(e).__name__}: {e}")

    print("=" * 60)
    print("POST /api/v1/auth/register — Test Suite")
    print("=" * 60)

    # ---- Positive Tests ----
    unique_email = f"test_{__import__('time').time()}@example.com"

    def test_register_success():
        r = httpx.post(f"{BASE_URL}/auth/register", json={
            "email": unique_email,
            "password": "secure123",
            "nickname": "TestUser"
        }, timeout=10)
        assert r.status_code == 201, f"Expected 201, got {r.status_code}: {r.text}"
        data = r.json()
        assert data["code"] == 201, f"Expected code 201, got {data}"
        assert "注册成功" in data["message"], f"Wrong message: {data['message']}"
        assert "user" in data["data"], f"No user in data: {data}"
        assert data["data"]["user"]["email"] == unique_email, f"Wrong email: {data['data']['user']['email']}"
        assert "access_token" in data["data"], f"No access_token: {data}"
        assert "refresh_token" in data["data"], f"No refresh_token: {data}"
        assert data["data"]["token_type"] == "bearer", f"Wrong token_type: {data['data']['token_type']}"
        # Verify password not leaked
        assert "password" not in str(data), f"Password leaked in response!"
        assert "hashed_password" not in str(data), f"Hashed password leaked!"

    test("[Positive] Register with valid data", test_register_success)

    def test_register_without_nickname():
        r = httpx.post(f"{BASE_URL}/auth/register", json={
            "email": f"nonick_{__import__('time').time()}@example.com",
            "password": "secure123"
        }, timeout=10)
        assert r.status_code == 201, f"Expected 201, got {r.status_code}: {r.text}"
        data = r.json()
        assert data["data"]["user"]["nickname"] is None, f"Nickname should be null: {data['data']['user']['nickname']}"

    test("[Positive] Register without nickname", test_register_without_nickname)

    # ---- Negative Tests (Exception) ----

    def test_register_duplicate_email():
        r = httpx.post(f"{BASE_URL}/auth/register", json={
            "email": unique_email,
            "password": "another123"
        }, timeout=10)
        assert r.status_code == 409, f"Expected 409, got {r.status_code}: {r.text}"
        data = r.json()
        assert "已被注册" in r.text, f"Wrong error message: {r.text}"

    test("[Exception] Register with duplicate email", test_register_duplicate_email)

    def test_register_invalid_email():
        r = httpx.post(f"{BASE_URL}/auth/register", json={
            "email": "not-an-email",
            "password": "secure123"
        }, timeout=10)
        assert r.status_code == 422, f"Expected 422, got {r.status_code}: {r.text}"

    test("[Exception] Register with invalid email format", test_register_invalid_email)

    def test_register_short_password():
        r = httpx.post(f"{BASE_URL}/auth/register", json={
            "email": f"shortpwd_{__import__('time').time()}@example.com",
            "password": "12345"
        }, timeout=10)
        assert r.status_code == 422, f"Expected 422, got {r.status_code}: {r.text}"

    test("[Exception] Register with password < 6 chars", test_register_short_password)

    def test_register_missing_email():
        r = httpx.post(f"{BASE_URL}/auth/register", json={
            "password": "secure123"
        }, timeout=10)
        assert r.status_code == 422, f"Expected 422, got {r.status_code}: {r.text}"

    test("[Exception] Register missing required email", test_register_missing_email)

    def test_register_missing_password():
        r = httpx.post(f"{BASE_URL}/auth/register", json={
            "email": f"missing_{__import__('time').time()}@example.com"
        }, timeout=10)
        assert r.status_code == 422, f"Expected 422, got {r.status_code}: {r.text}"

    test("[Exception] Register missing required password", test_register_missing_password)

    def test_register_empty_body():
        r = httpx.post(f"{BASE_URL}/auth/register", json={}, timeout=10)
        assert r.status_code == 422, f"Expected 422, got {r.status_code}: {r.text}"

    test("[Exception] Register with empty body", test_register_empty_body)

    # ---- Boundary Tests ----

    def test_register_long_password():
        r = httpx.post(f"{BASE_URL}/auth/register", json={
            "email": f"longpwd_{__import__('time').time()}@example.com",
            "password": "a" * 128
        }, timeout=10)
        assert r.status_code == 201, f"Expected 201 for 128-char password, got {r.status_code}: {r.text}"

    test("[Boundary] Register with 128-char password", test_register_long_password)

    def test_register_too_long_password():
        r = httpx.post(f"{BASE_URL}/auth/register", json={
            "email": f"toolong_{__import__('time').time()}@example.com",
            "password": "a" * 129
        }, timeout=10)
        assert r.status_code == 422, f"Expected 422 for 129-char password, got {r.status_code}"

    test("[Boundary] Register with 129-char password (too long)", test_register_too_long_password)

    def test_register_long_nickname():
        r = httpx.post(f"{BASE_URL}/auth/register", json={
            "email": f"longnick_{__import__('time').time()}@example.com",
            "password": "secure123",
            "nickname": "a" * 100
        }, timeout=10)
        assert r.status_code == 201, f"Expected 201, got {r.status_code}: {r.text}"

    test("[Boundary] Register with 100-char nickname", test_register_long_nickname)

    # ---- Summary ----
    print()
    for r in results:
        print(r)
    print()
    print(f"Results: {passed} passed, {failed} failed out of {passed + failed} tests")
    return failed == 0


if __name__ == "__main__":
    success = run_tests()
    exit(0 if success else 1)
