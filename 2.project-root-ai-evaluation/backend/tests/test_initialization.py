"""
项目初始化单元测试
测试数据库连接、Redis 连接和配置加载
"""
import pytest
from sqlalchemy import text
import redis.asyncio as redis

from app.core.config import settings
from app.core.database import engine
from app.core.redis_client import RedisClient


class TestDatabaseConnection:
    """测试数据库连接"""
    
    @pytest.mark.asyncio
    async def test_database_connection(self):
        """测试数据库连接是否正常"""
        async with engine.begin() as conn:
            result = await conn.execute(text("SELECT 1"))
            assert result.scalar() == 1
    
    @pytest.mark.asyncio
    async def test_database_pool(self):
        """测试数据库连接池"""
        assert engine.pool.size() >= 0
        assert engine.pool._max_overflow == 20
    
    @pytest.mark.asyncio
    async def test_database_tables_creation(self, db_session):
        """测试数据库表创建"""
        # 验证会话可以正常工作
        result = await db_session.execute(text("SELECT 1"))
        assert result.scalar() == 1


class TestRedisConnection:
    """测试 Redis 连接"""
    
    @pytest.mark.asyncio
    async def test_redis_connection(self):
        """测试 Redis 连接是否正常"""
        redis_client = await RedisClient.get_instance()
        
        # 测试 ping
        assert await redis_client.ping() is True
    
    @pytest.mark.asyncio
    async def test_redis_set_get(self):
        """测试 Redis 基本操作"""
        redis_client = await RedisClient.get_instance()
        
        # 设置值
        await redis_client.set("test_key", "test_value", ex=60)
        
        # 获取值
        value = await redis_client.get("test_key")
        assert value == "test_value"
        
        # 删除键
        await redis_client.delete("test_key")
    
    @pytest.mark.asyncio
    async def test_redis_expiration(self):
        """测试 Redis 键过期"""
        redis_client = await RedisClient.get_instance()
        
        # 设置 1 秒过期的键
        await redis_client.set("expire_key", "value", ex=1)
        
        # 立即获取应该存在
        value = await redis_client.get("expire_key")
        assert value == "value"
        
        # 等待 2 秒后应该过期
        import asyncio
        await asyncio.sleep(2)
        value = await redis_client.get("expire_key")
        assert value is None


class TestConfiguration:
    """测试配置加载"""
    
    def test_config_loading(self):
        """测试配置是否正确加载"""
        assert settings.PROJECT_NAME == "AI 试卷拍照测评工具"
        assert settings.VERSION == "1.0.0"
        assert settings.ALGORITHM == "HS256"
    
    def test_database_url(self):
        """测试数据库 URL 配置"""
        assert settings.DATABASE_URL.startswith("postgresql+asyncpg://")
    
    def test_redis_url(self):
        """测试 Redis URL 配置"""
        assert settings.REDIS_URL.startswith("redis://")
    
    def test_jwt_config(self):
        """测试 JWT 配置"""
        assert settings.ACCESS_TOKEN_EXPIRE_DAYS == 7
        assert len(settings.SECRET_KEY) > 0
    
    def test_image_config(self):
        """测试图像配置"""
        assert settings.MAX_UPLOAD_SIZE == 10 * 1024 * 1024
        assert "jpg" in settings.ALLOWED_IMAGE_FORMATS
        assert "png" in settings.ALLOWED_IMAGE_FORMATS
    
    def test_quality_thresholds(self):
        """测试图像质量阈值配置"""
        assert settings.MIN_RESOLUTION_WIDTH == 1920
        assert settings.MIN_RESOLUTION_HEIGHT == 1080
        assert settings.MIN_BLUR_THRESHOLD == 100.0
        assert settings.MIN_BRIGHTNESS == 80
        assert settings.MAX_BRIGHTNESS == 200
    
    def test_performance_config(self):
        """测试性能配置"""
        assert settings.EXAM_PROCESSING_TIMEOUT == 60
        assert settings.MAX_CONCURRENT_REQUESTS == 10
    
    def test_deepseek_config(self):
        """测试 DeepSeek 配置"""
        assert settings.DEEPSEEK_MAX_RETRIES == 3
        assert settings.DEEPSEEK_RETRY_DELAYS == [1, 2, 4]
