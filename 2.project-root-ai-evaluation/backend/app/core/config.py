"""
应用配置管理
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """应用配置"""
    
    # 项目信息
    PROJECT_NAME: str = "AI 试卷拍照测评工具"
    VERSION: str = "1.0.0"
    
    # 数据库配置
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/exam_assessment"
    
    # Redis 配置
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # JWT 配置
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS 配置
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8080"]
    
    # 文件上传配置
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_IMAGE_FORMATS: List[str] = ["jpg", "jpeg", "png", "heic"]
    
    # 图像质量阈值
    MIN_RESOLUTION_WIDTH: int = 1920
    MIN_RESOLUTION_HEIGHT: int = 1080
    MIN_BLUR_THRESHOLD: float = 100.0
    MIN_BRIGHTNESS: int = 80
    MAX_BRIGHTNESS: int = 200
    
    # OCR 配置
    OCR_DEFAULT_PROVIDER: str = "baidu"  # 默认 OCR 提供商
    OCR_LOW_CONFIDENCE_THRESHOLD: float = 0.8  # 低置信度阈值
    
    BAIDU_OCR_APP_ID: str = ""
    BAIDU_OCR_API_KEY: str = ""
    BAIDU_OCR_API_SECRET: str = ""
    
    TENCENT_OCR_SECRET_ID: str = ""
    TENCENT_OCR_SECRET_KEY: str = ""
    
    # 阿里云 OCR 配置
    ALIYUN_OCR_ACCESS_KEY_ID: str = ""
    ALIYUN_OCR_ACCESS_KEY_SECRET: str = ""
    
    # DeepSeek 配置
    DEEPSEEK_API_KEY: str = ""
    DEEPSEEK_API_URL: str = "https://api.deepseek.com/v1"
    DEEPSEEK_MAX_RETRIES: int = 3
    DEEPSEEK_RETRY_DELAYS: List[int] = [1, 2, 4]  # 指数退避
    
    # 阿里云 OSS 配置
    OSS_ACCESS_KEY_ID: str = ""
    OSS_ACCESS_KEY_SECRET: str = ""
    OSS_BUCKET_NAME: str = ""
    OSS_ENDPOINT: str = ""
    
    # 短信服务配置
    SMS_ACCESS_KEY_ID: str = ""
    SMS_ACCESS_KEY_SECRET: str = ""
    SMS_SIGN_NAME: str = ""
    SMS_TEMPLATE_CODE: str = ""
    
    # 性能配置
    EXAM_PROCESSING_TIMEOUT: int = 60  # 秒
    MAX_CONCURRENT_REQUESTS: int = 10
    
    # Celery 配置
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"
    
    # Mock 模式配置
    USE_MOCK_SERVICES: bool = False
    
    @property
    def is_mock_mode(self) -> bool:
        """Check if running in mock mode"""
        return self.USE_MOCK_SERVICES
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
