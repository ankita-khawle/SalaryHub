
from decimal import Decimal

from pydantic import BaseModel


class CountryCompensationSummary(BaseModel):
    country: str
    currency: str
    employee_count: int
    average_salary: Decimal
    min_salary: Decimal
    max_salary: Decimal


class DepartmentCompensationSummary(BaseModel):
    department_id: int
    department_name: str
    country: str
    currency: str
    employee_count: int
    average_salary: Decimal
    min_salary: Decimal
    max_salary: Decimal


class CompensationSummaryRead(BaseModel):
    by_country: list[CountryCompensationSummary]
    by_department: list[DepartmentCompensationSummary]
