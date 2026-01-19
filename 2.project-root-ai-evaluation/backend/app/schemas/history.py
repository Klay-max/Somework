"""
历史记录相关的数据模型
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class ExamHistoryItem(BaseModel):
    """历史记录项"""
    exam_id: UUID
    created_at: datetime
    subject: Optional[str] = None
    grade: Optional[str] = None
    total_score: Optional[int] = None
    student_score: Optional[int] = None  # 从 analysis_result 中提取
    status: str
    thumbnail_url: Optional[str] = None  # 缩略图 URL
    
    class Config:
        from_attributes = True


class ExamHistoryResponse(BaseModel):
    """历史记录响应"""
    exams: List[ExamHistoryItem]
    total_count: int
    page: int = 1
    page_size: int = 20


class ExamDetailResponse(BaseModel):
    """试卷详情响应"""
    exam_id: UUID
    user_id: UUID
    created_at: datetime
    completed_at: Optional[datetime] = None
    status: str
    
    # 试卷元数据
    subject: Optional[str] = None
    grade: Optional[str] = None
    total_score: Optional[int] = None
    exam_type: Optional[str] = None
    
    # 图像 URL
    original_image_url: str
    processed_image_url: Optional[str] = None
    
    # 报告 URL（如果已生成）
    report_html_url: Optional[str] = None
    report_pdf_url: Optional[str] = None
    
    # 统计信息（从 analysis_result 中提取）
    total_questions: Optional[int] = None
    correct_count: Optional[int] = None
    objective_accuracy: Optional[float] = None
    subjective_accuracy: Optional[float] = None
    
    class Config:
        from_attributes = True


class ExamDeleteRequest(BaseModel):
    """试卷删除请求"""
    exam_id: UUID


class ExamDeleteResponse(BaseModel):
    """试卷删除响应"""
    exam_id: UUID
    deleted_at: datetime
    recovery_deadline: datetime  # 30 天后永久删除
    message: str = "试卷已删除，30 天内可恢复"
