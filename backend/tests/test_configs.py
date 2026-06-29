"""Comprehensive tests for AI Config CRUD endpoints."""
import httpx
import time

BASE_URL = "http://127.0.0.1:8001/api/v1"

def setup_user():
    email = f"cfgtest_{int(time.time())}@example.com"
    r = httpx.post(f"{BASE_URL}/auth/register", json={"email": email, "password": "secure123"}, timeout=10)
    assert r.status_code == 201, f"Setup failed: {r.status_code} {r.text}"
    data = r.json()
    return data["data"]["access_token"], email

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

    token, email = setup_user()
    headers = {"Authorization": f"Bearer {token}"}

    print("=" * 60)
    print("POST /api/v1/configs — Create Config Tests")
    print("=" * 60)

    def test_create_config():
        r = httpx.post(f"{BASE_URL}/configs", json={
            "label": "My OpenAI",
            "base_url": "https://api.openai.com/v1",
            "api_key": "sk-test-key-123",
            "model_name": "gpt-4o"
        }, headers=headers, timeout=10)
        assert r.status_code == 201, f"Expected 201, got {r.status_code}: {r.text}"
        data = r.json()
        assert data["data"]["label"] == "My OpenAI"
        assert data["data"]["is_default"] == True, f"First config should be default: {data}"
        # API key must NOT be in response
        assert "api_key" not in str(data).lower(), f"API key leaked!"
    test("[Positive] Create first config (auto-default)", test_create_config)

    config_id = httpx.get(f"{BASE_URL}/configs", headers=headers, timeout=10).json()["data"][0]["id"]

    def test_create_second_config():
        r = httpx.post(f"{BASE_URL}/configs", json={
            "label": "My DeepSeek",
            "base_url": "https://api.deepseek.com/v1",
            "api_key": "sk-deepseek-key",
            "model_name": "deepseek-chat"
        }, headers=headers, timeout=10)
        assert r.status_code == 201
        data = r.json()
        assert data["data"]["is_default"] == False, f"Second config should not be default: {data}"
    test("[Positive] Create second config (not default)", test_create_second_config)

    def test_create_no_auth():
        r = httpx.post(f"{BASE_URL}/configs", json={
            "label": "test", "base_url": "https://x.com", "api_key": "k", "model_name": "m"
        }, timeout=10)
        assert r.status_code == 401
    test("[Exception] Create config without auth", test_create_no_auth)

    def test_create_missing_fields():
        r = httpx.post(f"{BASE_URL}/configs", json={"label": "x"}, headers=headers, timeout=10)
        assert r.status_code == 422
    test("[Exception] Create config with missing fields", test_create_missing_fields)

    print()
    print("=" * 60)
    print("GET /api/v1/configs — List/Get Tests")
    print("=" * 60)

    def test_list_configs():
        r = httpx.get(f"{BASE_URL}/configs", headers=headers, timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert len(data["data"]) == 2, f"Expected 2 configs, got {len(data['data'])}"
        # First should be default
        defaults = [c for c in data["data"] if c["is_default"]]
        assert len(defaults) == 1, f"Should have exactly 1 default, got {len(defaults)}"
    test("[Positive] List user configs", test_list_configs)

    def test_get_single_config():
        r = httpx.get(f"{BASE_URL}/configs/{config_id}", headers=headers, timeout=10)
        assert r.status_code == 200
        assert r.json()["data"]["id"] == config_id
    test("[Positive] Get single config by ID", test_get_single_config)

    def test_get_nonexistent():
        r = httpx.get(f"{BASE_URL}/configs/00000000-0000-0000-0000-000000000000", headers=headers, timeout=10)
        assert r.status_code == 404
    test("[Exception] Get nonexistent config", test_get_nonexistent)

    def test_list_no_auth():
        r = httpx.get(f"{BASE_URL}/configs", timeout=10)
        assert r.status_code == 401
    test("[Exception] List configs without auth", test_list_no_auth)

    print()
    print("=" * 60)
    print("PUT /api/v1/configs/{id} — Update Tests")
    print("=" * 60)

    def test_update_label():
        r = httpx.put(f"{BASE_URL}/configs/{config_id}", json={"label": "Updated Label"}, headers=headers, timeout=10)
        assert r.status_code == 200
        assert r.json()["data"]["label"] == "Updated Label"
    test("[Positive] Update config label", test_update_label)

    def test_update_nonexistent():
        r = httpx.put(f"{BASE_URL}/configs/00000000-0000-0000-0000-000000000000", json={"label": "x"}, headers=headers, timeout=10)
        assert r.status_code == 404
    test("[Exception] Update nonexistent config", test_update_nonexistent)

    def test_update_no_auth():
        r = httpx.put(f"{BASE_URL}/configs/{config_id}", json={"label": "x"}, timeout=10)
        assert r.status_code == 401
    test("[Exception] Update config without auth", test_update_no_auth)

    print()
    print("=" * 60)
    print("DELETE /api/v1/configs/{id} — Delete Tests")
    print("=" * 60)

    # Get second config ID
    configs = httpx.get(f"{BASE_URL}/configs", headers=headers, timeout=10).json()["data"]
    second_id = [c for c in configs if c["id"] != config_id][0]["id"]

    def test_delete_config():
        r = httpx.delete(f"{BASE_URL}/configs/{second_id}", headers=headers, timeout=10)
        assert r.status_code == 200
        # Verify it's gone
        r2 = httpx.get(f"{BASE_URL}/configs", headers=headers, timeout=10)
        assert len(r2.json()["data"]) == 1
    test("[Positive] Delete config", test_delete_config)

    def test_delete_nonexistent():
        r = httpx.delete(f"{BASE_URL}/configs/00000000-0000-0000-0000-000000000000", headers=headers, timeout=10)
        assert r.status_code == 404
    test("[Exception] Delete nonexistent config", test_delete_nonexistent)

    def test_delete_no_auth():
        r = httpx.delete(f"{BASE_URL}/configs/{config_id}", timeout=10)
        assert r.status_code == 401
    test("[Exception] Delete config without auth", test_delete_no_auth)

    print()
    print("=" * 60)
    print("PUT /api/v1/configs/{id}/default — Default Tests")
    print("=" * 60)

    def test_set_default():
        # Create another config first to test default switching
        r = httpx.post(f"{BASE_URL}/configs", json={
            "label": "New Default", "base_url": "https://x.com", "api_key": "k", "model_name": "m"
        }, headers=headers, timeout=10)
        new_id = r.json()["data"]["id"]
        # Switch default
        r2 = httpx.put(f"{BASE_URL}/configs/{new_id}/default", headers=headers, timeout=10)
        assert r2.status_code == 200
        assert r2.json()["data"]["is_default"] == True
        # Old default should now be False
        r3 = httpx.get(f"{BASE_URL}/configs/{config_id}", headers=headers, timeout=10)
        assert r3.json()["data"]["is_default"] == False
    test("[Positive] Set config as default", test_set_default)

    def test_set_default_no_auth():
        r = httpx.put(f"{BASE_URL}/configs/{config_id}/default", timeout=10)
        assert r.status_code == 401
    test("[Exception] Set default without auth", test_set_default_no_auth)

    print()
    print("=" * 60)
    print("POST /api/v1/configs/{id}/test — Connection Test")
    print("=" * 60)

    def test_connection_invalid():
        r = httpx.post(f"{BASE_URL}/configs/{config_id}/test", headers=headers, timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert "data" in data
        # Should return ok=false for invalid key
        assert data["data"]["ok"] == False, f"Expected ok=false, got {data}"
    test("[Positive] Test connection with invalid API key", test_connection_invalid)

    def test_connection_no_auth():
        r = httpx.post(f"{BASE_URL}/configs/{config_id}/test", timeout=10)
        assert r.status_code == 401
    test("[Exception] Test connection without auth", test_connection_no_auth)

    def test_connection_nonexistent():
        r = httpx.post(f"{BASE_URL}/configs/00000000-0000-0000-0000-000000000000/test", headers=headers, timeout=10)
        assert r.status_code == 404
    test("[Exception] Test connection for nonexistent config", test_connection_nonexistent)

    print()
    print(f"Results: {passed} passed, {failed} failed out of {passed + failed} tests")
    return failed == 0

if __name__ == "__main__":
    success = run_tests()
    exit(0 if success else 1)
