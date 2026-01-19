"""
缓存服务
使用 Redis 实现缓存机制
"""
import json
import logging
from typing import Optional, Any
from datetime import timedelta

from app.core.redis_client import redis_client

logger = logging.getLogger(__name__)


class CacheService:
    """缓存服务类"""
    
    # 缓存键前缀
    PREFIX_KNOWLEDGE_POINTS = "knowledge_points:"
    PREFIX_EXAM_TEMPLATE = "exam_template:"
    PREFIX_SUBJECT_CONFIG = "subject_config:"
    
    # 缓存过期时间
    TTL_KNOWLEDGE_POINTS = timedelta(days=7)  # 知识点映射缓存 7 天
    TTL_EXAM_TEMPLATE = timedelta(days=30)  # 试卷模板缓存 30 天
    TTL_SUBJECT_CONFIG = timedelta(days=1)  # 科目配置缓存 1 天
    
    @staticmethod
    async def get(key: str) -> Optional[Any]:
        """
        获取缓存值
        
        Args:
            key: 缓存键
            
        Returns:
            缓存值，如果不存在则返回 None
        """
        try:
            value = await redis_client.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            logger.error(f"Failed to get cache for key {key}: {str(e)}")
            return None
    
    @staticmethod
    async def set(key: str, value: Any, ttl: Optional[timedelta] = None):
        """
        设置缓存值
        
        Args:
            key: 缓存键
            value: 缓存值
            ttl: 过期时间
        """
        try:
            serialized_value = json.dumps(value, ensure_ascii=False)
            if ttl:
                await redis_client.setex(key, int(ttl.total_seconds()), serialized_value)
            else:
                await redis_client.set(key, serialized_value)
            logger.debug(f"Cache set for key {key}")
        except Exception as e:
            logger.error(f"Failed to set cache for key {key}: {str(e)}")
    
    @staticmethod
    async def delete(key: str):
        """
        删除缓存
        
        Args:
            key: 缓存键
        """
        try:
            await redis_client.delete(key)
            logger.debug(f"Cache deleted for key {key}")
        except Exception as e:
            logger.error(f"Failed to delete cache for key {key}: {str(e)}")
    
    @staticmethod
    async def exists(key: str) -> bool:
        """
        检查缓存是否存在
        
        Args:
            key: 缓存键
            
        Returns:
            是否存在
        """
        try:
            return await redis_client.exists(key) > 0
        except Exception as e:
            logger.error(f"Failed to check cache existence for key {key}: {str(e)}")
            return False
    
    # ========================================================================
    # 知识点映射缓存
    # ========================================================================
    
    @staticmethod
    async def get_knowledge_points(subject: str, question_text: str) -> Optional[list]:
        """
        获取知识点映射缓存
        
        Args:
            subject: 科目
            question_text: 题目文本
            
        Returns:
            知识点列表
        """
        # 使用题目文本的哈希作为键的一部分
        import hashlib
        text_hash = hashlib.md5(question_text.encode()).hexdigest()[:8]
        key = f"{CacheService.PREFIX_KNOWLEDGE_POINTS}{subject}:{text_hash}"
        return await CacheService.get(key)
    
    @staticmethod
    async def set_knowledge_points(subject: str, question_text: str, knowledge_points: list):
        """
        设置知识点映射缓存
        
        Args:
            subject: 科目
            question_text: 题目文本
            knowledge_points: 知识点列表
        """
        import hashlib
        text_hash = hashlib.md5(question_text.encode()).hexdigest()[:8]
        key = f"{CacheService.PREFIX_KNOWLEDGE_POINTS}{subject}:{text_hash}"
        await CacheService.set(key, knowledge_points, CacheService.TTL_KNOWLEDGE_POINTS)
    
    # ========================================================================
    # 试卷模板缓存
    # ========================================================================
    
    @staticmethod
    async def get_exam_template(subject: str, grade: str) -> Optional[dict]:
        """
        获取试卷模板缓存
        
        Args:
            subject: 科目
            grade: 年级
            
        Returns:
            试卷模板
        """
        key = f"{CacheService.PREFIX_EXAM_TEMPLATE}{subject}:{grade}"
        return await CacheService.get(key)
    
    @staticmethod
    async def set_exam_template(subject: str, grade: str, template: dict):
        """
        设置试卷模板缓存
        
        Args:
            subject: 科目
            grade: 年级
            template: 试卷模板
        """
        key = f"{CacheService.PREFIX_EXAM_TEMPLATE}{subject}:{grade}"
        await CacheService.set(key, template, CacheService.TTL_EXAM_TEMPLATE)
    
    # ========================================================================
    # 科目配置缓存
    # ========================================================================
    
    @staticmethod
    async def get_subject_config(subject: str) -> Optional[dict]:
        """
        获取科目配置缓存
        
        Args:
            subject: 科目
            
        Returns:
            科目配置
        """
        key = f"{CacheService.PREFIX_SUBJECT_CONFIG}{subject}"
        return await CacheService.get(key)
    
    @staticmethod
    async def set_subject_config(subject: str, config: dict):
        """
        设置科目配置缓存
        
        Args:
            subject: 科目
            config: 科目配置
        """
        key = f"{CacheService.PREFIX_SUBJECT_CONFIG}{subject}"
        await CacheService.set(key, config, CacheService.TTL_SUBJECT_CONFIG)
    
    # ========================================================================
    # 批量操作
    # ========================================================================
    
    @staticmethod
    async def clear_pattern(pattern: str):
        """
        清除匹配模式的所有缓存
        
        Args:
            pattern: 键模式（支持通配符 *）
        """
        try:
            keys = []
            async for key in redis_client.scan_iter(match=pattern):
                keys.append(key)
            
            if keys:
                await redis_client.delete(*keys)
                logger.info(f"Cleared {len(keys)} cache keys matching pattern {pattern}")
        except Exception as e:
            logger.error(f"Failed to clear cache pattern {pattern}: {str(e)}")
    
    @staticmethod
    async def clear_all():
        """清除所有缓存"""
        try:
            await redis_client.flushdb()
            logger.info("All cache cleared")
        except Exception as e:
            logger.error(f"Failed to clear all cache: {str(e)}")
