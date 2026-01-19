"""
认证 API 路由
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta

from app.core.database import get_db
from app.services.auth_service import AuthService
from app.models.user import User
from app.schemas.auth import (
    SendCodeRequest,
    SendCodeResponse,
    RegisterRequest,
    LoginRequest,
    AuthResponse,
    UserResponse
)
from app.api.dependencies import get_current_user
from app.core.config import settings


router = APIRouter()


@router.post("/send-code", response_model=SendCodeResponse)
async def send_verification_code(request: SendCodeRequest):
    """
    发送短信验证码
    
    - **phone**: 手机号（11位数字，以1开头）
    """
    try:
        # 发送验证码
        code = await AuthService.send_sms_code(request.phone)
        
        return SendCodeResponse(
            success=True,
            expires_in=300  # 5分钟
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send verification code"
        )


@router.post("/register", response_model=AuthResponse)
async def register(
    request: RegisterRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    用户注册
    
    - **phone**: 手机号
    - **verification_code**: 短信验证码
    - **password**: 密码（至少6位）
    """
    from app.core.logging import logger
    
    logger.info(f"📝 注册请求 - 手机号: {request.phone}, 验证码: {request.verification_code}")
    
    # 验证验证码
    is_valid = await AuthService.verify_code(request.phone, request.verification_code)
    logger.info(f"🔐 验证码验证结果: {is_valid}")
    
    if not is_valid:
        logger.warning(f"❌ 验证码验证失败 - 手机号: {request.phone}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code"
        )
    
    # 检查手机号是否已注册
    result = await db.execute(
        select(User).where(User.phone == request.phone)
    )
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        logger.warning(f"❌ 手机号已注册 - 手机号: {request.phone}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number already registered"
        )
    
    logger.info(f"✅ 开始创建用户 - 手机号: {request.phone}")
    
    # 创建新用户
    hashed_password = AuthService.hash_password(request.password)
    new_user = User(
        phone=request.phone,
        password_hash=hashed_password,
        role="student"  # 默认角色
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    logger.info(f"🎉 用户创建成功 - user_id: {new_user.user_id}")
    
    # 生成 JWT token
    token = AuthService.generate_jwt(str(new_user.user_id))
    expires_at = datetime.utcnow() + timedelta(days=settings.ACCESS_TOKEN_EXPIRE_DAYS)
    
    return AuthResponse(
        user_id=str(new_user.user_id),
        phone=new_user.phone,
        role=new_user.role.value,
        token=token,
        expires_at=expires_at
    )


@router.post("/login", response_model=AuthResponse)
async def login(
    request: LoginRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    用户登录
    
    - **phone**: 手机号
    - **password**: 密码
    """
    # 查找用户
    result = await db.execute(
        select(User).where(User.phone == request.phone)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid phone number or password"
        )
    
    # 验证密码
    if not AuthService.verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid phone number or password"
        )
    
    # 更新最后登录时间
    user.last_login = datetime.utcnow()
    await db.commit()
    
    # 生成 JWT token
    token = AuthService.generate_jwt(str(user.user_id))
    expires_at = datetime.utcnow() + timedelta(days=settings.ACCESS_TOKEN_EXPIRE_DAYS)
    
    return AuthResponse(
        user_id=str(user.user_id),
        phone=user.phone,
        role=user.role.value,
        token=token,
        expires_at=expires_at
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """
    获取当前用户信息
    
    需要认证：Bearer token
    """
    return UserResponse(
        user_id=str(current_user.user_id),
        phone=current_user.phone,
        role=current_user.role.value,
        created_at=current_user.created_at,
        last_login=current_user.last_login
    )
