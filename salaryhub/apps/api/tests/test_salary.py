
from datetime import date
from decimal import Decimal
from unittest.mock import MagicMock

from fastapi.testclient import TestClient

from app.db.session import get_db
from app.main import app

client = TestClient(app)


def setup_mock_db(employee=None):
    db = MagicMock()
    db.get.return_value = employee

    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    return db


def teardown_mock_db():
    app.dependency_overrides.clear()


def test_salary_update_records_history():
    employee = MagicMock()
    employee.id = 1
    employee.salary = Decimal("850000.00")

    db = setup_mock_db(employee)

    try:
        response = client.patch(
            "/api/employees/1/salary",
            json={
                "new_salary": "950000.00",
                "effective_date": "2026-10-27",
            },
        )
    finally:
        teardown_mock_db()

    assert response.status_code == 200
    data = response.json()
    assert data["employee_id"] == 1
    assert data["previous_salary"] == "850000.00"
    assert data["new_salary"] == "950000.00"
    assert data["effective_date"] == "2026-10-27"

    assert employee.salary == Decimal("950000.00")
    db.add.assert_called_once()
    db.commit.assert_called_once()

    history = db.add.call_args.args[0]
    assert history.employee_id == 1
    assert history.previous_salary == Decimal("850000.00")
    assert history.new_salary == Decimal("950000.00")
    assert history.effective_date == date(2026, 10, 27)


def test_salary_update_returns_404_for_missing_employee():
    db = setup_mock_db(None)

    try:
        response = client.patch(
            "/api/employees/999999/salary",
            json={
                "new_salary": "950000.00",
                "effective_date": "2026-10-27",
            },
        )
    finally:
        teardown_mock_db()

    assert response.status_code == 404
    db.commit.assert_not_called()


def test_salary_update_rejects_unchanged_salary():
    employee = MagicMock()
    employee.id = 1
    employee.salary = Decimal("850000.00")

    db = setup_mock_db(employee)

    try:
        response = client.patch(
            "/api/employees/1/salary",
            json={
                "new_salary": "850000.00",
                "effective_date": "2026-10-27",
            },
        )
    finally:
        teardown_mock_db()

    assert response.status_code == 400
    db.commit.assert_not_called()


def test_salary_update_rejects_negative_salary():
    response = client.patch(
        "/api/employees/1/salary",
        json={
            "new_salary": "-100.00",
            "effective_date": "2026-10-27",
        },
    )

    assert response.status_code == 422
