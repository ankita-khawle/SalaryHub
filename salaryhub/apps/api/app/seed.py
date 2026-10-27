
import random
from datetime import date, timedelta
from decimal import Decimal

from sqlalchemy import select

from app.db.session import SessionLocal
from app.models import Department, Employee, SalaryHistory


DEPARTMENT_NAMES = [
    "Engineering",
    "Human Resources",
    "Finance",
    "Marketing",
    "Sales",
    "Operations",
    "Customer Support",
    "Product",
    "Legal",
    "Data & Analytics",
]

FIRST_NAMES = [
    "Aarav", "Aditi", "Ananya", "Arjun", "Diya",
    "Ishaan", "Kabir", "Meera", "Neha", "Rohan",
    "Saanvi", "Vivaan", "Priya", "Rahul", "Kavya",
    "Aditya", "Ira", "Reyansh", "Simran", "Varun",
]

LAST_NAMES = [
    "Sharma", "Patel", "Khan", "Shah", "Mehta",
    "Reddy", "Nair", "Joshi", "Gupta", "Iyer",
    "Desai", "Rao", "Kapoor", "Verma", "Kulkarni",
]

JOB_TITLES = [
    "Software Engineer",
    "Senior Software Engineer",
    "Engineering Manager",
    "Product Manager",
    "Data Analyst",
    "HR Specialist",
    "Financial Analyst",
    "Marketing Manager",
    "Sales Executive",
    "Operations Analyst",
    "Customer Support Specialist",
    "Product Designer",
]

EMPLOYEE_COUNT = 10_000
RANDOM_SEED = 42


def seed_database() -> None:
    rng = random.Random(RANDOM_SEED)

    with SessionLocal() as session:
        # Avoid duplicating data if the seed script is run again.
        existing_count = session.scalar(
            select(Employee.id).limit(1)
        )
        if existing_count is not None:
            print("Employees already exist; skipping seed.")
            return

        departments = [
            Department(name=name)
            for name in DEPARTMENT_NAMES
        ]
        session.add_all(departments)
        session.flush()

        today = date.today()
        employees = []

        for number in range(1, EMPLOYEE_COUNT + 1):
            first_name = rng.choice(FIRST_NAMES)
            last_name = rng.choice(LAST_NAMES)
            department = rng.choice(departments)
            hire_date = today - timedelta(
                days=rng.randint(30, 3650)
            )
            salary = Decimal(
                rng.randrange(400_000, 2_000_001)
            ) / Decimal("100")

            employees.append(
                Employee(
                    employee_code=f"EMP{number:05d}",
                    first_name=first_name,
                    last_name=last_name,
                    email=f"employee{number:05d}@example.com",
                    job_title=rng.choice(JOB_TITLES),
                    department_id=department.id,
                    hire_date=hire_date,
                    salary=salary,
                    is_active=rng.random() >= 0.05,
                )
            )

        # Insert in batches to keep memory and transactions manageable.
        for start in range(0, len(employees), 500):
            batch = employees[start : start + 500]
            session.add_all(batch)
            session.flush()

            history = [
                SalaryHistory(
                    employee_id=employee.id,
                    previous_salary=None,
                    new_salary=employee.salary,
                    effective_date=employee.hire_date,
                )
                for employee in batch
            ]
            session.add_all(history)

        session.commit()

    print(
        f"Seeded {EMPLOYEE_COUNT:,} employees, "
        f"{len(DEPARTMENT_NAMES)} departments, "
        "and initial salary-history records."
    )


if __name__ == "__main__":
    seed_database()
