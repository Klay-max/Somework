"""
书写分析 API
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import logging

from app.core.database import get_db
from app.models.exam import Exam, ExamStatus
from app.models.user import User
from app.schemas.handwriting import (
    HandwritingAnalysisRequest,
    HandwritingAnalysisResponse
)
from app.schemas.ocr import OCRResult
from app.services.handwriting_service import HandwritingService
from app.api.v1.auth import get_current_user

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/analyze", response_model=HandwritingAnalysisResponse)
async def analyze_handwriting(
    request: HandwritingAnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> HandwritingAnalysisResponse:
    """
    分析书写质量
    
    Args:
        request: 书写分析请求
        current_user: 当前用户
        db: 数据库会话
        
    Returns:
        HandwritingAnalysisResponse: 书写分析响应
    """
    # 查询试卷
    result = await db.execute(
        "SELECT * FROM exams WHERE exam_id = :exam_id AND user_id = :user_id",
        {"exam_id": request.exam_id, "user_id": current_user.user_id}
    )
    exam = result.fetchone()
    
    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="试卷不存在"
        )
    
    # 检查试卷状态（需要有 OCR 结果）
    if exam.status not in [ExamStatus.OCR_COMPLETED, ExamStatus.PARSED, ExamStatus.ANALYZED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"试卷状态不正确，当前状态: {exam.status}"
        )
    
    # 获取 OCR 结果
    if not exam.ocr_result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="试卷缺少 OCR 结果"
        )
    
    try:
        # 解析 OCR 结果
        ocr_result = OCRResult(**exam.ocr_result)
        
        # 执行书写分析
        handwriting_metrics = HandwritingService.analyze_handwriting(
            ocr_result.text_regions
        )
        
        # 更新试卷的书写指标
        await db.execute(
            """
            UPDATE exams 
            SET handwriting_metrics = :metrics 
            WHERE exam_id = :exam_id
            """,
            {
                "metrics": handwriting_metrics.dict(),
                "exam_id": request.exam_id
            }
        )
        await db.commit()
        
        logger.info(f"试卷 {request.exam_id} 书写分析完成")
        
        return HandwritingAnalysisResponse(
            exam_id=request.exam_id,
            handwriting_metrics=handwriting_metrics
        )
    
    except Exception as e:
        logger.error(f"书写分析失败: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"书写分析失败: {str(e)}"
        )


@router.get("/{exam_id}", response_model=HandwritingAnalysisResponse)
async def get_handwriting_analysis(
    exam_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> HandwritingAnalysisResponse:
    """
    获取书写分析结果
    
    Args:
        exam_id: 试卷 ID
        current_user: 当前用户
        db: 数据库会话
        
    Returns:
        HandwritingAnalysisResponse: 书写分析响应
    """
    # 查询试卷
    result = await db.execute(
        "SELECT * FROM exams WHERE exam_id = :exam_id AND user_id = :user_id",
        {"exam_id": exam_id, "user_id": current_user.user_id}
    )
    exam = result.fetchone()
    
    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="试卷不存在"
        )
    
    # 返回书写分析结果
    if not exam.handwriting_metrics:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="书写分析结果不存在"
        )
    
    try:
        from app.schemas.handwriting import HandwritingMetrics
        metrics = HandwritingMetrics(**exam.handwriting_metrics)
        
        return HandwritingAnalysisResponse(
            exam_id=exam_id,
            handwriting_metrics=metrics
        )
    except Exception as e:
        logger.error(f"解析书写分析结果失败: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="解析书写分析结果失败"
        )
