
from decimal import Decimal
from unittest.mock import MagicMock

from fastapi.testclient import TestClient

from app.db.session import get_db
from app.main import app

client = TestClient(app)


def make_row(**values):
    row = MagicMock()
    row._mapping = values
    return row


def test_compensation_summary_returns_country_and_department_statistics():
    country_row = make_row(
        country="India",
        currency="INR",
        employee_count=2,
        average_salary=Decimal("900000.00"),
        min_salary=Decimal("800000.00"),
        max_salary=Decimal("1000000.00"),
    )

    department_row = make_row(
        department_id=1,
        department_name="Engineering",
        country="India",
        currency="INR",
        employee_count=2,
        average_salary=Decimal("900000.00"),
        min_salary=Decimal("800000.00"),
        max_salary=Decimal("1000000.00"),
    )

    db = MagicMock()
    db.execute.side_effect = [
        MagicMock(all=MagicMock(return_value=[country_row])),
        MagicMock(all=MagicMock(return_value=[department_row])),
    ]

    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    try:
        response = client.get("/api/compensation/summary")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    data = response.json()

    assert len(data["by_country"]) == 1
    assert len(data["by_department"]) == 1

    country = data["by_country"][0]
    assert country["country"] == "India"
    assert country["currency"] == "INR"
    assert country["employee_count"] == 2
    assert country["average_salary"] == "900000.00"
    assert country["min_salary"] == "800000.00"
    assert country["max_salary"] == "1000000.00"

    department = data["by_department"][0]
    assert department["department_name"] == "Engineering"
    assert department["country"] == "India"
    assert department["currency"] == "INR"
    assert department["employee_count"] == 2

    assert db.execute.call_count == 2


def test_compensation_summary_returns_empty_arrays_when_no_employees():
    db = MagicMock()
    db.execute.return_value.all.return_value = []

    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    try:
        response = client.get("/api/compensation/summary")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json() == {
        "by_country": [],
        "by_department": [],
    }
