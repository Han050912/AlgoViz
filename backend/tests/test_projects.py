"""Comprehensive tests for Project CRUD endpoints."""
import httpx
import time

BASE_URL = "http://127.0.0.1:8001/api/v1"

def setup_user():
    email = f"projtest_{int(time.time())}@example.com"
    r = httpx.post(f"{BASE_URL}/auth/register", json={"email": email, "password": "secure123"}, timeout=10)
    assert r.status_code == 201, f"Setup failed: {r.status_code}"
    return r.json()["data"]["access_token"]

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

    token = setup_user()
    headers = {"Authorization": f"Bearer {token}"}

    PYCODE = "def binary_search(arr, target):\\n    left, right = 0, len(arr) - 1\\n    while left <= right:\\n        mid = (left + right) // 2\\n        if arr[mid] == target:\\n            return mid\\n        elif arr[mid] < target:\\n            left = mid + 1\\n        else:\\n            right = mid - 1\\n    return -1"
    JSCODE = "function quickSort(arr) {\\n  if (arr.length <= 1) return arr;\\n  const pivot = arr[0];\\n  const left = arr.slice(1).filter(x => x < pivot);\\n  const right = arr.slice(1).filter(x => x >= pivot);\\n  return [...quickSort(left), pivot, ...quickSort(right)];\\n}"

    print("=" * 60)
    print("POST /api/v1/projects — Create Project Tests")
    print("=" * 60)

    def test_create_python():
        r = httpx.post(f"{BASE_URL}/projects", json={
            "name": "Binary Search", "language": "python", "source_code": PYCODE
        }, headers=headers, timeout=10)
        assert r.status_code == 201, f"Expected 201, got {r.status_code}: {r.text}"
        data = r.json()
        assert data["data"]["language"] == "python"
        assert data["data"]["name"] == "Binary Search"
        assert data["data"]["is_favorite"] == False
        assert len(data["data"]["source_hash"]) == 64  # SHA-256
    test("[Positive] Create Python project", test_create_python)

    def test_create_javascript():
        r = httpx.post(f"{BASE_URL}/projects", json={
            "language": "javascript", "source_code": JSCODE
        }, headers=headers, timeout=10)
        assert r.status_code == 201
        assert r.json()["data"]["language"] == "javascript"
    test("[Positive] Create JS project without name", test_create_javascript)

    def test_create_java():
        r = httpx.post(f"{BASE_URL}/projects", json={
            "name": "Java Sort", "language": "java",
            "source_code": "public class Main { public static void main(String[] args) { System.out.println('hello'); } }"
        }, headers=headers, timeout=10)
        assert r.status_code == 201
    test("[Positive] Create Java project", test_create_java)

    def test_create_no_auth():
        r = httpx.post(f"{BASE_URL}/projects", json={
            "language": "python", "source_code": "print(1)"
        }, timeout=10)
        assert r.status_code == 401
    test("[Exception] Create project without auth", test_create_no_auth)

    def test_create_invalid_language():
        r = httpx.post(f"{BASE_URL}/projects", json={
            "language": "invalidlang", "source_code": "x=1"
        }, headers=headers, timeout=10)
        assert r.status_code == 422, f"Expected 422, got {r.status_code}"
    test("[Exception] Create project with unsupported language", test_create_invalid_language)

    def test_create_empty_code():
        r = httpx.post(f"{BASE_URL}/projects", json={
            "language": "python", "source_code": ""
        }, headers=headers, timeout=10)
        assert r.status_code == 422, f"Expected 422, got {r.status_code}"
    test("[Exception] Create project with empty source code", test_create_empty_code)

    print()
    print("=" * 60)
    print("GET /api/v1/projects — List Projects Tests")
    print("=" * 60)

    def test_list_all():
        r = httpx.get(f"{BASE_URL}/projects", headers=headers, timeout=10)
        assert r.status_code == 200
        data = r.json()["data"]
        assert data["total"] == 3
        assert len(data["items"]) == 3
    test("[Positive] List all projects", test_list_all)

    def test_list_paginated():
        r = httpx.get(f"{BASE_URL}/projects?page=1&page_size=2", headers=headers, timeout=10)
        assert r.status_code == 200
        data = r.json()["data"]
        assert len(data["items"]) == 2
        assert data["total"] == 3
    test("[Positive] List projects with pagination", test_list_paginated)

    def test_list_filter_language():
        r = httpx.get(f"{BASE_URL}/projects?language=python", headers=headers, timeout=10)
        assert r.status_code == 200
        data = r.json()["data"]
        assert data["total"] == 1, f"Expected 1 python project, got {data['total']}"
    test("[Positive] List projects filtered by language", test_list_filter_language)

    def test_list_no_auth():
        r = httpx.get(f"{BASE_URL}/projects", timeout=10)
        assert r.status_code == 401
    test("[Exception] List projects without auth", test_list_no_auth)

    # Get the first project ID
    p_list = httpx.get(f"{BASE_URL}/projects", headers=headers, timeout=10).json()["data"]["items"]
    proj_id = p_list[0]["id"]

    print()
    print("=" * 60)
    print("GET /api/v1/projects/{id} — Get Single Project Tests")
    print("=" * 60)

    def test_get_project():
        r = httpx.get(f"{BASE_URL}/projects/{proj_id}", headers=headers, timeout=10)
        assert r.status_code == 200
        assert r.json()["data"]["id"] == proj_id
    test("[Positive] Get single project", test_get_project)

    def test_get_nonexistent():
        r = httpx.get(f"{BASE_URL}/projects/00000000-0000-0000-0000-000000000000", headers=headers, timeout=10)
        assert r.status_code == 404
    test("[Exception] Get nonexistent project", test_get_nonexistent)

    print()
    print("=" * 60)
    print("PUT /api/v1/projects/{id}/favorite — Toggle Favorite Tests")
    print("=" * 60)

    def test_toggle_favorite():
        r = httpx.put(f"{BASE_URL}/projects/{proj_id}/favorite", headers=headers, timeout=10)
        assert r.status_code == 200
        assert r.json()["data"]["is_favorite"] == True
        # Toggle again
        r2 = httpx.put(f"{BASE_URL}/projects/{proj_id}/favorite", headers=headers, timeout=10)
        assert r2.json()["data"]["is_favorite"] == False
    test("[Positive] Toggle favorite on/off", test_toggle_favorite)

    def test_toggle_favorite_no_auth():
        r = httpx.put(f"{BASE_URL}/projects/{proj_id}/favorite", timeout=10)
        assert r.status_code == 401
    test("[Exception] Toggle favorite without auth", test_toggle_favorite_no_auth)

    print()
    print("=" * 60)
    print("DELETE /api/v1/projects/{id} — Delete Project Tests")
    print("=" * 60)

    def test_delete_project():
        # Get another project to delete
        plist = httpx.get(f"{BASE_URL}/projects", headers=headers, timeout=10).json()["data"]["items"]
        del_id = [p for p in plist if p["id"] != proj_id][0]["id"]
        r = httpx.delete(f"{BASE_URL}/projects/{del_id}", headers=headers, timeout=10)
        assert r.status_code == 200
        # Verify gone
        r2 = httpx.get(f"{BASE_URL}/projects", headers=headers, timeout=10)
        assert r2.json()["data"]["total"] == 2
    test("[Positive] Delete project", test_delete_project)

    def test_delete_no_auth():
        r = httpx.delete(f"{BASE_URL}/projects/{proj_id}", timeout=10)
        assert r.status_code == 401
    test("[Exception] Delete project without auth", test_delete_no_auth)

    print()
    print(f"Results: {passed} passed, {failed} failed out of {passed + failed} tests")
    return failed == 0

if __name__ == "__main__":
    success = run_tests()
    exit(0 if success else 1)
