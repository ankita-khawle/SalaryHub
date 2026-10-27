from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Date, DateTime, ForeignKey, Numeric, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class SalaryHistory(Base):
    __tablename__ = "salary_history"

    id: Mapped[int] = mapped_column(primary_key=True)
    employee_id: Mapped[int] = mapped_column(
        ForeignKey("employees.id", ondelete="CASCADE"),
        index=True,
    )
    previous_salary: Mapped[Decimal | None] = mapped_column(
        Numeric(12, 2), nullable=True
    )
    new_salary: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    effective_date: Mapped[date] = mapped_column(Date)
    changed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    employee: Mapped["Employee"] = relationship(
        back_populates="salary_history"
    )
