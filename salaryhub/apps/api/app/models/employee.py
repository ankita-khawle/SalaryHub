from datetime import date
from decimal import Decimal

from sqlalchemy import Boolean, Date, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class Employee(Base):
    __tablename__ = "employees"

    id: Mapped[int] = mapped_column(primary_key=True)
    employee_code: Mapped[str] = mapped_column(
        String(20), unique=True, index=True
    )
    first_name: Mapped[str] = mapped_column(String(100))
    last_name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(
        String(255), unique=True, index=True
    )
    job_title: Mapped[str] = mapped_column(String(150))
    department_id: Mapped[int] = mapped_column(
        ForeignKey("departments.id"), index=True
    )
    hire_date: Mapped[date] = mapped_column(Date)
    salary: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    department: Mapped["Department"] = relationship(
        back_populates="employees"
    )
    salary_history: Mapped[list["SalaryHistory"]] = relationship(
        back_populates="employee",
        cascade="all, delete-orphan",
        order_by="SalaryHistory.changed_at.desc()",
    )
