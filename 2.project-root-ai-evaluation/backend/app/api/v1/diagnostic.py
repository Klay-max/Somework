"""
诊断 API 端点
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
import logging

from app.core.database import get_db
from app.models.user import User
from app.models.exam import Exam, ExamStatus
from app.schemas.diagnostic import DiagnosticRequest, DiagnosticResponse, DiagnosticReport
from app.services.deepseek_service import deepseek_service
from app.api.v1.auth import get_current_user

router = APIRouter(prefix="/diagnostic", tags=["diagnostic"])
logger = logging.getLogger(__name__)


@router.post("/diagnose", response_model=DiagnosticResponse)
async def diagnose_exam(
    request: DiagnosticRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    诊断试卷，生成深度诊断报告
    
    Args:
        request: 诊断请求
        current_user: 当前用户
        db: 数据库会话
        
    Returns:
        DiagnosticResponse: 诊断响应
    """
    # 查询试卷
    result = await db.execute(
        f"SELECT * FROM exams WHERE exam_id = '{request.exam_id}' AND user_id = '{current_user.user_id}'"
    )
    exam = result.first()
    
    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="试卷不存在"
        )
    
    # 检查试卷状态
    if exam.status != ExamStatus.ANALYZED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"试卷状态不正确，当前状态: {exam.status}"
        )
    
    # 获取分析结果
    if not exam.analysis_result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="试卷尚未完成分析"
        )
    
    analysis_result = exam.analysis_result
    
    # 获取解析结果
    if not exam.parsed_result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="试卷尚未完成解析"
        )
    
    parsed_result = exam.parsed_result
    
    try:
        # 调用 DeepSeek 诊断服务
        diagnostic_report = await deepseek_service.diagnose_exam(
            exam_id=request.exam_id,
            subject=parsed_result.get("exam_meta", {}).get("subject", "未知"),
            grade=parsed_result.get("exam_meta", {}).get("grade", "未知"),
            total_score=parsed_result.get("exam_meta", {}).get("total_score", 100),
            student_score=analysis_result.get("overall_stats", {}).get("correct_count", 0),
            question_analyses=analysis_result.get("question_analyses", []),
            overall_stats=analysis_result.get("overall_stats", {}),
            handwriting_metrics=exam.handwriting_metrics if hasattr(exam, 'handwriting_metrics') else None,
            target_school=request.target_school
        )
        
        # 更新试卷状态
        await db.execute(
            f"UPDATE exams SET status = '{ExamStatus.DIAGNOSED}', "
            f"diagnostic_result = '{diagnostic_report.dict()}' "
            f"WHERE exam_id = '{request.exam_id}'"
        )
        await db.commit()
        
        logger.info(f"诊断完成: {request.exam_id}")
        
        return DiagnosticResponse(
            exam_id=request.exam_id,
            diagnostic_report=diagnostic_report,
            status="success"
        )
    
    except Exception as e:
        logger.error(f"诊断失败: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"诊断失败: {str(e)}"
        )


@router.get("/{exam_id}", response_model=DiagnosticResponse)
async def get_diagnostic_report(
    exam_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    获取诊断报告
    
    Args:
        exam_id: 试卷ID
        current_user: 当前用户
        db: 数据库会话
        
    Returns:
        DiagnosticResponse: 诊断响应
    """
    # 查询试卷
    result = await db.execute(
        f"SELECT * FROM exams WHERE exam_id = '{exam_id}' AND user_id = '{current_user.user_id}'"
    )
    exam = result.first()
    
    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="试卷不存在"
        )
    
    # 检查是否已诊断
    if not hasattr(exam, 'diagnostic_result') or not exam.diagnostic_result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="诊断报告不存在"
        )
    
    diagnostic_report = DiagnosticReport(**exam.diagnostic_result)
    
    return DiagnosticResponse(
        exam_id=exam_id,
        diagnostic_report=diagnostic_report,
        status="success"
    )
