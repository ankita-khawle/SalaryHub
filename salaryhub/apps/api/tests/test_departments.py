
from types import SimpleNamespace
from unittest.mock import MagicMock

from fastapi.testclient import TestClient

from app.db.session import get_db
from app.main import app

client = TestClient(app)


def test_list_departments_returns_employee_counts():
    db = MagicMock()
    db.execute.return_value.all.return_value = [
        SimpleNamespace(id=1, name="Engineering", employee_count=25),
        SimpleNamespace(id=2, name="HR", employee_count=5),
    ]

    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    try:
        response = client.get("/api/departments")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json() == [
        {"id": 1, "name": "Engineering", "employee_count": 25},
        {"id": 2, "name": "HR", "employee_count": 5},
    ]


def test_list_departments_returns_empty_list():
    db = MagicMock()
    db.execute.return_value.all.return_value = []

    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    try:
        response = client.get("/api/departments")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json() == []
