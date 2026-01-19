"""
学生作答分析相关的 Pydantic 模型
"""
from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel, Field

from app.schemas.ocr import BoundingBox


class AnswerEvidence(BaseModel):
    """答案证据"""
    answer_bbox: Optional[BoundingBox] = Field(None, description="答案在图像中的边界框")
    ocr_confidence: float = Field(..., ge=0.0, le=1.0, description="OCR 置信度")
    answer_clarity: Optional[float] = Field(None, ge=0.0, le=1.0, description="答案清晰度")


class QuestionAnalysis(BaseModel):
    """题目分析结果"""
    question_id: str = Field(..., description="题目 ID")
    student_answer: Optional[str] = Field(None, description="学生答案")
    correct_answer: Optional[str] = Field(None, description="正确答案")
    is_correct: Optional[bool] = Field(None, description="是否正确")
    confidence: float = Field(..., ge=0.0, le=1.0, description="判定置信度")
    error_reason: Optional[str] = Field(None, description="错误原因")
    review_status: Literal["ai_confident", "ai_pending_review", "human_verified"] = Field(
        ..., description="审核状态"
    )
    evidence: AnswerEvidence = Field(..., description="证据")
    score_obtained: Optional[float] = Field(None, description="获得分数")
    score_total: Optional[float] = Field(None, description="总分")


class OverallStats(BaseModel):
    """整体统计"""
    total_questions: int = Field(..., description="总题数")
    correct_count: int = Field(..., description="正确题数")
    objective_accuracy: float = Field(..., ge=0.0, le=1.0, description="客观题正确率")
    subjective_accuracy: float = Field(..., ge=0.0, le=1.0, description="主观题正确率")
    pending_review_count: int = Field(..., description="待审核题数")
    total_score: Optional[float] = Field(None, description="总得分")
    max_score: Optional[float] = Field(None, description="满分")


class AnalysisRequest(BaseModel):
    """分析请求"""
    exam_id: str = Field(..., description="试卷 ID")
    use_deepseek: bool = Field(True, description="是否使用 DeepSeek 进行主观题评分")


class AnalysisResponse(BaseModel):
    """分析响应"""
    exam_id: str = Field(..., description="试卷 ID")
    question_analysis: List[QuestionAnalysis] = Field(..., description="题目分析列表")
    overall_stats: OverallStats = Field(..., description="整体统计")
