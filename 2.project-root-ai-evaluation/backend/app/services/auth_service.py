"""
认证服务
"""
import re
import random
import string
import bcrypt
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt

from app.core.config import settings
from app.core.redis_client import get_redis
from app.core.logging import logger


class AuthService:
    """认证服务类"""
    
    @staticmethod
    def validate_phone(phone: str) -> bool:
        """
        验证手机号格式
        
        Args:
            phone: 手机号字符串
            
        Returns:
            bool: 是否为有效的中国手机号
        """
        # 中国手机号：11位数字，以1开头
        pattern = r'^1[3-9]\d{9}$'
        return bool(re.match(pattern, phone))
    
    @staticmethod
    def generate_verification_code(length: int = 6) -> str:
        """
        生成验证码
        
        Args:
            length: 验证码长度
            
        Returns:
            str: 数字验证码
        """
        return ''.join(random.choices(string.digits, k=length))
    
    @staticmethod
    async def send_sms_code(phone: str) -> str:
        """
        发送短信验证码
        
        Args:
            phone: 手机号
            
        Returns:
            str: 验证码（开发环境返回，生产环境不返回）
            
        Raises:
            ValueError: 手机号格式无效
        """
        # 验证手机号格式
        if not AuthService.validate_phone(phone):
            raise ValueError("Invalid phone number format")
        
        # 使用 SMS 服务发送验证码
        from app.services.service_factory import get_sms_service
        sms_service = get_sms_service()
        code = await sms_service.send_verification_code(phone)
        
        # 存储到 Redis，5分钟过期
        redis_client = await get_redis()
        key = f"sms_code:{phone}"
        await redis_client.setex(key, 300, code)
        
        # 开发环境返回验证码（生产环境应该删除这行）
        return code
    
    @staticmethod
    async def verify_code(phone: str, code: str) -> bool:
        """
        验证短信验证码
        
        Args:
            phone: 手机号
            code: 验证码
            
        Returns:
            bool: 验证是否成功
        """
        redis_client = await get_redis()
        key = f"sms_code:{phone}"
        
        # 从 Redis 获取验证码
        stored_code = await redis_client.get(key)
        
        logger.info(f"🔍 验证码检查 - 手机号: {phone}, 输入验证码: {code}, 存储的验证码: {stored_code}")
        
        if not stored_code:
            logger.warning(f"❌ Redis中没有找到验证码 - 手机号: {phone}, key: {key}")
            return False
        
        # 验证成功后删除验证码
        if stored_code == code:
            await redis_client.delete(key)
            logger.info(f"✅ 验证码验证成功 - 手机号: {phone}")
            return True
        
        logger.warning(f"❌ 验证码不匹配 - 手机号: {phone}, 期望: {stored_code}, 实际: {code}")
        return False
    
    @staticmethod
    def hash_password(password: str) -> str:
        """
        哈希密码
        
        Args:
            password: 明文密码
            
        Returns:
            str: 哈希后的密码
        
        Note:
            bcrypt 有 72 字节限制，超过部分会被自动截断
        """
        # 将密码编码为字节
        password_bytes = password.encode('utf-8')
        
        # bcrypt 限制为 72 字节，手动截断
        if len(password_bytes) > 72:
            password_bytes = password_bytes[:72]
        
        # 生成盐并哈希密码
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password_bytes, salt)
        
        # 返回字符串形式
        return hashed.decode('utf-8')
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """
        验证密码
        
        Args:
            plain_password: 明文密码
            hashed_password: 哈希密码
            
        Returns:
            bool: 密码是否匹配
        """
        # 将密码编码为字节
        password_bytes = plain_password.encode('utf-8')
        
        # bcrypt 限制为 72 字节，手动截断
        if len(password_bytes) > 72:
            password_bytes = password_bytes[:72]
        
        # 验证密码
        hashed_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(password_bytes, hashed_bytes)
    
    @staticmethod
    def generate_jwt(user_id: str) -> str:
        """
        生成 JWT token
        
        Args:
            user_id: 用户 ID
            
        Returns:
            str: JWT token
        """
        # 计算过期时间
        expire = datetime.utcnow() + timedelta(days=settings.ACCESS_TOKEN_EXPIRE_DAYS)
        
        # 创建 payload
        payload = {
            "sub": user_id,
            "exp": expire,
            "iat": datetime.utcnow()
        }
        
        # 生成 token
        token = jwt.encode(
            payload,
            settings.SECRET_KEY,
            algorithm=settings.ALGORITHM
        )
        
        return token
    
    @staticmethod
    def verify_jwt(token: str) -> Optional[str]:
        """
        验证 JWT token
        
        Args:
            token: JWT token
            
        Returns:
            Optional[str]: 用户 ID，如果验证失败返回 None
        """
        try:
            payload = jwt.decode(
                token,
                settings.SECRET_KEY,
                algorithms=[settings.ALGORITHM]
            )
            user_id: str = payload.get("sub")
            return user_id
        except JWTError:
            return None
