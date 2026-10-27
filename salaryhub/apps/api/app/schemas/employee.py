from datetime import date
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class EmployeeRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    employee_code: str
    first_name: str
    last_name: str
    email: str
    job_title: str
    department_id: int
    hire_date: date
    salary: Decimal
    is_active: bool


class EmployeeListResponse(BaseModel):
    items: list[EmployeeRead]
    total: int
    page: int
    page_size: int
