"""
Celery 异步任务
"""
from app.tasks.exam_tasks import (
    process_exam_ocr,
    process_exam_parsing,
    process_exam_analysis,
    process_exam_diagnostic,
    process_exam_report,
    process_exam_complete,
)

__all__ = [
    "process_exam_ocr",
    "process_exam_parsing",
    "process_exam_analysis",
    "process_exam_diagnostic",
    "process_exam_report",
    "process_exam_complete",
]
