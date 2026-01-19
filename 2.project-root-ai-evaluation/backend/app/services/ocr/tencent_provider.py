"""
腾讯 OCR 提供商实现
"""
import base64
import time
from typing import Optional

from app.services.ocr.base import OCRProvider
from app.schemas.ocr import OCRResult, TextRegion, BoundingBox


class TencentOCRProvider(OCRProvider):
    """腾讯 OCR 提供商"""
    
    def __init__(self, api_key: str, api_secret: str):
        """
        初始化腾讯 OCR 提供商
        
        Args:
            api_key: 腾讯云 SecretId
            api_secret: 腾讯云 SecretKey
        """
        super().__init__(api_key, api_secret)
        
        # 延迟导入腾讯云 SDK
        try:
            from tencentcloud.common import credential
            from tencentcloud.common.profile.client_profile import ClientProfile
            from tencentcloud.common.profile.http_profile import HttpProfile
            from tencentcloud.ocr.v20181119 import ocr_client, models
            
            self.credential = credential.Credential(api_key, api_secret)
            self.ocr_client_class = ocr_client.OcrClient
            self.models = models
        except ImportError:
            raise ImportError(
                "腾讯云 SDK 未安装。请运行: pip install tencentcloud-sdk-python"
            )
    
    def _create_client(self):
        """创建腾讯云 OCR 客户端"""
        from tencentcloud.common.profile.client_profile import ClientProfile
        from tencentcloud.common.profile.http_profile import HttpProfile
        
        http_profile = HttpProfile()
        http_profile.endpoint = "ocr.tencentcloudapi.com"
        
        client_profile = ClientProfile()
        client_profile.httpProfile = http_profile
        
        return self.ocr_client_class(self.credential, "ap-guangzhou", client_profile)
    
    def _parse_tencent_response(
        self,
        text_detections: list,
        text_type: str = "printed"
    ) -> OCRResult:
        """
        解析腾讯 OCR API 响应
        
        Args:
            text_detections: 文本检测结果列表
            text_type: 文本类型（"printed" 或 "handwritten"）
            
        Returns:
            OCRResult: OCR 识别结果
        """
        start_time = time.time()
        
        text_regions = []
        total_confidence = 0.0
        
        for detection in text_detections:
            # 提取文本
            text = detection.DetectedText
            
            # 提取位置信息
            polygon = detection.Polygon
            if polygon and len(polygon) >= 2:
                # 计算边界框
                x_coords = [p.X for p in polygon]
                y_coords = [p.Y for p in polygon]
                
                bbox = BoundingBox(
                    x=min(x_coords),
                    y=min(y_coords),
                    width=max(x_coords) - min(x_coords),
                    height=max(y_coords) - min(y_coords)
                )
            else:
                # 如果没有多边形信息，使用默认值
                bbox = BoundingBox(x=0, y=0, width=0, height=0)
            
            # 提取置信度
            confidence = detection.Confidence / 100.0 if hasattr(detection, 'Confidence') else 0.95
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
            provider="tencent"
        )
    
    async def recognize(self, image_bytes: bytes) -> OCRResult:
        """
        识别图像中的文本（通用识别）
        
        Args:
            image_bytes: 图像二进制数据
            
        Returns:
            OCRResult: OCR 识别结果
        """
        client = self._create_client()
        
        # 创建请求
        req = self.models.GeneralBasicOCRRequest()
        req.ImageBase64 = base64.b64encode(image_bytes).decode('utf-8')
        
        # 调用 API
        resp = client.GeneralBasicOCR(req)
        
        return self._parse_tencent_response(resp.TextDetections)
    
    async def recognize_printed(self, image_bytes: bytes) -> OCRResult:
        """
        识别印刷体文本（高精度）
        
        Args:
            image_bytes: 图像二进制数据
            
        Returns:
            OCRResult: OCR 识别结果
        """
        client = self._create_client()
        
        # 创建请求
        req = self.models.GeneralAccurateOCRRequest()
        req.ImageBase64 = base64.b64encode(image_bytes).decode('utf-8')
        
        # 调用 API
        resp = client.GeneralAccurateOCR(req)
        
        return self._parse_tencent_response(resp.TextDetections, text_type="printed")
    
    async def recognize_handwritten(self, image_bytes: bytes) -> OCRResult:
        """
        识别手写文本
        
        Args:
            image_bytes: 图像二进制数据
            
        Returns:
            OCRResult: OCR 识别结果
        """
        client = self._create_client()
        
        # 创建请求
        req = self.models.GeneralHandwritingOCRRequest()
        req.ImageBase64 = base64.b64encode(image_bytes).decode('utf-8')
        
        # 调用 API
        resp = client.GeneralHandwritingOCR(req)
        
        return self._parse_tencent_response(resp.TextDetections, text_type="handwritten")


# 注册腾讯 OCR 提供商
from app.services.ocr.base import OCRProviderFactory
OCRProviderFactory.register("tencent", TencentOCRProvider)
