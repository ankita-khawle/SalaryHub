from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, selectinload
from datetime import date
from decimal import Decimal
from app.models import SalaryHistory, Employee
from app.schemas.salary import SalaryUpdateRequest, SalaryUpdateResponse
from app.db.session import get_db
from app.schemas.employee import EmployeeListResponse, EmployeeDetailRead

router = APIRouter(prefix="/api/employees", tags=["Employees"])


@router.get("", response_model=EmployeeListResponse)
def list_employees(
    q: str | None = Query(default=None, max_length=100),
    department_id: int | None = Query(default=None, ge=1),
    is_active: bool | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    filters = []

    if q and q.strip():
        term = f"%{q.strip()}%"
        filters.append(
            or_(
                Employee.first_name.ilike(term),
                Employee.last_name.ilike(term),
                Employee.email.ilike(term),
                Employee.employee_code.ilike(term),
            )
        )

    if department_id is not None:
        filters.append(Employee.department_id == department_id)

    if is_active is not None:
        filters.append(Employee.is_active == is_active)

    total = db.scalar(
        select(func.count(Employee.id)).where(*filters)
    ) or 0

    statement = (
        select(Employee)
        .where(*filters)
        .order_by(Employee.id)
        .offset((page - 1) * page_size)
        .limit(page_size)
    )

    employees = db.scalars(statement).all()

    return EmployeeListResponse(
        items=employees,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.patch("/{employee_id}/salary", response_model=SalaryUpdateResponse)
def update_employee_salary(
    employee_id: int,
    payload: SalaryUpdateRequest,
    db: Session = Depends(get_db),
):
    employee = db.get(Employee, employee_id)

    if employee is None:
        raise HTTPException(
            status_code=404,
            detail="Employee not found",
        )

    previous_salary = employee.salary

    if previous_salary == payload.new_salary:
        raise HTTPException(
            status_code=400,
            detail="New salary must differ from the current salary",
        )

    history = SalaryHistory(
        employee_id=employee.id,
        previous_salary=previous_salary,
        new_salary=payload.new_salary,
        effective_date=payload.effective_date,
    )

    try:
        employee.salary = payload.new_salary
        db.add(history)
        db.commit()
    except Exception:
        db.rollback()
        raise

    return SalaryUpdateResponse(
        employee_id=employee.id,
        previous_salary=previous_salary,
        new_salary=employee.salary,
        effective_date=payload.effective_date,
        message="Salary updated successfully",
    )



@router.get("/{employee_id}", response_model=EmployeeDetailRead)
def get_employee(
    employee_id: int,
    db: Session = Depends(get_db),
):
    statement = (
        select(Employee)
        .options(
            selectinload(Employee.department),
            selectinload(Employee.salary_history),
        )
        .where(Employee.id == employee_id)
    )

    employee = db.scalars(statement).first()

    if employee is None:
        from fastapi import HTTPException

        raise HTTPException(
            status_code=404,
            detail="Employee not found",
        )

    return {
        "id": employee.id,
        "employee_code": employee.employee_code,
        "first_name": employee.first_name,
        "last_name": employee.last_name,
        "email": employee.email,
        "job_title": employee.job_title,
        "department_id": employee.department_id,
        "department_name": employee.department.name,
        "hire_date": employee.hire_date,
        "salary": employee.salary,
        "is_active": employee.is_active,
        "salary_history": employee.salary_history,
    }
