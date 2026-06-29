"""
Auth endpoints: register, login, refresh, me, password reset.
"""
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
        access_token=create_access_token(user_id),
        refresh_token=create_refresh_token(user_id),
    )


@router.post("/register", response_model=APIResponse[RegisterData], status_code=status.HTTP_201_CREATED)
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Register a new user account."""
    # Check duplicate email
    existing = await db.execute(select(User).where(User.email == req.email))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="该邮箱已被注册",
        )

    user = User(
        email=req.email,
        hashed_password=hash_password(req.password),
        nickname=req.nickname,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    tokens = _build_token_pair(user.id)
    return APIResponse(
        code=201,
        message="注册成功",
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

    if user is None or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="邮箱或密码错误",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="账号已被禁用",
        )

    tokens = _build_token_pair(user.id)
    return APIResponse(
        code=200,
        message="登录成功",
        data=LoginData(
            user=UserOut.model_validate(user),
            **tokens.model_dump(),
        ),
    )


@router.post("/refresh", response_model=APIResponse[TokenPair])
async def refresh_token(req: RefreshRequest):
    """Refresh access token using refresh token."""
    try:
        payload = decode_token(req.refresh_token)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="刷新令牌无效或已过期",
        )

    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="令牌类型错误",
        )

    user_id = payload.get("sub")
    tokens = _build_token_pair(user_id)
    return APIResponse(
        code=200,
        message="令牌刷新成功",
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
    """Send password reset verification code via email.
    
    Note: In production, this would send an actual email with a 6-digit code.
    For development/testing, the code is returned in the response.
    """
    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalar_one_or_none()
    if user is None:
        # Don't reveal whether the email exists
        return APIResponse(code=200, message="如果该邮箱已注册，验证码已发送")

    # Generate a 6-digit code (in production, store in Redis with TTL)
    import random
    code = f"{random.randint(100000, 999999)}"

    # For testing: return code in response (production would send email)
    return APIResponse(
        code=200,
        message="验证码已发送",
        data={"verification_code": code},
    )


@router.post("/reset-password", response_model=APIResponse)
async def reset_password(req: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    """Reset password using verification code.
    
    Note: In production, would validate against stored code in Redis.
    For development, accepts any 6-digit code and resets password.
    """
    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在",
        )

    # In production: validate verification_code against Redis
    # For development: accept any 6-digit code
    if len(req.verification_code) != 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="验证码格式无效",
        )

    user.hashed_password = hash_password(req.new_password)
    await db.commit()

    return APIResponse(
        code=200,
        message="密码重置成功",
        data=None,
    )
