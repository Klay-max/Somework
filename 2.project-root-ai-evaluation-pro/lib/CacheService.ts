/**
 * 缓存服务
 * 
 * 功能：
 * - 缓存 API 响应结果
 * - 使用图片哈希作为缓存键
 * - LRU 缓存策略
 * - 持久化存储
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * 缓存项
 */
interface CacheItem<T> {
  key: string;
  value: T;
  timestamp: number;
  size: number; // 字节
}

/**
 * 缓存配置
 */
interface CacheConfig {
  maxSize: number;      // 最大缓存大小（字节）
  maxAge: number;       // 最大缓存时间（毫秒）
  maxItems: number;     // 最大缓存项数
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: CacheConfig = {
  maxSize: 50 * 1024 * 1024,  // 50MB
  maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 天
  maxItems: 100,
};

/**
 * 缓存服务类
 */
export class CacheService {
  private static config: CacheConfig = DEFAULT_CONFIG;
  private static memoryCache = new Map<string, CacheItem<any>>();
  private static cachePrefix = '@vision_cache:';

  /**
   * 配置缓存
   */
  static configure(config: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 生成图片哈希（简单版本）
   */
  static async hashImage(imageBase64: string): Promise<string> {
    // 使用前 1000 个字符生成简单哈希
    const sample = imageBase64.substring(0, 1000);
    let hash = 0;
    
    for (let i = 0; i < sample.length; i++) {
      const char = sample.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return `img_${Math.abs(hash).toString(36)}_${imageBase64.length}`;
  }

  /**
   * 获取缓存
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      // 先检查内存缓存
      const memItem = this.memoryCache.get(key);
      if (memItem) {
        // 检查是否过期
        if (Date.now() - memItem.timestamp < this.config.maxAge) {
          console.log(`[CacheService] 内存缓存命中: ${key}`);
          return memItem.value as T;
        } else {
          // 过期，删除
          this.memoryCache.delete(key);
        }
      }

      // 检查持久化缓存
      const storageKey = this.cachePrefix + key;
      const cached = await AsyncStorage.getItem(storageKey);
      
      if (cached) {
        const item: CacheItem<T> = JSON.parse(cached);
        
        // 检查是否过期
        if (Date.now() - item.timestamp < this.config.maxAge) {
          console.log(`[CacheService] 持久化缓存命中: ${key}`);
          
          // 更新内存缓存
          this.memoryCache.set(key, item);
          
          return item.value;
        } else {
          // 过期，删除
          await AsyncStorage.removeItem(storageKey);
        }
      }

      console.log(`[CacheService] 缓存未命中: ${key}`);
      return null;
    } catch (error) {
      console.error('[CacheService] 获取缓存失败:', error);
      return null;
    }
  }

  /**
   * 设置缓存
   */
  static async set<T>(key: string, value: T): Promise<void> {
    try {
      const item: CacheItem<T> = {
        key,
        value,
        timestamp: Date.now(),
        size: JSON.stringify(value).length,
      };

      // 更新内存缓存
      this.memoryCache.set(key, item);

      // 持久化
      const storageKey = this.cachePrefix + key;
      await AsyncStorage.setItem(storageKey, JSON.stringify(item));

      console.log(`[CacheService] 缓存已保存: ${key}, 大小: ${(item.size / 1024).toFixed(2)}KB`);

      // 检查缓存大小，必要时清理
      await this.cleanup();
    } catch (error) {
      console.error('[CacheService] 设置缓存失败:', error);
    }
  }

  /**
   * 删除缓存
   */
  static async remove(key: string): Promise<void> {
    try {
      this.memoryCache.delete(key);
      const storageKey = this.cachePrefix + key;
      await AsyncStorage.removeItem(storageKey);
      console.log(`[CacheService] 缓存已删除: ${key}`);
    } catch (error) {
      console.error('[CacheService] 删除缓存失败:', error);
    }
  }

  /**
   * 清理过期和超量缓存（LRU）
   */
  static async cleanup(): Promise<void> {
    try {
      // 获取所有缓存键
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(k => k.startsWith(this.cachePrefix));

      if (cacheKeys.length === 0) return;

      // 获取所有缓存项
      const items: CacheItem<any>[] = [];
      let totalSize = 0;

      for (const storageKey of cacheKeys) {
        const cached = await AsyncStorage.getItem(storageKey);
        if (cached) {
          const item: CacheItem<any> = JSON.parse(cached);
          
          // 检查是否过期
          if (Date.now() - item.timestamp >= this.config.maxAge) {
            await AsyncStorage.removeItem(storageKey);
            this.memoryCache.delete(item.key);
            continue;
          }

          items.push(item);
          totalSize += item.size;
        }
      }

      // 按时间排序（最旧的在前）
      items.sort((a, b) => a.timestamp - b.timestamp);

      // 如果超过数量限制或大小限制，删除最旧的
      while (
        items.length > this.config.maxItems ||
        totalSize > this.config.maxSize
      ) {
        const oldest = items.shift();
        if (oldest) {
          await this.remove(oldest.key);
          totalSize -= oldest.size;
        }
      }

      console.log(`[CacheService] 清理完成: ${items.length} 项, ${(totalSize / 1024 / 1024).toFixed(2)}MB`);
    } catch (error) {
      console.error('[CacheService] 清理缓存失败:', error);
    }
  }

  /**
   * 清空所有缓存
   */
  static async clear(): Promise<void> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(k => k.startsWith(this.cachePrefix));
      
      await AsyncStorage.multiRemove(cacheKeys);
      this.memoryCache.clear();
      
      console.log(`[CacheService] 已清空所有缓存: ${cacheKeys.length} 项`);
    } catch (error) {
      console.error('[CacheService] 清空缓存失败:', error);
    }
  }

  /**
   * 获取缓存统计
   */
  static async getStats(): Promise<{
    count: number;
    size: number;
    oldestTimestamp: number;
    newestTimestamp: number;
  }> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(k => k.startsWith(this.cachePrefix));

      let totalSize = 0;
      let oldestTimestamp = Date.now();
      let newestTimestamp = 0;

      for (const storageKey of cacheKeys) {
        const cached = await AsyncStorage.getItem(storageKey);
        if (cached) {
          const item: CacheItem<any> = JSON.parse(cached);
          totalSize += item.size;
          oldestTimestamp = Math.min(oldestTimestamp, item.timestamp);
          newestTimestamp = Math.max(newestTimestamp, item.timestamp);
        }
      }

      return {
        count: cacheKeys.length,
        size: totalSize,
        oldestTimestamp,
        newestTimestamp,
      };
    } catch (error) {
      console.error('[CacheService] 获取统计失败:', error);
      return {
        count: 0,
        size: 0,
        oldestTimestamp: 0,
        newestTimestamp: 0,
      };
    }
  }
}
