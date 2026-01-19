"""
诊断报告数据模型
"""
from typing import List, Dict, Optional
from pydantic import BaseModel, Field


class CapabilityDimensions(BaseModel):
    """五维能力评分"""
    comprehension: float = Field(..., ge=0.0, le=1.0, description="理解能力")
    application: float = Field(..., ge=0.0, le=1.0, description="应用能力")
    analysis: float = Field(..., ge=0.0, le=1.0, description="分析能力")
    synthesis: float = Field(..., ge=0.0, le=1.0, description="综合能力")
    evaluation: float = Field(..., ge=0.0, le=1.0, description="评价能力")


class Issue(BaseModel):
    """问题（表层或深层）"""
    issue: str = Field(..., description="问题描述")
    severity: str = Field(..., description="严重程度: low/medium/high")
    evidence: List[str] = Field(..., description="证据列表")
    ai_addressable: bool = Field(..., description="是否可通过AI解决")
    consequence: Optional[str] = Field(None, description="后果说明")
    root_cause: Optional[str] = Field(None, description="根本原因（仅深层问题）")


class TargetSchoolGap(BaseModel):
    """目标学校差距"""
    target_school: str = Field(..., description="目标学校")
    score_gap: float = Field(..., description="分数差距")
    admission_probability: float = Field(..., ge=0.0, le=1.0, description="录取概率")
    key_improvement_areas: List[str] = Field(..., description="关键提升领域")


class DiagnosticReport(BaseModel):
    """诊断报告"""
    exam_id: str = Field(..., description="试卷ID")
    capability_dimensions: CapabilityDimensions = Field(..., description="五维能力评分")
    surface_issues: List[Issue] = Field(..., description="表层问题（30%）")
    deep_issues: List[Issue] = Field(..., description="深层问题（70%）")
    target_school_gap: Optional[TargetSchoolGap] = Field(None, description="目标学校差距")


class DiagnosticRequest(BaseModel):
    """诊断请求"""
    exam_id: str = Field(..., description="试卷ID")
    target_school: Optional[str] = Field(None, description="目标学校")


class DiagnosticResponse(BaseModel):
    """诊断响应"""
    exam_id: str = Field(..., description="试卷ID")
    diagnostic_report: DiagnosticReport = Field(..., description="诊断报告")
    status: str = Field(..., description="状态")
