"""
书写分析相关的 Pydantic 模型
"""
from typing import List, Optional, Literal
from pydantic import BaseModel, Field


class HandwritingMetrics(BaseModel):
    """书写质量指标"""
    messy_score: float = Field(..., ge=0.0, le=1.0, description="凌乱度（0-1，越大越凌乱）")
    cross_out_count: int = Field(..., ge=0, description="涂改次数")
    alignment_issue: bool = Field(..., description="是否有对齐问题")
    risk_of_machine_misread: Literal["low", "medium", "high"] = Field(..., description="机器误读风险")
    
    # 详细分析
    stroke_clarity: Optional[float] = Field(None, ge=0.0, le=1.0, description="笔画清晰度")
    spacing_consistency: Optional[float] = Field(None, ge=0.0, le=1.0, description="间距一致性")
    size_consistency: Optional[float] = Field(None, ge=0.0, le=1.0, description="大小一致性")
    boundary_violations: Optional[int] = Field(None, ge=0, description="边界违规次数")


class HandwritingAnalysisRequest(BaseModel):
    """书写分析请求"""
    exam_id: str = Field(..., description="试卷 ID")


class HandwritingAnalysisResponse(BaseModel):
    """书写分析响应"""
    exam_id: str = Field(..., description="试卷 ID")
    handwriting_metrics: HandwritingMetrics = Field(..., description="书写质量指标")
