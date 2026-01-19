"""
OCR API 端点
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import logging

from app.api.dependencies import get_current_user, get_db
from app.models.user import User
from app.models.exam import Exam
from app.schemas.ocr import OCRRequest, OCRResponse
from app.services.ocr.ocr_service import ocr_service
from app.services.image_service import ImageService
from app.core.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/recognize", response_model=OCRResponse)
async def recognize_exam(
    request: OCRRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    识别试卷图像中的文本
    
    - **exam_id**: 试卷 ID
    - **provider**: 指定 OCR 提供商（可选，默认使用配置的提供商）
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
    if exam.status not in ["uploaded", "ocr_failed"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"试卷状态不允许 OCR 识别: {exam.status}"
        )
    
    try:
        # 更新状态为处理中
        exam.status = "processing"
        await db.commit()
        
        # 读取图像文件
        image_service = ImageService()
        image_bytes = await image_service.read_image(exam.original_image_url)
        
        # 执行 OCR 识别
        logger.info(f"开始 OCR 识别: exam_id={request.exam_id}, provider={request.provider}")
        ocr_result = await ocr_service.recognize(
            image_bytes,
            provider_name=request.provider,
            retry_on_failure=True
        )
        
        # 标记低置信度区域
        low_confidence_regions = ocr_service.select_provider(request.provider).flag_low_confidence(
            ocr_result.text_regions,
            threshold=settings.OCR_LOW_CONFIDENCE_THRESHOLD
        )
        
        # 保存 OCR 结果到数据库
        exam.ocr_result = {
            "text_regions": [region.model_dump() for region in ocr_result.text_regions],
            "overall_confidence": ocr_result.overall_confidence,
            "processing_time": ocr_result.processing_time,
            "provider": ocr_result.provider,
            "low_confidence_regions": low_confidence_regions
        }
        exam.status = "ocr_completed"
        await db.commit()
        
        logger.info(
            f"OCR 识别完成: exam_id={request.exam_id}, "
            f"regions={len(ocr_result.text_regions)}, "
            f"confidence={ocr_result.overall_confidence:.2f}"
        )
        
        return OCRResponse(
            exam_id=request.exam_id,
            text_regions=ocr_result.text_regions,
            overall_confidence=ocr_result.overall_confidence,
            low_confidence_regions=low_confidence_regions
        )
        
    except Exception as e:
        logger.error(f"OCR 识别失败: exam_id={request.exam_id}, error={str(e)}")
        
        # 更新状态为失败
        exam.status = "ocr_failed"
        exam.error_message = str(e)
        await db.commit()
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"OCR 识别失败: {str(e)}"
        )


@router.get("/providers")
async def list_ocr_providers(
    current_user: User = Depends(get_current_user)
):
    """
    列出所有可用的 OCR 提供商
    """
    providers = ocr_service.list_available_providers()
    return {
        "providers": providers,
        "default": settings.OCR_DEFAULT_PROVIDER
    }
