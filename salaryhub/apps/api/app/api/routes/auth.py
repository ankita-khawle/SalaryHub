
from fastapi import APIRouter, Depends, HTTPException, Response, status
from pydantic import BaseModel
from pwdlib import PasswordHash

from app.core.config import settings
from app.core.security import create_access_token, get_current_manager

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
password_hash = PasswordHash.recommended()
COOKIE_NAME = "salaryhub_access_token"


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/login")
def login(payload: LoginRequest, response: Response):
    if (
        not settings.auth_secret_key
        or not settings.auth_manager_email
        or not settings.auth_manager_password_hash
    ):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication is not configured",
        )

    password_valid = password_hash.verify(
        payload.password,
        settings.auth_manager_password_hash,
    )

    if (
        payload.email.strip().lower()
        != settings.auth_manager_email.strip().lower()
        or not password_valid
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token(settings.auth_manager_email)

    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        secure=settings.app_env.lower() == "production",
        samesite="lax",
        max_age=settings.auth_token_expire_minutes * 60,
        path="/",
    )

    return {"email": settings.auth_manager_email}


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(
        key=COOKIE_NAME,
        path="/",
        httponly=True,
        secure=settings.app_env.lower() == "production",
        samesite="lax",
    )
    return {"message": "Logged out successfully"}


@router.get("/me")
def current_manager(
    email: str = Depends(get_current_manager),
):
    return {"email": email}
