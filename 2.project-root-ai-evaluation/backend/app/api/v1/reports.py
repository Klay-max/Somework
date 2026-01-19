"""
报告生成 API 端点
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from datetime import datetime
import logging

from app.core.database import get_db
from app.models.user import User
from app.models.exam import Exam, ExamStatus
from app.schemas.report import ReportGenerationRequest, ReportGenerationResponse
from app.services.report_service import report_service
from app.api.v1.auth import get_current_user

router = APIRouter(prefix="/reports", tags=["reports"])
logger = logging.getLogger(__name__)


@router.post("/generate", response_model=ReportGenerationResponse)
async def generate_report(
    request: ReportGenerationRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    生成测评报告
    
    Args:
        request: 报告生成请求
        current_user: 当前用户
        db: 数据库会话
        
    Returns:
        ReportGenerationResponse: 报告生成响应
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
    if exam.status != ExamStatus.DIAGNOSED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"试卷状态不正确，当前状态: {exam.status}，需要 DIAGNOSED 状态"
        )
    
    # 获取诊断报告
    if not exam.diagnostic_report:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="诊断报告不存在"
        )
    
    # 获取分析结果
    if not exam.analysis_result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="分析结果不存在"
        )
    
    # 获取解析结果
    if not exam.parsed_result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="解析结果不存在"
        )
    
    try:
        # 生成 HTML 报告
        html_content = report_service.generate_html(
            exam_id=request.exam_id,
            diagnostic_report=exam.diagnostic_report,
            overall_stats=exam.analysis_result.get("overall_stats", {}),
            exam_meta=exam.parsed_result.get("exam_meta", {})
        )
        
        # 生成 PDF（简化实现）
        pdf_content = report_service.generate_pdf(html_content)
        
        # 上传到 OSS（简化实现）
        report_id = str(uuid.uuid4())
        html_url = report_service.upload_to_oss(
            html_content.encode('utf-8'),
            f"{report_id}.html"
        )
        pdf_url = report_service.upload_to_oss(
            pdf_content,
            f"{report_id}.pdf"
        )
        
        # 更新试卷状态
        await db.execute(
            f"UPDATE exams SET status = '{ExamStatus.COMPLETED}', "
            f"report_id = '{report_id}', "
            f"completed_at = '{datetime.utcnow()}' "
            f"WHERE exam_id = '{request.exam_id}'"
        )
        await db.commit()
        
        logger.info(f"报告生成完成: {request.exam_id}")
        
        return ReportGenerationResponse(
            report_id=report_id,
            exam_id=request.exam_id,
            html_url=html_url,
            pdf_url=pdf_url,
            status="success",
            generated_at=datetime.utcnow()
        )
    
    except Exception as e:
        logger.error(f"报告生成失败: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"报告生成失败: {str(e)}"
        )


@router.get("/{exam_id}")
async def get_report(
    exam_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    获取报告信息
    
    Args:
        exam_id: 试卷ID
        current_user: 当前用户
        db: 数据库会话
        
    Returns:
        dict: 报告信息
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
    
    if not exam.report_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="报告尚未生成"
        )
    
    return {
        "report_id": str(exam.report_id),
        "exam_id": exam_id,
        "html_url": f"https://oss.example.com/reports/{exam.report_id}.html",
        "pdf_url": f"https://oss.example.com/reports/{exam.report_id}.pdf",
        "status": exam.status,
        "generated_at": exam.completed_at
    }
