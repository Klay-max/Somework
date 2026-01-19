"""
教师审核相关的 Pydantic 模型
"""
from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

from app.schemas.ocr import BoundingBox


class AIJudgment(BaseModel):
    """AI 判定信息"""
    is_correct: Optional[bool] = Field(None, description="是否正确")
    confidence: float = Field(..., ge=0.0, le=1.0, description="置信度")
    error_reason: Optional[str] = Field(None, description="错误原因")
    student_answer: Optional[str] = Field(None, description="学生答案")
    correct_answer: Optional[str] = Field(None, description="正确答案")


class TeacherJudgment(BaseModel):
    """教师判定信息"""
    is_correct: bool = Field(..., description="是否正确")
    error_reason: Optional[str] = Field(None, description="错误原因")
    score_obtained: Optional[float] = Field(None, description="获得分数")
    confidence: float = Field(1.0, ge=0.0, le=1.0, description="置信度（教师审核默认 1.0）")


class ReviewTaskDetail(BaseModel):
    """审核任务详情"""
    review_id: str = Field(..., description="审核任务 ID")
    exam_id: str = Field(..., description="试卷 ID")
    question_id: str = Field(..., description="题目 ID")
    assigned_to: Optional[str] = Field(None, description="分配给的教师 ID")
    priority: Literal["high", "medium", "low"] = Field(..., description="优先级")
    status: Literal["pending", "in_progress", "completed", "cancelled"] = Field(..., description="状态")
    
    # AI 判定信息
    ai_judgment: AIJudgment = Field(..., description="AI 判定")
    
    # 图像信息
    image_url: str = Field(..., description="试卷图像 URL")
    answer_bbox: Optional[BoundingBox] = Field(None, description="答案边界框")
    
    # 时间戳
    created_at: datetime = Field(..., description="创建时间")
    assigned_at: Optional[datetime] = Field(None, description="分配时间")
    completed_at: Optional[datetime] = Field(None, description="完成时间")


class ReviewQueueResponse(BaseModel):
    """审核队列响应"""
    reviews: List[ReviewTaskDetail] = Field(..., description="审核任务列表")
    total_count: int = Field(..., description="总数")
    pending_count: int = Field(..., description="待审核数")
    in_progress_count: int = Field(..., description="进行中数")


class ReviewSubmitRequest(BaseModel):
    """审核提交请求"""
    is_correct: bool = Field(..., description="是否正确")
    error_reason: Optional[str] = Field(None, description="错误原因")
    teacher_comment: Optional[str] = Field(None, description="教师评论")
    score_obtained: Optional[float] = Field(None, description="获得分数")


class ReviewSubmitResponse(BaseModel):
    """审核提交响应"""
    review_id: str = Field(..., description="审核任务 ID")
    status: str = Field(..., description="状态")
    updated_at: datetime = Field(..., description="更新时间")


class ReviewStatsResponse(BaseModel):
    """审核统计响应"""
    total_reviews: int = Field(..., description="总审核数")
    completed_reviews: int = Field(..., description="已完成审核数")
    pending_reviews: int = Field(..., description="待审核数")
    average_review_time: Optional[float] = Field(None, description="平均审核时间（秒）")
    accuracy_improvement: Optional[float] = Field(None, description="准确率提升")
