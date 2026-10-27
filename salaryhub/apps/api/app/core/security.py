
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import HTTPException, Request, status

from app.core.config import settings


def create_access_token(subject: str) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=settings.auth_token_expire_minutes
    )
    return jwt.encode(
        {"sub": subject, "exp": expires_at},
        settings.auth_secret_key,
        algorithm="HS256",
    )


def get_current_manager(request: Request) -> str:
    if not settings.auth_secret_key or not settings.auth_manager_email:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication is not configured",
        )

    token = request.cookies.get("salaryhub_access_token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )

    try:
        payload = jwt.decode(
            token,
            settings.auth_secret_key,
            algorithms=["HS256"],
        )
        subject = payload.get("sub")
        if subject != settings.auth_manager_email:
            raise jwt.InvalidTokenError("Invalid subject")
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session",
            headers={"WWW-Authenticate": "Bearer"},
        ) from None

    return subject
