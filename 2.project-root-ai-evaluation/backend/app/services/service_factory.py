"""Service Factory for creating real or mock services"""
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)


def get_ocr_service():
    """Get OCR service (real or mock)"""
    from app.services.ocr.ocr_service import OCRService
    
    if settings.USE_MOCK_SERVICES:
        logger.info("🎭 Using Mock OCR Service")
        from app.services.ocr.mock_provider import MockOCRProvider
        provider = MockOCRProvider()
    else:
        logger.info("🔧 Using Real OCR Service")
        from app.services.ocr.baidu_provider import BaiduOCRProvider
        provider = BaiduOCRProvider(
            api_key=settings.BAIDU_OCR_API_KEY,
            api_secret=settings.BAIDU_OCR_API_SECRET
        )
    
    return OCRService(provider)


def get_deepseek_service():
    """Get DeepSeek service (real or mock)"""
    if settings.USE_MOCK_SERVICES:
        logger.info("🎭 Using Mock DeepSeek Service")
        from app.services.mock_deepseek_service import MockDeepSeekService
        return MockDeepSeekService()
    else:
        logger.info("🔧 Using Real DeepSeek Service")
        from app.services.deepseek_service import DeepSeekService
        return DeepSeekService()


def get_storage_service():
    """Get storage service (real or mock)"""
    if settings.USE_MOCK_SERVICES:
        logger.info("🎭 Using Mock Storage Service")
        from app.services.mock_storage_service import MockStorageService
        return MockStorageService()
    else:
        logger.info("🔧 Using Real OSS Service")
        # TODO: Implement real OSS service
        # from app.services.oss_service import OSSService
        # return OSSService()
        raise NotImplementedError("Real OSS service not implemented yet")


def get_sms_service():
    """Get SMS service (real or mock)"""
    if settings.USE_MOCK_SERVICES:
        logger.info("🎭 Using Mock SMS Service")
        from app.services.mock_sms_service import MockSMSService
        return MockSMSService()
    else:
        logger.info("🔧 Using Real SMS Service")
        # TODO: Implement real SMS service
        # from app.services.sms_service import SMSService
        # return SMSService()
        raise NotImplementedError("Real SMS service not implemented yet")
