"""
试卷模型
"""
from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, Enum as SQLEnum, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from app.core.database import Base


class ExamStatus(str, enum.Enum):
    """试卷处理状态"""
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    OCR_COMPLETED = "ocr_completed"
    OCR_FAILED = "ocr_failed"
    PARSING = "parsing"
    PARSED = "parsed"  # 添加 PARSED 状态
    PARSING_FAILED = "parsing_failed"
    ANALYZING = "analyzing"
    ANALYZED = "analyzed"  # 添加 ANALYZED 状态
    ANALYZING_FAILED = "analyzing_failed"
    DIAGNOSING = "diagnosing"  # 添加 DIAGNOSING 状态
    DIAGNOSED = "diagnosed"  # 添加 DIAGNOSED 状态
    DIAGNOSING_FAILED = "diagnosing_failed"
    REVIEWED = "reviewed"  # 添加 REVIEWED 状态（教师审核后）
    COMPLETED = "completed"
    FAILED = "failed"


class Exam(Base):
    """试卷模型"""
    __tablename__ = "exams"
    
    exam_id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.user_id"),
        nullable=False,
        index=True
    )
    
    # 图像信息
    original_image_url = Column(String(500), nullable=False)
    processed_image_url = Column(String(500), nullable=True)
    
    # 状态
    status = Column(
        SQLEnum(ExamStatus),
        default=ExamStatus.UPLOADED,
        nullable=False,
        index=True
    )
    
    # 时间戳
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    
    # 试卷元数据
    subject = Column(String(50), nullable=True)
    grade = Column(String(50), nullable=True)
    total_score = Column(Integer, nullable=True)
    exam_type = Column(String(50), nullable=True)
    
    # 处理结果（JSON 格式）
    ocr_result = Column(JSONB, nullable=True)
    parsed_result = Column(JSONB, nullable=True)  # 解析结果
    analysis_result = Column(JSONB, nullable=True)  # 分析结果
    handwriting_metrics = Column(JSONB, nullable=True)
    diagnostic_report = Column(JSONB, nullable=True)
    
    # 错误信息
    error_message = Column(Text, nullable=True)
    
    # 报告 ID
    report_id = Column(UUID(as_uuid=True), nullable=True)
    
    # 软删除
    is_deleted = Column(Boolean, default=False, nullable=False, index=True)
    deleted_at = Column(DateTime, nullable=True)
    
    # 关系
    # user = relationship("User", back_populates="exams")
    
    def __repr__(self):
        return f"<Exam(exam_id={self.exam_id}, user_id={self.user_id}, status={self.status})>"
