"""
试卷处理异步任务
"""
import logging
from uuid import UUID
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.celery_app import celery_app
from app.core.database import async_session_maker
from app.models.exam import Exam, ExamStatus
from app.services.ocr.ocr_service import OCRService
from app.services.parser_service import ParserService
from app.services.analysis_service import AnalysisService
from app.services.deepseek_service import DeepSeekService
from app.services.report_service import ReportService

logger = logging.getLogger(__name__)


async def get_exam(exam_id: UUID) -> Exam:
    """获取试卷"""
    async with async_session_maker() as db:
        query = select(Exam).where(Exam.exam_id == exam_id)
        result = await db.execute(query)
        exam = result.scalar_one_or_none()
        if not exam:
            raise ValueError(f"Exam {exam_id} not found")
        return exam


async def update_exam_status(exam_id: UUID, status: ExamStatus, **kwargs):
    """更新试卷状态"""
    async with async_session_maker() as db:
        query = select(Exam).where(Exam.exam_id == exam_id)
        result = await db.execute(query)
        exam = result.scalar_one_or_none()
        if exam:
            exam.status = status
            for key, value in kwargs.items():
                setattr(exam, key, value)
            await db.commit()
            logger.info(f"Exam {exam_id} status updated to {status.value}")


@celery_app.task(name="app.tasks.exam_tasks.process_exam_ocr", bind=True)
def process_exam_ocr(self, exam_id: str):
    """
    异步处理 OCR 识别
    
    Args:
        exam_id: 试卷 ID
    """
    import asyncio
    
    exam_uuid = UUID(exam_id)
    logger.info(f"Starting OCR processing for exam {exam_id}")
    
    try:
        # 更新状态为 OCR 处理中
        asyncio.run(update_exam_status(exam_uuid, ExamStatus.OCR_PROCESSING))
        
        # 获取试卷
        exam = asyncio.run(get_exam(exam_uuid))
        
        # 执行 OCR
        ocr_service = OCRService()
        ocr_result = asyncio.run(ocr_service.recognize_image(exam.processed_image_url or exam.original_image_url))
        
        # 保存 OCR 结果
        asyncio.run(update_exam_status(
            exam_uuid,
            ExamStatus.OCR_COMPLETED,
            ocr_result=ocr_result.dict()
        ))
        
        logger.info(f"OCR processing completed for exam {exam_id}")
        
        # 触发下一步：解析
        process_exam_parsing.delay(exam_id)
        
        return {"status": "success", "exam_id": exam_id}
        
    except Exception as e:
        logger.error(f"OCR processing failed for exam {exam_id}: {str(e)}")
        asyncio.run(update_exam_status(exam_uuid, ExamStatus.OCR_FAILED))
        raise


@celery_app.task(name="app.tasks.exam_tasks.process_exam_parsing", bind=True)
def process_exam_parsing(self, exam_id: str):
    """
    异步处理试卷解析
    
    Args:
        exam_id: 试卷 ID
    """
    import asyncio
    
    exam_uuid = UUID(exam_id)
    logger.info(f"Starting parsing for exam {exam_id}")
    
    try:
        # 更新状态为解析中
        asyncio.run(update_exam_status(exam_uuid, ExamStatus.PARSING))
        
        # 获取试卷
        exam = asyncio.run(get_exam(exam_uuid))
        
        # 执行解析
        parser_service = ParserService()
        deepseek_service = DeepSeekService()
        
        # 提取元数据
        exam_meta = parser_service.extract_exam_meta(exam.ocr_result)
        
        # 分割题目
        questions = parser_service.segment_questions(exam.ocr_result)
        
        # 使用 DeepSeek 标注知识点和难度
        for question in questions:
            knowledge_points = asyncio.run(
                deepseek_service.tag_knowledge_points(question["text"], exam_meta.get("subject"))
            )
            difficulty = asyncio.run(
                deepseek_service.estimate_difficulty(question["text"], exam_meta.get("subject"))
            )
            question["knowledge_points"] = knowledge_points
            question["difficulty"] = difficulty
        
        parsed_result = {
            "exam_meta": exam_meta,
            "questions": questions
        }
        
        # 保存解析结果
        asyncio.run(update_exam_status(
            exam_uuid,
            ExamStatus.PARSED,
            parsed_result=parsed_result,
            subject=exam_meta.get("subject"),
            grade=exam_meta.get("grade"),
            total_score=exam_meta.get("total_score"),
            exam_type=exam_meta.get("exam_type")
        ))
        
        logger.info(f"Parsing completed for exam {exam_id}")
        
        # 触发下一步：分析
        process_exam_analysis.delay(exam_id)
        
        return {"status": "success", "exam_id": exam_id}
        
    except Exception as e:
        logger.error(f"Parsing failed for exam {exam_id}: {str(e)}")
        asyncio.run(update_exam_status(exam_uuid, ExamStatus.PARSING_FAILED))
        raise


@celery_app.task(name="app.tasks.exam_tasks.process_exam_analysis", bind=True)
def process_exam_analysis(self, exam_id: str):
    """
    异步处理作答分析
    
    Args:
        exam_id: 试卷 ID
    """
    import asyncio
    
    exam_uuid = UUID(exam_id)
    logger.info(f"Starting analysis for exam {exam_id}")
    
    try:
        # 更新状态为分析中
        asyncio.run(update_exam_status(exam_uuid, ExamStatus.ANALYZING))
        
        # 获取试卷
        exam = asyncio.run(get_exam(exam_uuid))
        
        # 执行分析
        analysis_service = AnalysisService()
        analysis_result = asyncio.run(analysis_service.analyze_exam(exam_uuid))
        
        # 保存分析结果
        asyncio.run(update_exam_status(
            exam_uuid,
            ExamStatus.ANALYZED,
            analysis_result=analysis_result.dict()
        ))
        
        logger.info(f"Analysis completed for exam {exam_id}")
        
        # 触发下一步：诊断
        process_exam_diagnostic.delay(exam_id)
        
        return {"status": "success", "exam_id": exam_id}
        
    except Exception as e:
        logger.error(f"Analysis failed for exam {exam_id}: {str(e)}")
        asyncio.run(update_exam_status(exam_uuid, ExamStatus.ANALYZING_FAILED))
        raise


@celery_app.task(name="app.tasks.exam_tasks.process_exam_diagnostic", bind=True)
def process_exam_diagnostic(self, exam_id: str):
    """
    异步处理诊断
    
    Args:
        exam_id: 试卷 ID
    """
    import asyncio
    
    exam_uuid = UUID(exam_id)
    logger.info(f"Starting diagnostic for exam {exam_id}")
    
    try:
        # 更新状态为诊断中
        asyncio.run(update_exam_status(exam_uuid, ExamStatus.DIAGNOSING))
        
        # 获取试卷
        exam = asyncio.run(get_exam(exam_uuid))
        
        # 执行诊断
        deepseek_service = DeepSeekService()
        diagnostic_result = asyncio.run(deepseek_service.diagnose_exam(exam_uuid))
        
        # 保存诊断结果
        asyncio.run(update_exam_status(
            exam_uuid,
            ExamStatus.DIAGNOSED,
            diagnostic_result=diagnostic_result.dict()
        ))
        
        logger.info(f"Diagnostic completed for exam {exam_id}")
        
        # 触发下一步：报告生成
        process_exam_report.delay(exam_id)
        
        return {"status": "success", "exam_id": exam_id}
        
    except Exception as e:
        logger.error(f"Diagnostic failed for exam {exam_id}: {str(e)}")
        asyncio.run(update_exam_status(exam_uuid, ExamStatus.DIAGNOSING_FAILED))
        raise


@celery_app.task(name="app.tasks.exam_tasks.process_exam_report", bind=True)
def process_exam_report(self, exam_id: str):
    """
    异步处理报告生成
    
    Args:
        exam_id: 试卷 ID
    """
    import asyncio
    
    exam_uuid = UUID(exam_id)
    logger.info(f"Starting report generation for exam {exam_id}")
    
    try:
        # 更新状态为报告生成中
        asyncio.run(update_exam_status(exam_uuid, ExamStatus.REPORT_GENERATING))
        
        # 获取试卷
        exam = asyncio.run(get_exam(exam_uuid))
        
        # 生成报告
        report_service = ReportService()
        report_result = asyncio.run(report_service.generate_report(exam_uuid))
        
        # 保存报告结果
        asyncio.run(update_exam_status(
            exam_uuid,
            ExamStatus.REPORT_GENERATED,
            report_id=report_result.report_id,
            report_html_url=report_result.html_url,
            report_pdf_url=report_result.pdf_url
        ))
        
        logger.info(f"Report generation completed for exam {exam_id}")
        
        # 触发完成任务
        process_exam_complete.delay(exam_id)
        
        return {"status": "success", "exam_id": exam_id, "report_id": report_result.report_id}
        
    except Exception as e:
        logger.error(f"Report generation failed for exam {exam_id}: {str(e)}")
        asyncio.run(update_exam_status(exam_uuid, ExamStatus.REPORT_GENERATION_FAILED))
        raise


@celery_app.task(name="app.tasks.exam_tasks.process_exam_complete", bind=True)
def process_exam_complete(self, exam_id: str):
    """
    完成试卷处理
    
    Args:
        exam_id: 试卷 ID
    """
    import asyncio
    
    exam_uuid = UUID(exam_id)
    logger.info(f"Completing exam processing for {exam_id}")
    
    try:
        # 更新状态为已完成
        asyncio.run(update_exam_status(
            exam_uuid,
            ExamStatus.COMPLETED,
            completed_at=datetime.utcnow()
        ))
        
        logger.info(f"Exam processing completed for {exam_id}")
        
        return {"status": "success", "exam_id": exam_id}
        
    except Exception as e:
        logger.error(f"Failed to complete exam {exam_id}: {str(e)}")
        raise
