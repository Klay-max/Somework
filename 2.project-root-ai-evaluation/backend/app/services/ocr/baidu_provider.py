"""
百度 OCR 提供商实现
"""
import base64
import time
from typing import Optional
import httpx

from app.services.ocr.base import OCRProvider
from app.schemas.ocr import OCRResult, TextRegion, BoundingBox


class BaiduOCRProvider(OCRProvider):
    """百度 OCR 提供商"""
    
    # 百度 OCR API 端点
    TOKEN_URL = "https://aip.baidubce.com/oauth/2.0/token"
    GENERAL_URL = "https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic"
    ACCURATE_URL = "https://aip.baidubce.com/rest/2.0/ocr/v1/accurate_basic"
    HANDWRITING_URL = "https://aip.baidubce.com/rest/2.0/ocr/v1/handwriting"
    
    def __init__(self, api_key: str, api_secret: str):
        """
        初始化百度 OCR 提供商
        
        Args:
            api_key: 百度 API Key
            api_secret: 百度 Secret Key
        """
        super().__init__(api_key, api_secret)
        self.access_token: Optional[str] = None
        self.token_expires_at: float = 0
    
    async def _get_access_token(self) -> str:
        """
        获取百度 Access Token
        
        Returns:
            str: Access Token
        """
        # 检查 token 是否过期
        if self.access_token and time.time() < self.token_expires_at:
            return self.access_token
        
        # 获取新 token
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.TOKEN_URL,
                params={
                    "grant_type": "client_credentials",
                    "client_id": self.api_key,
                    "client_secret": self.api_secret
                }
            )
            response.raise_for_status()
            data = response.json()
            
            self.access_token = data["access_token"]
            # Token 有效期通常是 30 天，提前 1 天刷新
            self.token_expires_at = time.time() + data.get("expires_in", 2592000) - 86400
            
            return self.access_token
    
    async def _call_ocr_api(self, url: str, image_bytes: bytes) -> dict:
        """
        调用百度 OCR API
        
        Args:
            url: API 端点 URL
            image_bytes: 图像二进制数据
            
        Returns:
            dict: API 响应数据
        """
        access_token = await self._get_access_token()
        
        # 将图像转换为 base64
        image_base64 = base64.b64encode(image_bytes).decode('utf-8')
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                url,
                params={"access_token": access_token},
                data={"image": image_base64},
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            response.raise_for_status()
            return response.json()
    
    def _parse_baidu_response(self, data: dict, text_type: str = "printed") -> OCRResult:
        """
        解析百度 OCR API 响应
        
        Args:
            data: API 响应数据
            text_type: 文本类型（"printed" 或 "handwritten"）
            
        Returns:
            OCRResult: OCR 识别结果
        """
        start_time = time.time()
        
        text_regions = []
        total_confidence = 0.0
        
        # 解析文本区域
        words_result = data.get("words_result", [])
        for item in words_result:
            # 提取文本
            text = item.get("words", "")
            
            # 提取位置信息
            location = item.get("location", {})
            bbox = BoundingBox(
                x=location.get("left", 0),
                y=location.get("top", 0),
                width=location.get("width", 0),
                height=location.get("height", 0)
            )
            
            # 提取置信度（某些 API 返回 probability）
            confidence = item.get("probability", {}).get("average", 0.95)
            if isinstance(confidence, dict):
                confidence = confidence.get("average", 0.95)
            
            total_confidence += confidence
            
            text_regions.append(TextRegion(
                text=text,
                bbox=bbox,
                confidence=confidence,
                type=text_type
            ))
        
        # 计算整体置信度
        overall_confidence = total_confidence / len(text_regions) if text_regions else 0.0
        processing_time = time.time() - start_time
        
        return OCRResult(
            text_regions=text_regions,
            overall_confidence=overall_confidence,
            processing_time=processing_time,
            provider="baidu"
        )
    
    async def recognize(self, image_bytes: bytes) -> OCRResult:
        """
        识别图像中的文本（通用识别）
        
        Args:
            image_bytes: 图像二进制数据
            
        Returns:
            OCRResult: OCR 识别结果
        """
        data = await self._call_ocr_api(self.GENERAL_URL, image_bytes)
        return self._parse_baidu_response(data)
    
    async def recognize_printed(self, image_bytes: bytes) -> OCRResult:
        """
        识别印刷体文本（高精度）
        
        Args:
            image_bytes: 图像二进制数据
            
        Returns:
            OCRResult: OCR 识别结果
        """
        data = await self._call_ocr_api(self.ACCURATE_URL, image_bytes)
        return self._parse_baidu_response(data, text_type="printed")
    
    async def recognize_handwritten(self, image_bytes: bytes) -> OCRResult:
        """
        识别手写文本
        
        Args:
            image_bytes: 图像二进制数据
            
        Returns:
            OCRResult: OCR 识别结果
        """
        data = await self._call_ocr_api(self.HANDWRITING_URL, image_bytes)
        return self._parse_baidu_response(data, text_type="handwritten")


# 注册百度 OCR 提供商
from app.services.ocr.base import OCRProviderFactory
OCRProviderFactory.register("baidu", BaiduOCRProvider)
