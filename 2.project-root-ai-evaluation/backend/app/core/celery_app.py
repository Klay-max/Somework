"""
Celery 应用配置
"""
from celery import Celery
from app.core.config import settings

# 创建 Celery 应用
celery_app = Celery(
    "exam_assessment",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=[
        "app.tasks.exam_tasks",
    ]
)

# Celery 配置
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,  # 5 分钟超时
    task_soft_time_limit=240,  # 4 分钟软超时
    worker_prefetch_multiplier=1,  # 每次只预取一个任务
    worker_max_tasks_per_child=1000,  # 每个 worker 最多处理 1000 个任务后重启
)

# 任务路由配置
celery_app.conf.task_routes = {
    "app.tasks.exam_tasks.process_exam_ocr": {"queue": "ocr"},
    "app.tasks.exam_tasks.process_exam_parsing": {"queue": "parsing"},
    "app.tasks.exam_tasks.process_exam_analysis": {"queue": "analysis"},
    "app.tasks.exam_tasks.process_exam_diagnostic": {"queue": "diagnostic"},
    "app.tasks.exam_tasks.process_exam_report": {"queue": "report"},
    "app.tasks.exam_tasks.process_exam_complete": {"queue": "default"},
}
