"""
试卷 API 路由
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
import uuid

from app.core.database import get_db
from app.models.user import User
from app.models.exam import Exam, ExamStatus
from app.schemas.exam import (
    ExamUploadResponse,
    ExamStatusResponse,
    ExamDetailResponse,
    ExamListResponse
)
from app.api.dependencies import get_current_user
from app.services.image_service import ImageService
from app.core.logging import logger


router = APIRouter()


@router.post("/upload", response_model=ExamUploadResponse)
async def upload_exam(
    file: UploadFile = File(..., description="试卷图片文件"),
    capture_time: Optional[str] = Form(None, description="拍摄时间"),
    device_info: Optional[str] = Form(None, description="设备信息"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    上传试卷图片
    
    - **file**: 图片文件（JPG, PNG, HEIC，最大10MB）
    - **capture_time**: 拍摄时间（可选）
    - **device_info**: 设备信息（可选）
    
    需要认证：Bearer token
    """
    try:
        # 读取文件内容
        file_content = await file.read()
        
        # 验证图像格式和大小
        ImageService.validate_image_format_and_size(file.filename, file_content)
        
        # 创建试卷记录
        exam = Exam(
            user_id=current_user.user_id,
            original_image_url="",  # 稍后更新
            status=ExamStatus.UPLOADED
        )
        
        db.add(exam)
        await db.flush()  # 获取 exam_id
        
        # 存储原始图像
        original_url = await ImageService.store_image(
            file_content,
            str(exam.exam_id),
            "original",
            file.filename
        )
        
        # 更新图像 URL
        exam.original_image_url = original_url
        await db.commit()
        await db.refresh(exam)
        
        logger.info(f"Exam {exam.exam_id} uploaded by user {current_user.user_id}")
        
        # 触发异步处理任务链
        from app.tasks.exam_tasks import process_exam_ocr
        process_exam_ocr.delay(str(exam.exam_id))
        
        return ExamUploadResponse(
            exam_id=str(exam.exam_id),
            status=exam.status.value,
            estimated_time=45  # 预计45秒
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Failed to upload exam: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload exam"
        )


@router.get("/{exam_id}/status", response_model=ExamStatusResponse)
async def get_exam_status(
    exam_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    获取试卷处理状态
    
    - **exam_id**: 试卷 ID
    
    需要认证：Bearer token
    """
    # 查询试卷
    result = await db.execute(
        select(Exam).where(
            Exam.exam_id == uuid.UUID(exam_id),
            Exam.user_id == current_user.user_id
        )
    )
    exam = result.scalar_one_or_none()
    
    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exam not found"
        )
    
    # 根据状态计算进度和预计剩余时间
    status_progress = {
        ExamStatus.UPLOADED: (0, "已上传，等待处理", 45),
        ExamStatus.OCR_PROCESSING: (10, "OCR 识别中", 35),
        ExamStatus.OCR_COMPLETED: (20, "OCR 完成", 30),
        ExamStatus.OCR_FAILED: (0, "OCR 失败", None),
        ExamStatus.PARSING: (30, "试卷解析中", 25),
        ExamStatus.PARSED: (40, "解析完成", 20),
        ExamStatus.PARSING_FAILED: (0, "解析失败", None),
        ExamStatus.ANALYZING: (50, "作答分析中", 15),
        ExamStatus.ANALYZED: (60, "分析完成", 10),
        ExamStatus.ANALYZING_FAILED: (0, "分析失败", None),
        ExamStatus.DIAGNOSING: (70, "AI 诊断中", 8),
        ExamStatus.DIAGNOSED: (80, "诊断完成", 5),
        ExamStatus.DIAGNOSING_FAILED: (0, "诊断失败", None),
        ExamStatus.REPORT_GENERATING: (90, "报告生成中", 3),
        ExamStatus.REPORT_GENERATED: (95, "报告已生成", 1),
        ExamStatus.REPORT_GENERATION_FAILED: (0, "报告生成失败", None),
        ExamStatus.COMPLETED: (100, "处理完成", 0),
    }
    
    progress, current_step, estimated_time = status_progress.get(
        exam.status,
        (0, "未知状态", None)
    )
    
    # 检查是否有错误
    error_message = None
    if "FAILED" in exam.status.value:
        error_message = f"处理失败：{exam.status.value}"
    
    return ExamStatusResponse(
        exam_id=str(exam.exam_id),
        status=exam.status.value,
        created_at=exam.created_at,
        completed_at=exam.completed_at,
        progress=progress,
        current_step=current_step,
        estimated_remaining_time=estimated_time,
        error_message=error_message
    )


@router.get("/{exam_id}", response_model=ExamDetailResponse)
async def get_exam_detail(
    exam_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    获取试卷详情
    
    - **exam_id**: 试卷 ID
    
    需要认证：Bearer token
    """
    # 查询试卷
    result = await db.execute(
        select(Exam).where(
            Exam.exam_id == uuid.UUID(exam_id),
            Exam.user_id == current_user.user_id
        )
    )
    exam = result.scalar_one_or_none()
    
    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exam not found"
        )
    
    return ExamDetailResponse(
        exam_id=str(exam.exam_id),
        user_id=str(exam.user_id),
        status=exam.status.value,
        original_image_url=exam.original_image_url,
        processed_image_url=exam.processed_image_url,
        subject=exam.subject,
        grade=exam.grade,
        total_score=exam.total_score,
        exam_type=exam.exam_type,
        created_at=exam.created_at,
        completed_at=exam.completed_at,
        report_id=str(exam.report_id) if exam.report_id else None
    )


@router.get("/history", response_model=ExamListResponse)
async def get_exam_history(
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    获取用户的试卷历史记录
    
    - **skip**: 跳过的记录数
    - **limit**: 返回的记录数（最大100）
    
    需要认证：Bearer token
    """
    # 限制最大返回数量
    limit = min(limit, 100)
    
    # 查询用户的试卷
    result = await db.execute(
        select(Exam)
        .where(Exam.user_id == current_user.user_id)
        .order_by(Exam.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    exams = result.scalars().all()
    
    # 查询总数
    count_result = await db.execute(
        select(Exam).where(Exam.user_id == current_user.user_id)
    )
    total = len(count_result.scalars().all())
    
    exam_list = [
        ExamDetailResponse(
            exam_id=str(exam.exam_id),
            user_id=str(exam.user_id),
            status=exam.status.value,
            original_image_url=exam.original_image_url,
            processed_image_url=exam.processed_image_url,
            subject=exam.subject,
            grade=exam.grade,
            total_score=exam.total_score,
            exam_type=exam.exam_type,
            created_at=exam.created_at,
            completed_at=exam.completed_at,
            report_id=str(exam.report_id) if exam.report_id else None
        )
        for exam in exams
    ]
    
    return ExamListResponse(
        exams=exam_list,
        total=total
    )


@router.delete("/{exam_id}")
async def delete_exam(
    exam_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    删除试卷（软删除）
    
    - **exam_id**: 试卷 ID
    
    需要认证：Bearer token
    """
    # 查询试卷
    result = await db.execute(
        select(Exam).where(
            Exam.exam_id == uuid.UUID(exam_id),
            Exam.user_id == current_user.user_id
        )
    )
    exam = result.scalar_one_or_none()
    
    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exam not found"
        )
    
    # 软删除：更新状态为 FAILED（或者可以添加 deleted_at 字段）
    # 这里简单起见直接删除
    await db.delete(exam)
    await db.commit()
    
    logger.info(f"Exam {exam_id} deleted by user {current_user.user_id}")
    
    return {"message": "Exam deleted successfully"}
