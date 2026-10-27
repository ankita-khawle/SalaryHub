
from datetime import date
from decimal import Decimal

from pydantic import BaseModel, Field


class SalaryUpdateRequest(BaseModel):
    new_salary: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    effective_date: date


class SalaryUpdateResponse(BaseModel):
    employee_id: int
    previous_salary: Decimal
    new_salary: Decimal
    effective_date: date
    message: str
