
from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import Department, Employee
from app.schemas.department import DepartmentRead

router = APIRouter(prefix="/api/departments", tags=["Departments"])


@router.get("", response_model=list[DepartmentRead])
def list_departments(db: Session = Depends(get_db)):
    statement = (
        select(
            Department.id,
            Department.name,
            func.count(Employee.id).label("employee_count"),
        )
        .outerjoin(Employee, Employee.department_id == Department.id)
        .group_by(Department.id, Department.name)
        .order_by(Department.name)
    )

    rows = db.execute(statement).all()

    return [
        DepartmentRead(
            id=row.id,
            name=row.name,
            employee_count=row.employee_count,
        )
        for row in rows
    ]
