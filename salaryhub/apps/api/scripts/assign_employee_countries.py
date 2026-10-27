
from sqlalchemy import func, select

from app.db.session import SessionLocal
from app.models.employee import Employee

COUNTRY_SETTINGS = [
    ("India", "INR"),
    ("United States", "USD"),
    ("United Kingdom", "GBP"),
    ("Canada", "CAD"),
    ("Australia", "AUD"),
]


def main() -> None:
    with SessionLocal() as session:
        employees = session.scalars(
            select(Employee).order_by(Employee.id)
        ).all()

        if len(employees) != 10_000:
            raise RuntimeError(
                f"Expected 10,000 employees; found {len(employees)}. "
                "No changes made."
            )

        for index, employee in enumerate(employees):
            employee.country, employee.currency = COUNTRY_SETTINGS[
                index % len(COUNTRY_SETTINGS)
            ]

        session.commit()

        distribution = session.execute(
            select(
                Employee.country,
                Employee.currency,
                func.count(Employee.id),
            )
            .group_by(Employee.country, Employee.currency)
            .order_by(Employee.country)
        ).all()

        print("Employee country distribution:")
        for country, currency, count in distribution:
            print(f"{country} ({currency}): {count}")


if __name__ == "__main__":
    main()
