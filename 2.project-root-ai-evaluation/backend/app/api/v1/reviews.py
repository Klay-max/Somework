"""
教师审核 API
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from typing import List, Optional
import logging
from datetime import datetime

from app.core.database import get_db
from app.models.review import ReviewTask, ReviewStatus, ReviewPriority
from app.models.exam import Exam
from app.models.user import User
from app.schemas.review import (
    ReviewQueueResponse,
    ReviewTaskDetail,
    ReviewSubmitRequest,
    ReviewSubmitResponse,
    ReviewStatsResponse,
    AIJudgment,
    TeacherJudgment
)
from app.schemas.analysis import QuestionAnalysis
from app.services.review_service import ReviewService
from app.api.v1.auth import get_current_user

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/queue", response_model=ReviewQueueResponse)
async def get_review_queue(
    priority: Optional[str] = Query(None, description="优先级过滤"),
    status_filter: Optional[str] = Query(None, description="状态过滤"),
    limit: int = Query(50, ge=1, le=100, description="返回数量"),
    offset: int = Query(0, ge=0, description="偏移量"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> ReviewQueueResponse:
    """
    获取审核队列
    
    Args:
        priority: 优先级过滤（high, medium, low）
        status_filter: 状态过滤（pending, in_progress, completed）
        limit: 返回数量
        offset: 偏移量
        current_user: 当前用户
        db: 数据库会话
        
    Returns:
        ReviewQueueResponse: 审核队列
    """
    # 构建查询条件
    conditions = []
    
    if priority:
        conditions.append(ReviewTask.priority == priority)
    
    if status_filter:
        conditions.append(ReviewTask.status == status_filter)
    else:
        # 默认只返回待审核和进行中的任务
        conditions.append(
            ReviewTask.status.in_([ReviewStatus.PENDING, ReviewStatus.IN_PROGRESS])
        )
    
    # 查询审核任务
    query = select(ReviewTask).where(and_(*conditions)) if conditions else select(ReviewTask)
    query = query.order_by(
        ReviewTask.priority.desc(),  # 优先级高的在前
        ReviewTask.created_at.asc()  # 创建时间早的在前
    ).limit(limit).offset(offset)
    
    result = await db.execute(query)
    review_tasks = result.scalars().all()
    
    # 查询总数
    count_query = select(func.count(ReviewTask.review_id)).where(and_(*conditions)) if conditions else select(func.count(ReviewTask.review_id))
    total_count = await db.scalar(count_query)
    
    # 查询待审核和进行中的数量
    pending_count = await db.scalar(
        select(func.count(ReviewTask.review_id)).where(
            ReviewTask.status == ReviewStatus.PENDING
        )
    )
    in_progress_count = await db.scalar(
        select(func.count(ReviewTask.review_id)).where(
            ReviewTask.status == ReviewStatus.IN_PROGRESS
        )
    )
    
    # 构建响应
    review_details = []
    for task in review_tasks:
        # 查询试卷信息
        exam = await db.get(Exam, task.exam_id)
        if not exam:
            continue
        
        # 构建 AI 判定
        ai_judgment = AIJudgment(**task.ai_judgment) if task.ai_judgment else AIJudgment(
            is_correct=None,
            confidence=0.0,
            error_reason=None,
            student_answer=None,
            correct_answer=None
        )
        
        # 构建审核任务详情
        detail = ReviewTaskDetail(
            review_id=str(task.review_id),
            exam_id=str(task.exam_id),
            question_id=task.question_id,
            assigned_to=str(task.assigned_to) if task.assigned_to else None,
            priority=task.priority.value,
            status=task.status.value,
            ai_judgment=ai_judgment,
            image_url=exam.original_image_url,
            answer_bbox=ai_judgment.dict().get("answer_bbox"),
            created_at=task.created_at,
            assigned_at=task.assigned_at,
            completed_at=task.completed_at
        )
        review_details.append(detail)
    
    logger.info(
        f"获取审核队列: user_id={current_user.user_id}, "
        f"total={total_count}, pending={pending_count}, in_progress={in_progress_count}"
    )
    
    return ReviewQueueResponse(
        reviews=review_details,
        total_count=total_count or 0,
        pending_count=pending_count or 0,
        in_progress_count=in_progress_count or 0
    )


@router.post("/{review_id}/submit", response_model=ReviewSubmitResponse)
async def submit_review(
    review_id: str,
    request: ReviewSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> ReviewSubmitResponse:
    """
    提交审核结果
    
    Args:
        review_id: 审核任务 ID
        request: 审核提交请求
        current_user: 当前用户
        db: 数据库会话
        
    Returns:
        ReviewSubmitResponse: 审核提交响应
    """
    # 查询审核任务
    review_task = await db.get(ReviewTask, review_id)
    
    if not review_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="审核任务不存在"
        )
    
    # 检查任务状态
    if review_task.status == ReviewStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="审核任务已完成"
        )
    
    # 构建教师判定
    teacher_judgment = TeacherJudgment(
        is_correct=request.is_correct,
        error_reason=request.error_reason,
        score_obtained=request.score_obtained,
        confidence=1.0  # 教师审核置信度为 1.0
    )
    
    # 更新审核任务
    review_task.teacher_judgment = teacher_judgment.dict()
    review_task.teacher_comment = request.teacher_comment
    review_task.status = ReviewStatus.COMPLETED
    review_task.completed_at = datetime.utcnow()
    
    # 更新试卷的分析结果
    exam = await db.get(Exam, review_task.exam_id)
    if exam and exam.analysis_result:
        analysis_result = exam.analysis_result
        
        # 查找对应的题目分析
        for qa_dict in analysis_result.get("question_analysis", []):
            if qa_dict["question_id"] == review_task.question_id:
                # 更新分析结果
                qa_dict["is_correct"] = teacher_judgment.is_correct
                qa_dict["error_reason"] = teacher_judgment.error_reason
                qa_dict["confidence"] = teacher_judgment.confidence
                qa_dict["review_status"] = "human_verified"
                
                if teacher_judgment.score_obtained is not None:
                    qa_dict["score_obtained"] = teacher_judgment.score_obtained
                
                # 检查是否需要重新生成报告
                # 这里简化处理，实际应该触发报告重新生成任务
                logger.info(
                    f"题目 {review_task.question_id} 审核完成，可能需要重新生成报告"
                )
                break
        
        # 更新试卷状态为已审核
        exam.status = "reviewed"
        
        # 保存更新
        await db.commit()
    
    logger.info(
        f"审核提交完成: review_id={review_id}, "
        f"teacher_id={current_user.user_id}, "
        f"is_correct={request.is_correct}"
    )
    
    return ReviewSubmitResponse(
        review_id=review_id,
        status="completed",
        updated_at=datetime.utcnow()
    )


@router.get("/stats", response_model=ReviewStatsResponse)
async def get_review_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> ReviewStatsResponse:
    """
    获取审核统计
    
    Args:
        current_user: 当前用户
        db: 数据库会话
        
    Returns:
        ReviewStatsResponse: 审核统计
    """
    # 查询所有审核任务
    result = await db.execute(select(ReviewTask))
    review_tasks = result.scalars().all()
    
    # 计算统计
    stats = ReviewService.compute_review_stats(review_tasks)
    
    logger.info(
        f"获取审核统计: user_id={current_user.user_id}, "
        f"total={stats['total_reviews']}, completed={stats['completed_reviews']}"
    )
    
    return ReviewStatsResponse(
        total_reviews=stats["total_reviews"],
        completed_reviews=stats["completed_reviews"],
        pending_reviews=stats["pending_reviews"],
        average_review_time=stats["average_review_time"],
        accuracy_improvement=None  # 需要更复杂的计算
    )


@router.post("/{review_id}/assign")
async def assign_review_task(
    review_id: str,
    teacher_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    分配审核任务
    
    Args:
        review_id: 审核任务 ID
        teacher_id: 教师 ID
        current_user: 当前用户
        db: 数据库会话
    """
    # 查询审核任务
    review_task = await db.get(ReviewTask, review_id)
    
    if not review_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="审核任务不存在"
        )
    
    # 分配任务
    review_task = ReviewService.assign_review(review_task, teacher_id)
    
    await db.commit()
    
    logger.info(
        f"分配审核任务: review_id={review_id}, teacher_id={teacher_id}"
    )
    
    return {"message": "审核任务已分配", "review_id": review_id, "teacher_id": teacher_id}
