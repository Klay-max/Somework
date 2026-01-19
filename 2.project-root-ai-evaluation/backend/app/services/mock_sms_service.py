"""Mock SMS Service for local development"""
import logging
from typing import Dict

logger = logging.getLogger(__name__)


class MockSMSService:
    """Mock SMS service that simulates sending verification codes"""
    
    # 存储验证码（仅用于开发）
    _verification_codes: Dict[str, str] = {}
    
    async def send_verification_code(self, phone: str) -> str:
        """
        Generate and 'send' verification code
        
        Args:
            phone: Phone number
            
        Returns:
            str: Verification code (always "123456" in mock mode)
        """
        # 生成固定验证码方便测试
        code = "123456"
        
        # 存储验证码
        self._verification_codes[phone] = code
        
        logger.info(f"📱 Mock SMS: 发送验证码 {code} 到 {phone}")
        logger.info(f"💡 提示：在开发模式下，所有手机号的验证码都是 123456")
        
        return code
    
    async def verify_code(self, phone: str, code: str) -> bool:
        """
        Verify the code
        
        Args:
            phone: Phone number
            code: Verification code to verify
            
        Returns:
            bool: True if code is valid
        """
        # 开发模式：接受 123456 作为万能验证码
        if code == "123456":
            logger.info(f"✅ Mock SMS: 验证码验证成功 (万能码)")
            return True
        
        stored_code = self._verification_codes.get(phone)
        is_valid = stored_code == code
        
        if is_valid:
            logger.info(f"✅ Mock SMS: 验证码验证成功")
        else:
            logger.warning(f"❌ Mock SMS: 验证码验证失败")
        
        return is_valid
    
    async def clear_code(self, phone: str) -> None:
        """
        Clear verification code for a phone number
        
        Args:
            phone: Phone number
        """
        if phone in self._verification_codes:
            del self._verification_codes[phone]
            logger.info(f"🗑️ Mock SMS: 清除验证码 {phone}")
