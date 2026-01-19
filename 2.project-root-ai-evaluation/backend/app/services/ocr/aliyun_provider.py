"""
阿里云 OCR 提供商实现
"""
import base64
import time
import json
import hmac
import hashlib
from typing import Optional
from datetime import datetime
from urllib.parse import quote
import httpx

from app.services.ocr.base import OCRProvider
from app.schemas.ocr import OCRResult, TextRegion, BoundingBox


class AliyunOCRProvider(OCRProvider):
    """阿里云 OCR 提供商"""
    
    # 阿里云 OCR API 端点
    API_ENDPOINT = "https://ocr-api.cn-shanghai.aliyuncs.com"
    API_VERSION = "2021-07-07"
    
    def __init__(self, access_key_id: str, access_key_secret: str):
        """
        初始化阿里云 OCR 提供商
        
        Args:
            access_key_id: 阿里云 AccessKey ID
            access_key_secret: 阿里云 AccessKey Secret
        """
        super().__init__(access_key_id, access_key_secret)
        self.access_key_id = access_key_id
        self.access_key_secret = access_key_secret
    
    def _generate_signature(self, method: str, params: dict) -> str:
        """
        生成阿里云 API 签名
        
        Args:
            method: HTTP 方法
            params: 请求参数
            
        Returns:
            str: 签名字符串
        """
        # 排序参数
        sorted_params = sorted(params.items())
        
        # 构建规范化查询字符串
        canonical_query_string = "&".join([
            f"{quote(k, safe='')}={quote(str(v), safe='')}"
            for k, v in sorted_params
        ])
        
        # 构建待签名字符串
        string_to_sign = f"{method}&%2F&{quote(canonical_query_string, safe='')}"
        
        # 计算签名
        h = hmac.new(
            (self.access_key_secret + "&").encode('utf-8'),
            string_to_sign.encode('utf-8'),
            hashlib.sha1
        )
        signature = base64.b64encode(h.digest()).decode('utf-8')
        
        return signature
    
    async def _call_ocr_api(
        self,
        action: str,
        image_bytes: bytes,
        body_params: Optional[dict] = None
    ) -> dict:
        """
        调用阿里云 OCR API
        
        Args:
            action: API 操作名称
            image_bytes: 图像二进制数据
            body_params: 请求体参数
            
        Returns:
            dict: API 响应数据
        """
        # 将图像转换为 base64
        image_base64 = base64.b64encode(image_bytes).decode('utf-8')
        
        # 构建请求体
        body = body_params or {}
        body["body"] = image_base64
        
        # 构建公共参数
        timestamp = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')
        params = {
            "Action": action,
            "Version": self.API_VERSION,
            "AccessKeyId": self.access_key_id,
            "SignatureMethod": "HMAC-SHA1",
            "Timestamp": timestamp,
            "SignatureVersion": "1.0",
            "SignatureNonce": str(int(time.time() * 1000)),
            "Format": "JSON"
        }
        
        # 生成签名
        signature = self._generate_signature("POST", params)
        params["Signature"] = signature
        
        # 发送请求
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                self.API_ENDPOINT,
                params=params,
                json=body,
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()
            return response.json()
    
    def _parse_aliyun_response(self, data: dict, text_type: str = "printed") -> OCRResult:
        """
        解析阿里云 OCR API 响应
        
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
        result_data = data.get("Data", {})
        content = result_data.get("Content", "")
        
        # 阿里云返回的是整体文本，需要解析成区域
        # 这里简化处理，将整体文本作为一个区域
        if content:
            # 尝试解析 JSON 格式的结果
            try:
                content_json = json.loads(content)
                prism_wordsInfo = content_json.get("prism_wordsInfo", [])
                
                for word_info in prism_wordsInfo:
                    text = word_info.get("word", "")
                    pos = word_info.get("pos", [])
                    
                    # 解析位置信息 [x1,y1,x2,y2,x3,y3,x4,y4]
                    if len(pos) >= 8:
                        x_coords = [pos[i] for i in range(0, 8, 2)]
                        y_coords = [pos[i] for i in range(1, 8, 2)]
                        
                        bbox = BoundingBox(
                            x=min(x_coords),
                            y=min(y_coords),
                            width=max(x_coords) - min(x_coords),
                            height=max(y_coords) - min(y_coords)
                        )
                    else:
                        bbox = BoundingBox(x=0, y=0, width=0, height=0)
                    
                    # 阿里云通常不返回置信度，使用默认值
                    confidence = 0.95
                    total_confidence += confidence
                    
                    text_regions.append(TextRegion(
                        text=text,
                        bbox=bbox,
                        confidence=confidence,
                        type=text_type
                    ))
            except json.JSONDecodeError:
                # 如果不是 JSON 格式，作为整体文本处理
                text_regions.append(TextRegion(
                    text=content,
                    bbox=BoundingBox(x=0, y=0, width=0, height=0),
                    confidence=0.95,
                    type=text_type
                ))
                total_confidence = 0.95
        
        # 计算整体置信度
        overall_confidence = total_confidence / len(text_regions) if text_regions else 0.0
        processing_time = time.time() - start_time
        
        return OCRResult(
            text_regions=text_regions,
            overall_confidence=overall_confidence,
            processing_time=processing_time,
            provider="aliyun"
        )
    
    async def recognize(self, image_bytes: bytes) -> OCRResult:
        """
        识别图像中的文本（通用识别）
        
        Args:
            image_bytes: 图像二进制数据
            
        Returns:
            OCRResult: OCR 识别结果
        """
        data = await self._call_ocr_api("RecognizeGeneral", image_bytes)
        return self._parse_aliyun_response(data)
    
    async def recognize_printed(self, image_bytes: bytes) -> OCRResult:
        """
        识别印刷体文本
        
        Args:
            image_bytes: 图像二进制数据
            
        Returns:
            OCRResult: OCR 识别结果
        """
        data = await self._call_ocr_api("RecognizeAdvanced", image_bytes)
        return self._parse_aliyun_response(data, text_type="printed")
    
    async def recognize_handwritten(self, image_bytes: bytes) -> OCRResult:
        """
        识别手写文本
        
        Args:
            image_bytes: 图像二进制数据
            
        Returns:
            OCRResult: OCR 识别结果
        """
        data = await self._call_ocr_api("RecognizeHandwriting", image_bytes)
        return self._parse_aliyun_response(data, text_type="handwritten")


# 注册阿里云 OCR 提供商
from app.services.ocr.base import OCRProviderFactory
OCRProviderFactory.register("aliyun", AliyunOCRProvider)
