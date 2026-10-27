
import pytest
from fastapi.testclient import TestClient
from pwdlib import PasswordHash
from app.core.config import settings

from app.main import app


@pytest.mark.unauthenticated
def test_employee_endpoint_requires_authentication():
    response = TestClient(app).get("/api/employees")
    assert response.status_code == 401


@pytest.mark.unauthenticated
def test_compensation_endpoint_requires_authentication():
    response = TestClient(app).get("/api/compensation/summary")
    assert response.status_code == 401


@pytest.mark.unauthenticated
def test_department_endpoint_requires_authentication():
    response = TestClient(app).get("/api/departments")
    assert response.status_code == 401


def test_logout_clears_auth_cookie():
    response = TestClient(app).post("/api/auth/logout")
    assert response.status_code == 200
    assert "salaryhub_access_token" in response.headers.get("set-cookie", "")

@pytest.fixture
def test_auth_settings(monkeypatch):
    monkeypatch.setattr(settings, "auth_secret_key", "test-secret-key-long-enough-for-testing")
    monkeypatch.setattr(settings, "auth_manager_email", "hr@example.com")
    monkeypatch.setattr(
        settings,
        "auth_manager_password_hash",
        PasswordHash.recommended().hash("TestPassword123!"),
    )
    monkeypatch.setattr(settings, "auth_token_expire_minutes", 30)


def test_login_with_valid_credentials(test_auth_settings):
    client = TestClient(app)
    response = client.post(
        "/api/auth/login",
        json={"email": "hr@example.com", "password": "TestPassword123!"},
    )

    assert response.status_code == 200
    assert response.json()["email"] == "hr@example.com"
    assert "salaryhub_access_token" in response.cookies
    assert "httponly" in response.headers["set-cookie"].lower()


def test_login_with_invalid_password(test_auth_settings):
    response = TestClient(app).post(
        "/api/auth/login",
        json={"email": "hr@example.com", "password": "WrongPassword"},
    )

    assert response.status_code == 401


@pytest.mark.unauthenticated
def test_current_manager_requires_valid_session():
    response = TestClient(app).get("/api/auth/me")
    assert response.status_code == 401


@pytest.mark.unauthenticated
def test_current_manager_accepts_login_session(test_auth_settings):
    client = TestClient(app)
    login_response = client.post(
        "/api/auth/login",
        json={"email": "hr@example.com", "password": "TestPassword123!"},
    )
    assert login_response.status_code == 200

    response = client.get("/api/auth/me")

    assert response.status_code == 200
    assert response.json()["email"] == "hr@example.com"
