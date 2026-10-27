from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import Employee
from app.schemas.employee import EmployeeListResponse

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
