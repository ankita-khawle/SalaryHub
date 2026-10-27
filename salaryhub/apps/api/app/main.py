
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.core.config import settings
from app.db.session import engine
from app.api.routes.employees import router as employees_router
from app.api.routes.departments import router as departments_router
from app.api.routes.compensation import router as compensation_router
from app.api.routes.auth import router as auth_router

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="Employee and salary management API for ACME.",
)
app.include_router(employees_router)
app.include_router(departments_router)
app.include_router(compensation_router)
app.include_router(auth_router)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
)


@app.get("/api/health", tags=["Health"])
def health_check():
    return {"status": "ok", "service": "salaryhub-api"}


@app.get("/api/health/db", tags=["Health"])
def database_health_check():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except SQLAlchemyError:
        from fastapi import HTTPException

        raise HTTPException(
            status_code=503,
            detail="Database connection unavailable",
        )
