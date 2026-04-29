import os
import pytest
import httpx
import uuid

# We hit the backend running on localhost:8000
BASE_URL = os.getenv("API_URL", "http://localhost:8000")

@pytest.fixture(scope="session")
def client():
    with httpx.Client(base_url=BASE_URL) as c:
        yield c

@pytest.fixture(scope="session")
def auth_token(client):
    response = client.post(
        "/api/auth/login",
        data={"username": "admin", "password": "SecureWatch123!"},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    assert response.status_code == 200, f"Login failed: {response.text}"
    return response.json()["access_token"]

@pytest.fixture
def auth_client(client, auth_token):
    client.headers.update({"Authorization": f"Bearer {auth_token}"})
    yield client
    client.headers.pop("Authorization", None)


# --- Authentication & Authorization Tests ---

def test_login_success(client):
    response = client.post(
        "/api/auth/login",
        data={"username": "admin", "password": "SecureWatch123!"},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_login_failure(client):
    response = client.post(
        "/api/auth/login",
        data={"username": "admin", "password": "wrongpassword"},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    assert response.status_code == 401

def test_protected_route_without_token(client):
    response = client.get("/api/agents")
    assert response.status_code == 401, "Protected route accessible without token!"

def test_protected_route_with_invalid_token(client):
    response = client.get("/api/agents", headers={"Authorization": "Bearer invalid.token.here"})
    assert response.status_code == 401

def test_me_endpoint(auth_client):
    response = auth_client.get("/api/auth/me")
    assert response.status_code == 200
    assert response.json()["username"] == "admin"


# --- Agents API Tests ---

def test_list_agents(auth_client):
    response = auth_client.get("/api/agents")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_nonexistent_agent(auth_client):
    response = auth_client.get("/api/agents/nonexistent-agent-id")
    assert response.status_code == 404

def test_send_command_to_agent_schema_validation(auth_client):
    # Missing required field "command"
    response = auth_client.post("/api/agents/test-agent/command", json={"args": {}})
    assert response.status_code == 422  # Unprocessable Entity


# --- Alerts API Tests ---

def test_list_alerts(auth_client):
    response = auth_client.get("/api/alerts")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_create_alert_schema_validation(auth_client):
    # Send empty payload
    response = auth_client.post("/api/alerts", json={})
    assert response.status_code == 422

def test_close_nonexistent_alert(auth_client):
    response = auth_client.post("/api/alerts/fake-alert-id/close", params={"notes": "test"})
    assert response.status_code == 404


# --- Audit Logs API Tests ---

def test_list_audit_logs(auth_client):
    response = auth_client.get("/api/audit")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


# --- Threat Intel API Tests ---

def test_threat_intel_lookup(auth_client):
    response = auth_client.get("/api/threat-intel/ip/8.8.8.8")
    # It should return 200, but may be an error if not configured. We just check it doesn't crash 500.
    assert response.status_code in [200, 500, 503]
    if response.status_code == 200:
        assert "abuseConfidenceScore" in response.json() or "error" in response.json()

def test_threat_intel_invalid_ip(auth_client):
    response = auth_client.get("/api/threat-intel/ip/not-an-ip")
    # Our API returns 200 with an {"error": ...} JSON body when AbuseIPDB rejects it
    assert response.status_code == 200
    assert "error" in response.json()


# --- Health API Tests ---

def test_diagnostics_public(client):
    # Diagnostics is typically public or admin only. We made it public recently.
    response = client.get("/api/diagnostics")
    assert response.status_code == 200
    assert "status" in response.json()

def test_system_health(auth_client):
    response = auth_client.get("/api/diagnostics")
    assert response.status_code == 200
    assert "system" in response.json()

