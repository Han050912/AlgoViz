"""
Dependency injection helpers: database session + current user.
"""
import traceback
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import decode_token
from app.models.user import User
from jose import JWTError

bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Extract and validate the current user from JWT Bearer token."""
    if credentials is None:
        print("[AUTH DEBUG] credentials is None - no Authorization header received")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header",
        )
    try:
        payload = decode_token(credentials.credentials)
        if payload.get("type") != "access":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token type is not access",
            )
        user_id = payload.get("sub")
    except JWTError as exc:
        print(f"[AUTH DEBUG] JWTError on token (first 40): {credentials.credentials[:40]}")
        print(f"  {type(exc).__name__}: {exc}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token rejected: {exc}",
        )
    except Exception as exc:
        print(f"[AUTH DEBUG] Unexpected error on token (first 40): {credentials.credentials[:40]}")
        print(f"  {type(exc).__name__}: {exc}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token error: {exc}",
        )

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None or not bool(user.is_active):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or disabled",
        )
    return user

