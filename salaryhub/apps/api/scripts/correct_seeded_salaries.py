
from collections import defaultdict
from decimal import Decimal

from sqlalchemy import select

from app.db.session import SessionLocal
from app.models import Employee, SalaryHistory


def correct_seeded_salaries() -> None:
    with SessionLocal() as session:
        employees = session.scalars(
            select(Employee).order_by(Employee.id)
        ).all()

        histories = session.scalars(
            select(SalaryHistory).order_by(
                SalaryHistory.employee_id,
                SalaryHistory.id,
            )
        ).all()

        history_by_employee = defaultdict(list)
        for item in histories:
            history_by_employee[item.employee_id].append(item)

        # Safety checks: this script is for the original demo dataset only.
        if len(employees) != 10_000:
            raise RuntimeError(
                f"Expected 10,000 employees; found {len(employees)}."
            )

        if len(histories) != 10_004:
            raise RuntimeError(
                f"Expected 10,004 history records; found {len(histories)}."
            )

        if sum(
            item.previous_salary is not None for item in histories
        ) != 4:
            raise RuntimeError(
                "Expected exactly four manual salary changes."
            )

        initial_records = []
        employees_with_changes = set()

        for employee in employees:
            records = history_by_employee[employee.id]
            initial = [
                item for item in records
                if item.previous_salary is None
            ]

            if len(initial) != 1:
                raise RuntimeError(
                    f"Unexpected initial history for {employee.employee_code}."
                )

            initial_record = initial[0]
            original_salary = initial_record.new_salary

            if not (
                Decimal("4000") <= original_salary
                <= Decimal("20000")
            ):
                raise RuntimeError(
                    f"Unexpected seed salary for {employee.employee_code}: "
                    f"{original_salary}"
                )

            initial_records.append(initial_record)

            changes = [
                item for item in records
                if item.previous_salary is not None
            ]

            if changes:
                employees_with_changes.add(employee.id)

                # Verify the salary audit chain before modifying it.
                previous_salary = original_salary
                for change in changes:
                    if change.previous_salary != previous_salary:
                        raise RuntimeError(
                            f"Broken salary history for "
                            f"{employee.employee_code}."
                        )
                    previous_salary = change.new_salary

                if employee.salary != changes[-1].new_salary:
                    raise RuntimeError(
                        f"Current salary does not match history for "
                        f"{employee.employee_code}."
                    )
            elif employee.salary != original_salary:
                raise RuntimeError(
                    f"Unexpected salary difference for "
                    f"{employee.employee_code}."
                )

        # All checks passed. Correct original seed values.
        for initial in initial_records:
            initial.new_salary = initial.new_salary * 100

        for employee in employees:
            records = history_by_employee[employee.id]
            changes = [
                item for item in records
                if item.previous_salary is not None
            ]

            if changes:
                # The first change's previous salary refers to the
                # original seeded salary, which has now been corrected.
                changes[0].previous_salary = (
                    changes[0].previous_salary * 100
                )
                # Preserve all manually entered salaries and current salary.
            else:
                employee.salary = employee.salary * 100

        session.commit()

        print("Corrected original seeded salary values.")
        print(f"Employees processed: {len(employees)}")
        print(f"Employees with manual changes preserved: "
              f"{len(employees_with_changes)}")
        print(f"Salary-history records preserved: {len(histories)}")


if __name__ == "__main__":
    correct_seeded_salaries()
