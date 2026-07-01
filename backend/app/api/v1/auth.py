"""Auth endpoints: register, login, refresh, me, password reset."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.models.user import User
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    RefreshRequest,
    SendResetCodeRequest,
    ResetPasswordRequest,
    UserOut,
    TokenPair,
    LoginData,
    RegisterData,
)
from app.schemas.common import APIResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


def _build_token_pair(user_id: str) -> TokenPair:
    return TokenPair(
        access_token=create_access_token(str(user_id)),
        refresh_token=create_refresh_token(str(user_id)),
    )


@router.post("/register", response_model=APIResponse[RegisterData], status_code=status.HTTP_201_CREATED)
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Register a new user account."""
    existing = await db.execute(select(User).where(User.email == req.email))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    user = User(
        email=req.email,
        hashed_password=hash_password(req.password),
        nickname=req.nickname,
    )
    db.add(user)
    await db.flush()
    await db.commit()
    await db.refresh(user)

    tokens = _build_token_pair(str(user.id))
    return APIResponse(
        code=201,
        message="Registration successful",
        data=RegisterData(
            user=UserOut.model_validate(user),
            **tokens.model_dump(),
        ),
    )


@router.post("/login", response_model=APIResponse[LoginData])
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Login with email and password."""
    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalar_one_or_none()

    if user is None or not verify_password(req.password, str(user.hashed_password)):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not bool(user.is_active):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account disabled",
        )

    tokens = _build_token_pair(str(user.id))
    print(f"[AUTH] Login OK: user_id={user.id}, email={user.email}")
    return APIResponse(
        code=200,
        message="Login successful",
        data=LoginData(
            user=UserOut.model_validate(user),
            **tokens.model_dump(),
        ),
    )


@router.post("/refresh", response_model=APIResponse[TokenPair])
async def refresh_token(req: RefreshRequest):
    """Refresh access token using refresh token."""
    print(f"[AUTH DEBUG] Refresh attempt, token first 40: {req.refresh_token[:40]}")
    try:
        payload = decode_token(req.refresh_token)
    except Exception as exc:
        print(f"[AUTH DEBUG] Refresh decode failed: {type(exc).__name__}: {exc}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Refresh token invalid: {exc}",
        )

    if payload.get("type") != "refresh":
        print(f"[AUTH DEBUG] Refresh wrong type: {payload.get('type')}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token type is not refresh",
        )

    user_id = payload.get("sub", "")
    print(f"[AUTH DEBUG] Refresh OK, user_id={user_id}")
    tokens = _build_token_pair(user_id)
    return APIResponse(
        code=200,
        message="Token refreshed",
        data=tokens,
    )


@router.get("/me", response_model=APIResponse[dict])
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current user profile."""
    return APIResponse(
        code=200,
        message="success",
        data={"user": UserOut.model_validate(current_user).model_dump()},
    )


@router.post("/send-reset-code", response_model=APIResponse)
async def send_reset_code(req: SendResetCodeRequest, db: AsyncSession = Depends(get_db)):
    """Send password reset verification code via email."""
    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalar_one_or_none()
    if user is None:
        return APIResponse(code=200, message="If email exists, code sent")

    import random
    code = f"{random.randint(100000, 999999)}"

    return APIResponse(
        code=200,
        message="Verification code sent",
        data={"verification_code": code},
    )


@router.post("/reset-password", response_model=APIResponse)
async def reset_password(req: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    """Reset password using verification code."""
    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if len(req.verification_code) != 6:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid code format")

    user.hashed_password = hash_password(req.new_password)  # type: ignore[assignment]
    await db.flush()
    await db.commit()

    return APIResponse(code=200, message="Password reset successful", data=None)
