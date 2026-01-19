"""
Redis 客户端管理
"""
import redis.asyncio as redis
from typing import Optional

from app.core.config import settings


class RedisClient:
    """Redis 客户端单例"""
    
    _instance: Optional[redis.Redis] = None
    
    @classmethod
    async def get_instance(cls) -> redis.Redis:
        """获取 Redis 实例"""
        if cls._instance is None:
            cls._instance = await redis.from_url(
                settings.REDIS_URL,
                encoding="utf-8",
                decode_responses=True
            )
        return cls._instance
    
    @classmethod
    async def close(cls):
        """关闭 Redis 连接"""
        if cls._instance:
            await cls._instance.close()
            cls._instance = None


async def get_redis() -> redis.Redis:
    """获取 Redis 客户端"""
    return await RedisClient.get_instance()


# 创建全局 redis_client 实例（用于同步导入）
redis_client = RedisClient()
