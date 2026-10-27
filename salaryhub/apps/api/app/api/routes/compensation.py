
from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import Department, Employee
from app.schemas.compensation import (
    CompensationSummaryRead,
    CountryCompensationSummary,
    DepartmentCompensationSummary,
)
from app.core.security import get_current_manager
router = APIRouter(
    prefix="/api/compensation",
    tags=["Compensation"],
    dependencies=[Depends(get_current_manager)]
)


@router.get("/summary", response_model=CompensationSummaryRead)
def get_compensation_summary(db: Session = Depends(get_db)):
    country_statement = (
        select(
            Employee.country.label("country"),
            Employee.currency.label("currency"),
            func.count(Employee.id).label("employee_count"),
            func.avg(Employee.salary).label("average_salary"),
            func.min(Employee.salary).label("min_salary"),
            func.max(Employee.salary).label("max_salary"),
        )
        .where(Employee.is_active.is_(True))
        .group_by(Employee.country, Employee.currency)
        .order_by(Employee.country, Employee.currency)
    )

    country_rows = db.execute(country_statement).all()

    department_statement = (
        select(
            Department.id.label("department_id"),
            Department.name.label("department_name"),
            Employee.country.label("country"),
            Employee.currency.label("currency"),
            func.count(Employee.id).label("employee_count"),
            func.avg(Employee.salary).label("average_salary"),
            func.min(Employee.salary).label("min_salary"),
            func.max(Employee.salary).label("max_salary"),
        )
        .join(Department, Employee.department_id == Department.id)
        .where(Employee.is_active.is_(True))
        .group_by(
            Department.id,
            Department.name,
            Employee.country,
            Employee.currency,
        )
        .order_by(
            Department.name,
            Employee.country,
            Employee.currency,
        )
    )

    department_rows = db.execute(department_statement).all()

    return CompensationSummaryRead(
        by_country=[
            CountryCompensationSummary(**row._mapping)
            for row in country_rows
        ],
        by_department=[
            DepartmentCompensationSummary(**row._mapping)
            for row in department_rows
        ],
    )
