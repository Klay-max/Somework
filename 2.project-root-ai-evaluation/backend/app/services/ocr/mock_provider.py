"""Mock OCR Provider for local development"""
from typing import List
import random
from .base import OCRProvider
from app.schemas.ocr import OCRResult, TextRegion, BoundingBox


class MockOCRProvider(OCRProvider):
    """Mock OCR provider that returns simulated results"""
    
    def __init__(self):
        """Initialize mock provider without API keys"""
        self.provider_name = "mock"
    
    async def recognize(self, image_bytes: bytes) -> OCRResult:
        """Return mock OCR results"""
        return await self._generate_mock_result()
    
    async def recognize_printed(self, image_bytes: bytes) -> OCRResult:
        """Return mock printed text results"""
        return await self._generate_mock_result(text_type="printed")
    
    async def recognize_handwritten(self, image_bytes: bytes) -> OCRResult:
        """Return mock handwritten text results"""
        return await self._generate_mock_result(text_type="handwritten")
    
    async def _generate_mock_result(self, text_type: str = "printed") -> OCRResult:
        """Generate mock OCR result with simulated exam content"""
        
        # 模拟试卷文本
        mock_text = """2023-2024学年第一学期期末考试
数学试卷
年级：高一
总分：150分

一、选择题（每题5分，共50分）
1. 下列函数中，在区间(0,+∞)上单调递增的是（  ）
A. y = -x²  B. y = 1/x  C. y = 2^x  D. y = log₀.₅x

2. 已知集合A={1,2,3}，B={2,3,4}，则A∩B=（  ）
A. {1}  B. {2,3}  C. {1,2,3,4}  D. ∅

3. 函数f(x)=x²-4x+3的对称轴是（  ）
A. x=1  B. x=2  C. x=3  D. x=4

二、填空题（每题5分，共30分）
11. 函数f(x)=x²-2x+1的最小值为______

12. 若log₂x=3，则x=______

13. 已知sinα=3/5，α∈(0,π/2)，则cosα=______

三、解答题（共70分）
21. （15分）解方程：x²-5x+6=0

22. （20分）已知函数f(x)=2x+1，求f(3)的值

23. （35分）证明：对于任意实数x，都有x²+2x+2>0"""
        
        # 模拟文本区域
        regions = []
        lines = mock_text.strip().split('\n')
        y_offset = 100
        
        for line in lines:
            if line.strip():
                regions.append(TextRegion(
                    text=line.strip(),
                    bbox=BoundingBox(
                        x=50,
                        y=y_offset,
                        width=800,
                        height=30
                    ),
                    confidence=random.uniform(0.85, 0.99),
                    type=text_type
                ))
                y_offset += 40
        
        return OCRResult(
            full_text=mock_text.strip(),
            regions=regions,
            confidence=random.uniform(0.90, 0.98),
            provider=self.provider_name
        )
