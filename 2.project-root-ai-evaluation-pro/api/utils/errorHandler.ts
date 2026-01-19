/**
 * 错误处理工具
 */

import { ErrorType, UserFriendlyError } from '../types';

export class ErrorHandler {
  /**
   * 将系统错误转换为用户友好的错误信息
   */
  static handle(error: Error, context: string): UserFriendlyError {
    // 记录错误日志
    console.error(`[${context}]`, error);
    
    const message = error.message.toLowerCase();
    
    // 超时错误
    if (message.includes('timeout') || message.includes('timed out')) {
      return {
        type: ErrorType.TIMEOUT,
        message: '请求超时，请检查网络连接后重试',
        retryable: true,
      };
    }
    
    // 频率限制
    if (message.includes('rate limit') || message.includes('too many')) {
      return {
        type: ErrorType.RATE_LIMIT_EXCEEDED,
        message: '请求过于频繁，请稍后再试',
        retryable: true,
        retryAfter: 60,
      };
    }
    
    // 网络错误
    if (message.includes('network') || message.includes('econnrefused')) {
      return {
        type: ErrorType.NETWORK_ERROR,
        message: '网络连接失败，请检查网络设置',
        retryable: true,
      };
    }
    
    // OCR 相关错误
    if (message.includes('ocr') || message.includes('recognition')) {
      return {
        type: ErrorType.OCR_FAILED,
        message: '图像识别失败，请确保答题卡清晰可见并重新拍摄',
        retryable: true,
      };
    }
    
    // 图像质量错误
    if (message.includes('quality') || message.includes('blur')) {
      return {
        type: ErrorType.IMAGE_QUALITY_LOW,
        message: '图像质量过低，请在光线充足的环境下重新拍摄',
        retryable: true,
      };
    }
    
    // 图像大小错误
    if (message.includes('too large') || message.includes('size')) {
      return {
        type: ErrorType.IMAGE_TOO_LARGE,
        message: '图像文件过大，请压缩后重试',
        retryable: false,
      };
    }
    
    // AI 分析错误
    if (message.includes('ai') || message.includes('analysis')) {
      return {
        type: ErrorType.AI_ANALYSIS_FAILED,
        message: 'AI 分析失败，请稍后重试',
        retryable: true,
      };
    }
    
    // API 配额错误
    if (message.includes('quota') || message.includes('limit exceeded')) {
      return {
        type: ErrorType.API_QUOTA_EXCEEDED,
        message: '服务暂时不可用，请联系管理员',
        retryable: false,
      };
    }
    
    // 默认错误
    return {
      type: ErrorType.INTERNAL_ERROR,
      message: '系统错误，请稍后重试',
      retryable: true,
    };
  }
  
  /**
   * 带重试的异步函数执行
   */
  static async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === maxRetries - 1) {
          throw error;
        }
        
        // 指数退避
        const delay = baseDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw new Error('Max retries exceeded');
  }
}
