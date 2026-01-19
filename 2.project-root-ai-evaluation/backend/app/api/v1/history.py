"""
历史记录 API 端点
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, desc
from typing import Optional
from datetime import datetime, timedelta
from uuid import UUID
import logging

from app.core.database import get_db
from app.models.exam import Exam
from app.schemas.history import (
    ExamHistoryResponse,
    ExamHistoryItem,
    ExamDetailResponse,
    ExamDeleteResponse
)
from app.api.dependencies import get_current_user

router = APIRouter(prefix="/exams", tags=["history"])
logger = logging.getLogger(__name__)


@router.get("/history", response_model=ExamHistoryResponse)
async def get_exam_history(
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=100, description="每页数量"),
    subject: Optional[str] = Query(None, description="科目筛选"),
    status: Optional[str] = Query(None, description="状态筛选"),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    获取用户的试卷历史记录
    
    按时间倒序返回用户的所有试卷记录（不包括已删除的）
    """
    try:
        user_id = UUID(current_user["user_id"])
        
        # 构建查询条件
        conditions = [
            Exam.user_id == user_id,
            Exam.is_deleted == False
        ]
        
        if subject:
            conditions.append(Exam.subject == subject)
        
        if status:
            conditions.append(Exam.status == status)
        
        # 查询总数
        count_query = select(Exam).where(and_(*conditions))
        result = await db.execute(count_query)
        total_count = len(result.scalars().all())
        
        # 分页查询
        offset = (page - 1) * page_size
        query = (
            select(Exam)
            .where(and_(*conditions))
            .order_by(desc(Exam.created_at))
            .offset(offset)
            .limit(page_size)
        )
        
        result = await db.execute(query)
        exams = result.scalars().all()
        
        # 转换为响应格式
        exam_items = []
        for exam in exams:
            # 从 analysis_result 中提取学生得分
            student_score = None
            if exam.analysis_result and "overall_stats" in exam.analysis_result:
                student_score = exam.analysis_result["overall_stats"].get("correct_count")
            
            exam_item = ExamHistoryItem(
                exam_id=exam.exam_id,
                created_at=exam.created_at,
                subject=exam.subject,
                grade=exam.grade,
                total_score=exam.total_score,
                student_score=student_score,
                status=exam.status.value,
                thumbnail_url=exam.processed_image_url or exam.original_image_url
            )
            exam_items.append(exam_item)
        
        return ExamHistoryResponse(
            exams=exam_items,
            total_count=total_count,
            page=page,
            page_size=page_size
        )
        
    except Exception as e:
        logger.error(f"获取历史记录失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"获取历史记录失败: {str(e)}")


@router.get("/{exam_id}", response_model=ExamDetailResponse)
async def get_exam_detail(
    exam_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    获取试卷详情
    
    返回试卷的完整信息，包括报告 URL
    """
    try:
        user_id = UUID(current_user["user_id"])
        
        # 查询试卷
        query = select(Exam).where(
            and_(
                Exam.exam_id == exam_id,
                Exam.user_id == user_id,
                Exam.is_deleted == False
            )
        )
        result = await db.execute(query)
        exam = result.scalar_one_or_none()
        
        if not exam:
            raise HTTPException(status_code=404, detail="试卷不存在或已被删除")
        
        # 从 analysis_result 中提取统计信息
        total_questions = None
        correct_count = None
        objective_accuracy = None
        subjective_accuracy = None
        
        if exam.analysis_result and "overall_stats" in exam.analysis_result:
            stats = exam.analysis_result["overall_stats"]
            total_questions = stats.get("total_questions")
            correct_count = stats.get("correct_count")
            objective_accuracy = stats.get("objective_accuracy")
            subjective_accuracy = stats.get("subjective_accuracy")
        
        # 构建报告 URL（如果已生成）
        report_html_url = None
        report_pdf_url = None
        if exam.report_id:
            # 这里应该从报告服务获取实际 URL
            # 暂时使用模拟 URL
            report_html_url = f"https://oss.example.com/reports/{exam.report_id}.html"
            report_pdf_url = f"https://oss.example.com/reports/{exam.report_id}.pdf"
        
        return ExamDetailResponse(
            exam_id=exam.exam_id,
            user_id=exam.user_id,
            created_at=exam.created_at,
            completed_at=exam.completed_at,
            status=exam.status.value,
            subject=exam.subject,
            grade=exam.grade,
            total_score=exam.total_score,
            exam_type=exam.exam_type,
            original_image_url=exam.original_image_url,
            processed_image_url=exam.processed_image_url,
            report_html_url=report_html_url,
            report_pdf_url=report_pdf_url,
            total_questions=total_questions,
            correct_count=correct_count,
            objective_accuracy=objective_accuracy,
            subjective_accuracy=subjective_accuracy
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取试卷详情失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"获取试卷详情失败: {str(e)}")


@router.delete("/{exam_id}", response_model=ExamDeleteResponse)
async def delete_exam(
    exam_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    删除试卷（软删除）
    
    试卷将被标记为已删除，30 天内可恢复
    """
    try:
        user_id = UUID(current_user["user_id"])
        
        # 查询试卷
        query = select(Exam).where(
            and_(
                Exam.exam_id == exam_id,
                Exam.user_id == user_id,
                Exam.is_deleted == False
            )
        )
        result = await db.execute(query)
        exam = result.scalar_one_or_none()
        
        if not exam:
            raise HTTPException(status_code=404, detail="试卷不存在或已被删除")
        
        # 软删除
        deleted_at = datetime.utcnow()
        recovery_deadline = deleted_at + timedelta(days=30)
        
        exam.is_deleted = True
        exam.deleted_at = deleted_at
        
        await db.commit()
        
        logger.info(f"试卷已删除: {exam_id}, 用户: {user_id}")
        
        return ExamDeleteResponse(
            exam_id=exam_id,
            deleted_at=deleted_at,
            recovery_deadline=recovery_deadline
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"删除试卷失败: {str(e)}")
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"删除试卷失败: {str(e)}")
