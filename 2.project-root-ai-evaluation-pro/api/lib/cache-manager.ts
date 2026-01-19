/**
 * 缓存管理器
 * 
 * 功能：
 * - 内存缓存管理
 * - 图像哈希生成
 * - 缓存过期机制
 * - OCR 结果缓存
 * - AI 分析结果缓存
 */

import crypto from 'crypto';
import type { OCRResult } from './alicloud-ocr';
import type { ErrorAnalysis, LearningPath } from '../types';

/**
 * 缓存条目接口
 */
interface CacheEntry<T> {
  value: T;
  expiry: number;
  createdAt: number;
  accessCount: number;
  lastAccessed: number;
}

/**
 * 缓存统计信息
 */
interface CacheStats {
  totalEntries: number;
  hitCount: number;
  missCount: number;
  hitRate: number;
  memoryUsage: number; // 估算的内存使用量（字节）
}

/**
 * 缓存管理器类
 */
export class CacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private hitCount = 0;
  private missCount = 0;
  private maxSize: number;
  private defaultTTL: number;
  
  constructor(maxSize: number = 1000, defaultTTL: number = 3600000) { // 默认 1 小时
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
    
    // 定期清理过期缓存
    setInterval(() => this.cleanup(), 300000); // 每 5 分钟清理一次
  }
  
  /**
   * 设置缓存
   * 
   * @param key - 缓存键
   * @param value - 缓存值
   * @param ttl - 生存时间（毫秒），默认使用 defaultTTL
   */
  set<T>(key: string, value: T, ttl?: number): void {
    const now = Date.now();
    const expiry = now + (ttl || this.defaultTTL);
    
    // 如果缓存已满，删除最旧的条目
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }
    
    this.cache.set(key, {
      value,
      expiry,
      createdAt: now,
      accessCount: 0,
      lastAccessed: now,
    });
  }
  
  /**
   * 获取缓存
   * 
   * @param key - 缓存键
   * @returns 缓存值或 null
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.missCount++;
      return null;
    }
    
    // 检查是否过期
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      this.missCount++;
      return null;
    }
    
    // 更新访问统计
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.hitCount++;
    
    return entry.value as T;
  }
  
  /**
   * 检查缓存是否存在且未过期
   * 
   * @param key - 缓存键
   * @returns 是否存在
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }
    
    // 检查是否过期
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }
  
  /**
   * 删除缓存
   * 
   * @param key - 缓存键
   * @returns 是否删除成功
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }
  
  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear();
    this.hitCount = 0;
    this.missCount = 0;
  }
  
  /**
   * 生成图像哈希（用于缓存 OCR 结果）
   * 
   * @param imageBase64 - 图像的 Base64 编码
   * @returns SHA256 哈希值
   */
  generateImageHash(imageBase64: string): string {
    return crypto.createHash('sha256').update(imageBase64).digest('hex');
  }
  
  /**
   * 生成分析哈希（用于缓存 AI 分析结果）
   * 
   * @param data - 要哈希的数据
   * @returns SHA256 哈希值
   */
  generateAnalysisHash(data: any): string {
    const jsonString = JSON.stringify(data, Object.keys(data).sort());
    return crypto.createHash('sha256').update(jsonString).digest('hex');
  }
  
  /**
   * 缓存 OCR 结果
   * 
   * @param imageBase64 - 图像 Base64
   * @param result - OCR 结果
   * @param ttl - 缓存时间（默认 24 小时）
   */
  cacheOCRResult(imageBase64: string, result: OCRResult, ttl: number = 86400000): void {
    const key = `ocr:${this.generateImageHash(imageBase64)}`;
    this.set(key, result, ttl);
  }
  
  /**
   * 获取缓存的 OCR 结果
   * 
   * @param imageBase64 - 图像 Base64
   * @returns OCR 结果或 null
   */
  getCachedOCRResult(imageBase64: string): OCRResult | null {
    const key = `ocr:${this.generateImageHash(imageBase64)}`;
    return this.get<OCRResult>(key);
  }
  
  /**
   * 缓存错误分析结果
   * 
   * @param gradeResult - 评分结果
   * @param analysis - 分析结果
   * @param ttl - 缓存时间（默认 1 小时）
   */
  cacheAnalysisResult(gradeResult: any, analysis: ErrorAnalysis, ttl: number = 3600000): void {
    const key = `analysis:${this.generateAnalysisHash(gradeResult)}`;
    this.set(key, analysis, ttl);
  }
  
  /**
   * 获取缓存的错误分析结果
   * 
   * @param gradeResult - 评分结果
   * @returns 分析结果或 null
   */
  getCachedAnalysisResult(gradeResult: any): ErrorAnalysis | null {
    const key = `analysis:${this.generateAnalysisHash(gradeResult)}`;
    return this.get<ErrorAnalysis>(key);
  }
  
  /**
   * 缓存学习路径结果
   * 
   * @param errorAnalysis - 错误分析结果
   * @param learningPath - 学习路径
   * @param ttl - 缓存时间（默认 1 小时）
   */
  cacheLearningPath(errorAnalysis: ErrorAnalysis, learningPath: LearningPath, ttl: number = 3600000): void {
    const key = `path:${this.generateAnalysisHash(errorAnalysis)}`;
    this.set(key, learningPath, ttl);
  }
  
  /**
   * 获取缓存的学习路径
   * 
   * @param errorAnalysis - 错误分析结果
   * @returns 学习路径或 null
   */
  getCachedLearningPath(errorAnalysis: ErrorAnalysis): LearningPath | null {
    const key = `path:${this.generateAnalysisHash(errorAnalysis)}`;
    return this.get<LearningPath>(key);
  }
  
  /**
   * 清理过期缓存
   */
  private cleanup(): void {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`[CacheManager] Cleaned ${cleanedCount} expired entries`);
    }
  }
  
  /**
   * 驱逐最旧的缓存条目（LRU 策略）
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
      console.log(`[CacheManager] Evicted oldest entry: ${oldestKey}`);
    }
  }
  
  /**
   * 获取缓存统计信息
   * 
   * @returns 缓存统计
   */
  getStats(): CacheStats {
    const totalRequests = this.hitCount + this.missCount;
    const hitRate = totalRequests > 0 ? (this.hitCount / totalRequests) * 100 : 0;
    
    // 估算内存使用量
    let memoryUsage = 0;
    for (const [key, entry] of this.cache.entries()) {
      memoryUsage += key.length * 2; // 字符串长度 * 2 字节
      memoryUsage += JSON.stringify(entry.value).length * 2; // 值的大小
      memoryUsage += 64; // 条目元数据大小估算
    }
    
    return {
      totalEntries: this.cache.size,
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate: Math.round(hitRate * 100) / 100,
      memoryUsage,
    };
  }
  
  /**
   * 获取缓存详细信息（调试用）
   */
  getDebugInfo(): any {
    const entries: any[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      entries.push({
        key,
        createdAt: new Date(entry.createdAt).toISOString(),
        expiry: new Date(entry.expiry).toISOString(),
        accessCount: entry.accessCount,
        lastAccessed: new Date(entry.lastAccessed).toISOString(),
        isExpired: Date.now() > entry.expiry,
      });
    }
    
    return {
      stats: this.getStats(),
      entries: entries.sort((a, b) => b.accessCount - a.accessCount), // 按访问次数排序
    };
  }
}

// 全局缓存实例
export const globalCache = new CacheManager(
  parseInt(process.env.CACHE_MAX_SIZE || '1000', 10),
  parseInt(process.env.CACHE_DEFAULT_TTL || '3600000', 10)
);