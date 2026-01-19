"""
认证相关的 Pydantic 模式
"""
from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime


class SendCodeRequest(BaseModel):
    """发送验证码请求"""
    phone: str = Field(..., description="手机号", example="13800138000")
    
    @validator('phone')
    def validate_phone(cls, v):
        if not v or len(v) != 11:
            raise ValueError('Phone number must be 11 digits')
        if not v.isdigit():
            raise ValueError('Phone number must contain only digits')
        if not v.startswith('1'):
            raise ValueError('Phone number must start with 1')
        return v


class SendCodeResponse(BaseModel):
    """发送验证码响应"""
    success: bool
    expires_in: int = Field(..., description="验证码有效期（秒）")
    message: str = "Verification code sent successfully"


class RegisterRequest(BaseModel):
    """注册请求"""
    phone: str = Field(..., description="手机号", example="13800138000")
    verification_code: str = Field(..., description="验证码", example="123456")
    password: str = Field(..., min_length=6, max_length=50, description="密码")
    
    @validator('phone')
    def validate_phone(cls, v):
        if not v or len(v) != 11:
            raise ValueError('Phone number must be 11 digits')
        if not v.isdigit():
            raise ValueError('Phone number must contain only digits')
        if not v.startswith('1'):
            raise ValueError('Phone number must start with 1')
        return v


class LoginRequest(BaseModel):
    """登录请求"""
    phone: str = Field(..., description="手机号", example="13800138000")
    password: str = Field(..., description="密码")


class AuthResponse(BaseModel):
    """认证响应"""
    user_id: str
    phone: str
    role: str
    token: str
    expires_at: datetime
    message: str = "Authentication successful"


class UserResponse(BaseModel):
    """用户信息响应"""
    user_id: str
    phone: str
    role: str
    created_at: datetime
    last_login: Optional[datetime]
    
    class Config:
        from_attributes = True
