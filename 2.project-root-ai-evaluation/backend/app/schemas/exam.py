"""
试卷相关的 Pydantic 模式
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ExamUploadResponse(BaseModel):
    """试卷上传响应"""
    exam_id: str
    status: str
    estimated_time: int = Field(..., description="预计处理时间（秒）")
    message: str = "Exam uploaded successfully"


class ExamStatusResponse(BaseModel):
    """试卷状态响应"""
    exam_id: str
    status: str
    created_at: datetime
    completed_at: Optional[datetime] = None
    progress: int = Field(..., description="处理进度（0-100）")
    current_step: str = Field(..., description="当前处理步骤")
    estimated_remaining_time: Optional[int] = Field(None, description="预计剩余时间（秒）")
    error_message: Optional[str] = Field(None, description="错误信息（如果失败）")


class ExamDetailResponse(BaseModel):
    """试卷详情响应"""
    exam_id: str
    user_id: str
    status: str
    original_image_url: str
    processed_image_url: Optional[str]
    subject: Optional[str]
    grade: Optional[str]
    total_score: Optional[int]
    exam_type: Optional[str]
    created_at: datetime
    completed_at: Optional[datetime]
    report_id: Optional[str]
    
    class Config:
        from_attributes = True


class ExamListResponse(BaseModel):
    """试卷列表响应"""
    exams: list[ExamDetailResponse]
    total: int
