"""
教师审核任务模型
"""
from sqlalchemy import Column, String, DateTime, ForeignKey, Enum as SQLEnum, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from app.core.database import Base


class ReviewPriority(str, enum.Enum):
    """审核优先级"""
    HIGH = "high"      # confidence < 0.5
    MEDIUM = "medium"  # 0.5 <= confidence < 0.8
    LOW = "low"        # confidence >= 0.8


class ReviewStatus(str, enum.Enum):
    """审核状态"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class ReviewTask(Base):
    """教师审核任务模型"""
    __tablename__ = "review_tasks"
    
    review_id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    exam_id = Column(
        UUID(as_uuid=True),
        ForeignKey("exams.exam_id"),
        nullable=False,
        index=True
    )
    question_id = Column(String(50), nullable=False, index=True)
    
    # 分配信息
    assigned_to = Column(
        UUID(as_uuid=True),
        ForeignKey("users.user_id"),
        nullable=True,
        index=True
    )
    
    # 优先级和状态
    priority = Column(
        SQLEnum(ReviewPriority),
        default=ReviewPriority.MEDIUM,
        nullable=False,
        index=True
    )
    status = Column(
        SQLEnum(ReviewStatus),
        default=ReviewStatus.PENDING,
        nullable=False,
        index=True
    )
    
    # AI 判定信息（用于教师参考）
    ai_judgment = Column(JSONB, nullable=True)
    
    # 教师审核结果
    teacher_judgment = Column(JSONB, nullable=True)
    teacher_comment = Column(Text, nullable=True)
    
    # 时间戳
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    assigned_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    
    # 关系
    # exam = relationship("Exam", back_populates="review_tasks")
    # teacher = relationship("User", back_populates="review_tasks")
    
    def __repr__(self):
        return f"<ReviewTask(review_id={self.review_id}, exam_id={self.exam_id}, question_id={self.question_id}, status={self.status})>"
