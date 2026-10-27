
from datetime import date, datetime, timezone
from decimal import Decimal
from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient

from app.main import app
from app.db.session import get_db

client = TestClient(app)


def make_employee(employee_id=1):
    employee = MagicMock()
    employee.id = employee_id
    employee.employee_code = f"EMP{employee_id:05d}"
    employee.first_name = "Ananya"
    employee.last_name = "Sharma"
    employee.email = f"employee{employee_id}@example.com"
    employee.job_title = "Software Engineer"
    employee.department_id = 1
    employee.hire_date = date(2024, 1, 15)
    employee.salary = Decimal("850000.00")
    employee.is_active = True
    return employee


def test_list_employees_returns_paginated_response():
    employee = make_employee()
    db = MagicMock()
    db.scalar.return_value = 1
    db.scalars.return_value.all.return_value = [employee]

    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    try:
        response = client.get("/api/employees")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["page"] == 1
    assert data["page_size"] == 20
    assert len(data["items"]) == 1
    assert data["items"][0]["employee_code"] == "EMP00001"
    assert data["items"][0]["first_name"] == "Ananya"


def test_list_employees_rejects_invalid_pagination():
    response = client.get("/api/employees?page=0")

    assert response.status_code == 422


def test_list_employees_rejects_page_size_over_limit():
    response = client.get("/api/employees?page_size=101")

    assert response.status_code == 422



def setup_mock_db(employee):
    db = MagicMock()
    db.scalars.return_value.first.return_value = employee

    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db


def test_get_employee_returns_details_and_salary_history():
    department = MagicMock()
    department.name = "Engineering"

    history = MagicMock()
    history.id = 1
    history.previous_salary = Decimal("800000.00")
    history.new_salary = Decimal("850000.00")
    history.effective_date = date(2026, 1, 1)
    history.changed_at = datetime(2026, 1, 1, tzinfo=timezone.utc)

    employee = MagicMock()
    employee.id = 1
    employee.employee_code = "EMP00001"
    employee.first_name = "Ananya"
    employee.last_name = "Sharma"
    employee.email = "employee00001@example.com"
    employee.job_title = "Software Engineer"
    employee.department_id = 1
    employee.department = department
    employee.hire_date = date(2024, 1, 15)
    employee.salary = Decimal("850000.00")
    employee.is_active = True
    employee.salary_history = [history]

    setup_mock_db(employee)
    try:
        response = client.get("/api/employees/1")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    data = response.json()
    assert data["employee_code"] == "EMP00001"
    assert data["department_name"] == "Engineering"
    assert len(data["salary_history"]) == 1
    assert data["salary_history"][0]["new_salary"] == "850000.00"


def test_get_employee_returns_404_when_missing():
    setup_mock_db(None)
    try:
        response = client.get("/api/employees/999999")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 404
