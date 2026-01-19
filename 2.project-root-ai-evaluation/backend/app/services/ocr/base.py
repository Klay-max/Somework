"""
OCR 提供商抽象基类
"""
from abc import ABC, abstractmethod
from typing import Optional
import time

from app.schemas.ocr import OCRResult, TextRegion, BoundingBox


class OCRProvider(ABC):
    """OCR 提供商抽象基类"""
    
    def __init__(self, api_key: str, api_secret: Optional[str] = None):
        """
        初始化 OCR 提供商
        
        Args:
            api_key: API 密钥
            api_secret: API 密钥（某些提供商需要）
        """
        self.api_key = api_key
        self.api_secret = api_secret
        self.provider_name = self.__class__.__name__.replace("OCRProvider", "").lower()
    
    @abstractmethod
    async def recognize(self, image_bytes: bytes) -> OCRResult:
        """
        识别图像中的文本
        
        Args:
            image_bytes: 图像二进制数据
            
        Returns:
            OCRResult: OCR 识别结果
        """
        pass
    
    @abstractmethod
    async def recognize_printed(self, image_bytes: bytes) -> OCRResult:
        """
        识别印刷体文本
        
        Args:
            image_bytes: 图像二进制数据
            
        Returns:
            OCRResult: OCR 识别结果
        """
        pass
    
    @abstractmethod
    async def recognize_handwritten(self, image_bytes: bytes) -> OCRResult:
        """
        识别手写文本
        
        Args:
            image_bytes: 图像二进制数据
            
        Returns:
            OCRResult: OCR 识别结果
        """
        pass
    
    def classify_text_type(self, region: TextRegion) -> str:
        """
        分类文本类型（印刷体或手写）
        
        基于启发式规则：
        - 手写文本通常置信度较低
        - 手写文本字符间距不均匀
        
        Args:
            region: 文本区域
            
        Returns:
            str: "printed" 或 "handwritten"
        """
        # 简单启发式：置信度低于 0.85 可能是手写
        if region.confidence < 0.85:
            return "handwritten"
        return "printed"
    
    def merge_regions(self, regions: list[TextRegion], threshold: int = 20) -> list[TextRegion]:
        """
        合并相邻的文本区域
        
        Args:
            regions: 文本区域列表
            threshold: 合并阈值（像素）
            
        Returns:
            List[TextRegion]: 合并后的文本区域列表
        """
        if not regions:
            return []
        
        # 按 Y 坐标排序
        sorted_regions = sorted(regions, key=lambda r: r.bbox.y)
        merged = [sorted_regions[0]]
        
        for current in sorted_regions[1:]:
            last = merged[-1]
            
            # 检查是否在同一行（Y 坐标接近）
            if abs(current.bbox.y - last.bbox.y) < threshold:
                # 检查是否水平相邻
                if abs(current.bbox.x - (last.bbox.x + last.bbox.width)) < threshold:
                    # 合并区域
                    new_text = last.text + " " + current.text
                    new_bbox = BoundingBox(
                        x=min(last.bbox.x, current.bbox.x),
                        y=min(last.bbox.y, current.bbox.y),
                        width=max(
                            last.bbox.x + last.bbox.width,
                            current.bbox.x + current.bbox.width
                        ) - min(last.bbox.x, current.bbox.x),
                        height=max(
                            last.bbox.y + last.bbox.height,
                            current.bbox.y + current.bbox.height
                        ) - min(last.bbox.y, current.bbox.y)
                    )
                    new_confidence = (last.confidence + current.confidence) / 2
                    
                    merged[-1] = TextRegion(
                        text=new_text,
                        bbox=new_bbox,
                        confidence=new_confidence,
                        type=last.type
                    )
                else:
                    merged.append(current)
            else:
                merged.append(current)
        
        return merged
    
    def flag_low_confidence(self, regions: list[TextRegion], threshold: float = 0.8) -> list[int]:
        """
        标记低置信度区域
        
        Args:
            regions: 文本区域列表
            threshold: 置信度阈值
            
        Returns:
            List[int]: 低置信度区域的索引列表
        """
        return [i for i, region in enumerate(regions) if region.confidence < threshold]


class OCRProviderFactory:
    """OCR 提供商工厂"""
    
    _providers = {}
    
    @classmethod
    def register(cls, name: str, provider_class: type):
        """注册 OCR 提供商"""
        cls._providers[name.lower()] = provider_class
    
    @classmethod
    def create(cls, name: str, api_key: str, api_secret: Optional[str] = None) -> OCRProvider:
        """
        创建 OCR 提供商实例
        
        Args:
            name: 提供商名称
            api_key: API 密钥
            api_secret: API 密钥（可选）
            
        Returns:
            OCRProvider: OCR 提供商实例
        """
        provider_class = cls._providers.get(name.lower())
        if not provider_class:
            raise ValueError(f"Unknown OCR provider: {name}")
        
        return provider_class(api_key, api_secret)
    
    @classmethod
    def list_providers(cls) -> list[str]:
        """列出所有已注册的提供商"""
        return list(cls._providers.keys())
