"""
学生作答分析 API
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any
import logging

from app.core.database import get_db
from app.models.exam import Exam, ExamStatus
from app.schemas.analysis import AnalysisRequest, AnalysisResponse
from app.schemas.parser import ParsedExam
from app.schemas.ocr import OCRResult
from app.services.analysis_service import AnalysisService
from app.services.deepseek_service import deepseek_service
from app.api.v1.auth import get_current_user
from app.models.user import User

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_exam(
    request: AnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> AnalysisResponse:
    """
    分析学生作答
    
    Args:
        request: 分析请求
        current_user: 当前用户
        db: 数据库会话
        
    Returns:
        AnalysisResponse: 分析结果
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
    
    # 检查试卷状态
    if exam.status != ExamStatus.PARSED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"试卷状态不正确，当前状态: {exam.status}"
        )
    
    # 获取 OCR 结果和解析结果
    if not exam.ocr_result or not exam.parsed_result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="试卷缺少 OCR 或解析结果"
        )
    
    try:
        # 解析 JSON 数据
        ocr_result = OCRResult(**exam.ocr_result)
        parsed_exam = ParsedExam(**exam.parsed_result)
        
        # 执行分析
        question_analyses, overall_stats = AnalysisService.analyze_exam(
            parsed_exam, ocr_result
        )
        
        # 如果启用 DeepSeek，对主观题进行评分
        if request.use_deepseek:
            for qa in question_analyses:
                # 找到对应的题目
                question = next(
                    (q for q in parsed_exam.questions if q.question_id == qa.question_id),
                    None
                )
                
                if question and question.question_type == "subjective" and qa.student_answer:
                    try:
                        # 调用 DeepSeek 评分
                        eval_result = await deepseek_service.evaluate_subjective_answer(
                            question_text=question.question_text,
                            student_answer=qa.student_answer,
                            correct_answer=question.correct_answer,
                            max_score=question.score
                        )
                        
                        # 更新分析结果
                        qa.is_correct = eval_result.get("is_correct", False)
                        qa.score_obtained = eval_result.get("score", 0.0)
                        
                        # 更新置信度（DeepSeek 评分的置信度较高）
                        qa.confidence = max(qa.confidence, 0.85)
                        
                        # 更新审核状态
                        qa.review_status = AnalysisService.determine_review_status(qa.confidence)
                        
                        logger.info(
                            f"主观题 {qa.question_id} DeepSeek 评分完成: "
                            f"score={qa.score_obtained}, is_correct={qa.is_correct}"
                        )
                    
                    except Exception as e:
                        logger.error(f"主观题 {qa.question_id} DeepSeek 评分失败: {e}")
                        # 继续处理其他题目
            
            # 重新计算整体统计
            overall_stats = AnalysisService.compute_overall_stats(question_analyses)
        
        # 更新试卷状态和存储分析结果
        analysis_data = {
            "question_analysis": [qa.dict() for qa in question_analyses],
            "overall_stats": overall_stats.dict()
        }
        
        await db.execute(
            """
            UPDATE exams 
            SET status = :status, analysis_result = :analysis_result 
            WHERE exam_id = :exam_id
            """,
            {
                "status": ExamStatus.ANALYZED,
                "analysis_result": analysis_data,
                "exam_id": request.exam_id
            }
        )
        await db.commit()
        
        logger.info(f"试卷 {request.exam_id} 分析完成")
        
        return AnalysisResponse(
            exam_id=request.exam_id,
            question_analysis=question_analyses,
            overall_stats=overall_stats
        )
    
    except Exception as e:
        logger.error(f"试卷分析失败: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"试卷分析失败: {str(e)}"
        )


@router.get("/{exam_id}", response_model=AnalysisResponse)
async def get_analysis(
    exam_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> AnalysisResponse:
    """
    获取分析结果
    
    Args:
        exam_id: 试卷 ID
        current_user: 当前用户
        db: 数据库会话
        
    Returns:
        AnalysisResponse: 分析结果
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
    
    # 检查试卷状态
    if exam.status not in [ExamStatus.ANALYZED, ExamStatus.REVIEWED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"试卷尚未分析，当前状态: {exam.status}"
        )
    
    # 返回分析结果（假设存储在 analysis_result 字段）
    if not exam.analysis_result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="分析结果不存在"
        )
    
    try:
        return AnalysisResponse(**exam.analysis_result)
    except Exception as e:
        logger.error(f"解析分析结果失败: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="解析分析结果失败"
        )
