"""
OCR 相关的 Pydantic 模型
"""
from typing import List, Optional, Literal
from pydantic import BaseModel, Field


class BoundingBox(BaseModel):
    """边界框坐标"""
    x: int = Field(..., description="左上角 X 坐标")
    y: int = Field(..., description="左上角 Y 坐标")
    width: int = Field(..., description="宽度")
    height: int = Field(..., description="高度")


class TextRegion(BaseModel):
    """文本区域"""
    text: str = Field(..., description="识别的文本内容")
    bbox: BoundingBox = Field(..., description="边界框")
    confidence: float = Field(..., ge=0.0, le=1.0, description="置信度 (0-1)")
    type: Literal["printed", "handwritten"] = Field(..., description="文本类型：印刷体或手写")


class OCRResult(BaseModel):
    """OCR 识别结果"""
    text_regions: List[TextRegion] = Field(..., description="文本区域列表")
    overall_confidence: float = Field(..., ge=0.0, le=1.0, description="整体置信度")
    processing_time: float = Field(..., description="处理时间（秒）")
    provider: str = Field(..., description="OCR 提供商名称")


class OCRRequest(BaseModel):
    """OCR 识别请求"""
    exam_id: str = Field(..., description="试卷 ID")
    provider: Optional[str] = Field(None, description="指定 OCR 提供商（可选）")


class OCRResponse(BaseModel):
    """OCR 识别响应"""
    exam_id: str = Field(..., description="试卷 ID")
    text_regions: List[TextRegion] = Field(..., description="文本区域列表")
    overall_confidence: float = Field(..., description="整体置信度")
    low_confidence_regions: List[int] = Field(
        default_factory=list,
        description="低置信度区域索引列表（置信度 < 0.8）"
    )
