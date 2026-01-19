"""
OCR 服务管理器
"""
from typing import Optional
import logging

from app.core.config import settings
from app.services.ocr.base import OCRProvider, OCRProviderFactory
from app.schemas.ocr import OCRResult

# 导入提供商以触发注册
from app.services.ocr.baidu_provider import BaiduOCRProvider
from app.services.ocr.tencent_provider import TencentOCRProvider
from app.services.ocr.aliyun_provider import AliyunOCRProvider


logger = logging.getLogger(__name__)


class OCRService:
    """OCR 服务管理器"""
    
    def __init__(self):
        """初始化 OCR 服务"""
        self.default_provider = settings.OCR_DEFAULT_PROVIDER
        self.providers: dict[str, OCRProvider] = {}
        
        # 初始化配置的提供商
        self._init_providers()
    
    def _init_providers(self):
        """初始化 OCR 提供商"""
        # 初始化百度 OCR
        if hasattr(settings, 'BAIDU_OCR_API_KEY') and settings.BAIDU_OCR_API_KEY:
            try:
                self.providers['baidu'] = OCRProviderFactory.create(
                    'baidu',
                    settings.BAIDU_OCR_API_KEY,
                    settings.BAIDU_OCR_API_SECRET
                )
                logger.info("百度 OCR 提供商初始化成功")
            except Exception as e:
                logger.error(f"百度 OCR 提供商初始化失败: {e}")
        
        # 初始化腾讯 OCR
        if hasattr(settings, 'TENCENT_OCR_SECRET_ID') and settings.TENCENT_OCR_SECRET_ID:
            try:
                self.providers['tencent'] = OCRProviderFactory.create(
                    'tencent',
                    settings.TENCENT_OCR_SECRET_ID,
                    settings.TENCENT_OCR_SECRET_KEY
                )
                logger.info("腾讯 OCR 提供商初始化成功")
            except Exception as e:
                logger.error(f"腾讯 OCR 提供商初始化失败: {e}")
        
        # 初始化阿里云 OCR
        if hasattr(settings, 'ALIYUN_OCR_ACCESS_KEY_ID') and settings.ALIYUN_OCR_ACCESS_KEY_ID:
            try:
                self.providers['aliyun'] = OCRProviderFactory.create(
                    'aliyun',
                    settings.ALIYUN_OCR_ACCESS_KEY_ID,
                    settings.ALIYUN_OCR_ACCESS_KEY_SECRET
                )
                logger.info("阿里云 OCR 提供商初始化成功")
            except Exception as e:
                logger.error(f"阿里云 OCR 提供商初始化失败: {e}")
    
    def select_provider(self, provider_name: Optional[str] = None) -> OCRProvider:
        """
        选择 OCR 提供商
        
        Args:
            provider_name: 提供商名称（可选）
            
        Returns:
            OCRProvider: OCR 提供商实例
            
        Raises:
            ValueError: 如果提供商不存在或未配置
        """
        # 使用指定的提供商或默认提供商
        name = provider_name or self.default_provider
        
        if name not in self.providers:
            # 尝试故障转移
            if self.providers:
                fallback_name = next(iter(self.providers.keys()))
                logger.warning(
                    f"OCR 提供商 '{name}' 不可用，故障转移到 '{fallback_name}'"
                )
                return self.providers[fallback_name]
            else:
                raise ValueError(f"没有可用的 OCR 提供商")
        
        return self.providers[name]
    
    async def recognize(
        self,
        image_bytes: bytes,
        provider_name: Optional[str] = None,
        retry_on_failure: bool = True
    ) -> OCRResult:
        """
        识别图像中的文本
        
        Args:
            image_bytes: 图像二进制数据
            provider_name: 指定的提供商名称（可选）
            retry_on_failure: 失败时是否尝试其他提供商
            
        Returns:
            OCRResult: OCR 识别结果
        """
        provider = self.select_provider(provider_name)
        
        try:
            result = await provider.recognize(image_bytes)
            return result
        except Exception as e:
            logger.error(f"OCR 识别失败 (提供商: {provider.provider_name}): {e}")
            
            # 如果启用重试且有其他提供商，尝试故障转移
            if retry_on_failure and len(self.providers) > 1:
                for name, fallback_provider in self.providers.items():
                    if name != provider.provider_name:
                        try:
                            logger.info(f"尝试故障转移到提供商: {name}")
                            result = await fallback_provider.recognize(image_bytes)
                            return result
                        except Exception as fallback_error:
                            logger.error(f"故障转移失败 (提供商: {name}): {fallback_error}")
                            continue
            
            # 所有提供商都失败
            raise Exception(f"所有 OCR 提供商都失败")
    
    async def recognize_printed(
        self,
        image_bytes: bytes,
        provider_name: Optional[str] = None
    ) -> OCRResult:
        """
        识别印刷体文本
        
        Args:
            image_bytes: 图像二进制数据
            provider_name: 指定的提供商名称（可选）
            
        Returns:
            OCRResult: OCR 识别结果
        """
        provider = self.select_provider(provider_name)
        return await provider.recognize_printed(image_bytes)
    
    async def recognize_handwritten(
        self,
        image_bytes: bytes,
        provider_name: Optional[str] = None
    ) -> OCRResult:
        """
        识别手写文本
        
        Args:
            image_bytes: 图像二进制数据
            provider_name: 指定的提供商名称（可选）
            
        Returns:
            OCRResult: OCR 识别结果
        """
        provider = self.select_provider(provider_name)
        return await provider.recognize_handwritten(image_bytes)
    
    def classify_text_type(self, text_region) -> str:
        """
        分类文本类型
        
        Args:
            text_region: 文本区域
            
        Returns:
            str: "printed" 或 "handwritten"
        """
        provider = self.select_provider()
        return provider.classify_text_type(text_region)
    
    def list_available_providers(self) -> list[str]:
        """列出所有可用的提供商"""
        return list(self.providers.keys())


# 创建全局 OCR 服务实例
ocr_service = OCRService()
