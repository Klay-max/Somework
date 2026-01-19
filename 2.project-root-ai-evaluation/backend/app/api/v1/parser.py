"""
试卷解析 API 端点
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import logging

from app.api.dependencies import get_current_user, get_db
from app.models.user import User
from app.models.exam import Exam
from app.schemas.parser import ParseRequest, ParseResponse
from app.schemas.ocr import OCRResult, TextRegion, BoundingBox
from app.services.parser_service import ParserService
from app.services.deepseek_service import deepseek_service

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/parse", response_model=ParseResponse)
async def parse_exam(
    request: ParseRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    解析试卷结构
    
    - **exam_id**: 试卷 ID
    - **use_deepseek**: 是否使用 DeepSeek 进行知识点标注和难度估算
    """
    # 查询试卷
    exam = await db.get(Exam, request.exam_id)
    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="试卷不存在"
        )
    
    # 验证权限
    if exam.user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权访问此试卷"
        )
    
    # 检查试卷状态
    if exam.status not in ["ocr_completed", "parsing_failed"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"试卷状态不允许解析: {exam.status}"
        )
    
    # 检查 OCR 结果
    if not exam.ocr_result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="试卷尚未完成 OCR 识别"
        )
    
    try:
        # 更新状态为处理中
        exam.status = "parsing"
        await db.commit()
        
        # 重建 OCR 结果对象
        ocr_result = OCRResult(
            text_regions=[
                TextRegion(
                    text=region["text"],
                    bbox=BoundingBox(**region["bbox"]),
                    confidence=region["confidence"],
                    type=region["type"]
                )
                for region in exam.ocr_result["text_regions"]
            ],
            overall_confidence=exam.ocr_result["overall_confidence"],
            processing_time=exam.ocr_result["processing_time"],
            provider=exam.ocr_result["provider"]
        )
        
        # 解析试卷
        logger.info(f"开始解析试卷: exam_id={request.exam_id}")
        parsed_exam = ParserService.parse_exam(ocr_result)
        parsed_exam.exam_id = request.exam_id
        
        # 使用 DeepSeek 丰富题目信息
        if request.use_deepseek and deepseek_service.api_key:
            logger.info(f"使用 DeepSeek 丰富题目信息: {len(parsed_exam.questions)} 道题")
            parsed_exam.questions = await deepseek_service.enrich_questions_batch(
                parsed_exam.questions
            )
        
        # 保存解析结果到数据库
        exam.parsed_result = {
            "exam_meta": parsed_exam.exam_meta.model_dump(),
            "questions": [q.model_dump() for q in parsed_exam.questions],
            "parsing_confidence": parsed_exam.parsing_confidence,
            "incomplete_fields": parsed_exam.incomplete_fields
        }
        exam.status = "parsing_completed"
        await db.commit()
        
        logger.info(
            f"试卷解析完成: exam_id={request.exam_id}, "
            f"questions={len(parsed_exam.questions)}, "
            f"confidence={parsed_exam.parsing_confidence:.2f}"
        )
        
        return ParseResponse(
            exam_id=request.exam_id,
            exam_meta=parsed_exam.exam_meta,
            questions=parsed_exam.questions,
            parsing_confidence=parsed_exam.parsing_confidence,
            incomplete_fields=parsed_exam.incomplete_fields,
            total_questions=len(parsed_exam.questions)
        )
        
    except Exception as e:
        logger.error(f"试卷解析失败: exam_id={request.exam_id}, error={str(e)}")
        
        # 更新状态为失败
        exam.status = "parsing_failed"
        exam.error_message = str(e)
        await db.commit()
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"试卷解析失败: {str(e)}"
        )


@router.get("/{exam_id}/parsed")
async def get_parsed_exam(
    exam_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    获取已解析的试卷
    
    - **exam_id**: 试卷 ID
    """
    # 查询试卷
    exam = await db.get(Exam, exam_id)
    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="试卷不存在"
        )
    
    # 验证权限
    if exam.user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权访问此试卷"
        )
    
    # 检查解析结果
    if not exam.parsed_result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="试卷尚未解析"
        )
    
    return {
        "exam_id": exam_id,
        "exam_meta": exam.parsed_result["exam_meta"],
        "questions": exam.parsed_result["questions"],
        "parsing_confidence": exam.parsed_result["parsing_confidence"],
        "incomplete_fields": exam.parsed_result.get("incomplete_fields", []),
        "total_questions": len(exam.parsed_result["questions"])
    }
