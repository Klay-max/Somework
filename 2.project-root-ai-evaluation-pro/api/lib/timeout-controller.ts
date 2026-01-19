/**
 * 请求超时控制器
 * 
 * 功能：
 * - 统一的超时控制
 * - 可配置的超时时间
 * - 超时错误处理
 * - 请求取消支持
 */

/**
 * 超时配置
 */
export const TIMEOUT_CONFIG = {
  ocr: parseInt(process.env.OCR_TIMEOUT || '30000', 10),      // 30 秒（从 10 秒增加）
  analyze: parseInt(process.env.ANALYZE_TIMEOUT || '30000', 10),  // 30 秒（从 15 秒增加）
  generatePath: parseInt(process.env.GENERATE_PATH_TIMEOUT || '30000', 10), // 30 秒（从 12 秒增加）
  default: parseInt(process.env.DEFAULT_TIMEOUT || '60000', 10),   // 60 秒（从 30 秒增加）
};

/**
 * 超时错误类
 */
export class TimeoutError extends Error {
  constructor(message: string, public timeout: number) {
    super(message);
    this.name = 'TimeoutError';
  }
}

/**
 * 带超时的 Promise 包装器
 * 
 * @param promise - 要包装的 Promise
 * @param timeout - 超时时间（毫秒）
 * @param errorMessage - 超时错误消息
 * @returns 带超时控制的 Promise
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeout: number,
  errorMessage?: string
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new TimeoutError(
          errorMessage || `Request timeout after ${timeout}ms`,
          timeout
        ));
      }, timeout);
      
      // 清理定时器（当原 Promise 完成时）
      promise.finally(() => clearTimeout(timeoutId));
    }),
  ]);
}

/**
 * 带取消功能的超时控制器
 */
export class CancellableTimeout {
  private timeoutId: NodeJS.Timeout | null = null;
  private cancelled = false;
  
  /**
   * 创建可取消的超时 Promise
   * 
   * @param promise - 要包装的 Promise
   * @param timeout - 超时时间（毫秒）
   * @param errorMessage - 超时错误消息
   * @returns 带取消功能的 Promise
   */
  wrap<T>(
    promise: Promise<T>,
    timeout: number,
    errorMessage?: string
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      // 设置超时
      this.timeoutId = setTimeout(() => {
        if (!this.cancelled) {
          reject(new TimeoutError(
            errorMessage || `Request timeout after ${timeout}ms`,
            timeout
          ));
        }
      }, timeout);
      
      // 处理原 Promise
      promise
        .then((result) => {
          if (!this.cancelled) {
            this.cleanup();
            resolve(result);
          }
        })
        .catch((error) => {
          if (!this.cancelled) {
            this.cleanup();
            reject(error);
          }
        });
    });
  }
  
  /**
   * 取消超时
   */
  cancel(): void {
    this.cancelled = true;
    this.cleanup();
  }
  
  /**
   * 清理资源
   */
  private cleanup(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}

/**
 * OCR 请求超时包装器
 * 
 * @param promise - OCR Promise
 * @returns 带超时控制的 Promise
 */
export function withOCRTimeout<T>(promise: Promise<T>): Promise<T> {
  return withTimeout(
    promise,
    TIMEOUT_CONFIG.ocr,
    `OCR request timeout after ${TIMEOUT_CONFIG.ocr}ms`
  );
}

/**
 * AI 分析请求超时包装器
 * 
 * @param promise - 分析 Promise
 * @returns 带超时控制的 Promise
 */
export function withAnalyzeTimeout<T>(promise: Promise<T>): Promise<T> {
  return withTimeout(
    promise,
    TIMEOUT_CONFIG.analyze,
    `AI analysis request timeout after ${TIMEOUT_CONFIG.analyze}ms`
  );
}

/**
 * 学习路径生成请求超时包装器
 * 
 * @param promise - 路径生成 Promise
 * @returns 带超时控制的 Promise
 */
export function withGeneratePathTimeout<T>(promise: Promise<T>): Promise<T> {
  return withTimeout(
    promise,
    TIMEOUT_CONFIG.generatePath,
    `Learning path generation timeout after ${TIMEOUT_CONFIG.generatePath}ms`
  );
}

/**
 * 批量请求超时控制器
 */
export class BatchTimeoutController {
  private controllers: CancellableTimeout[] = [];
  
  /**
   * 添加请求到批量控制器
   * 
   * @param promise - 要控制的 Promise
   * @param timeout - 超时时间
   * @param errorMessage - 错误消息
   * @returns 带超时控制的 Promise
   */
  add<T>(
    promise: Promise<T>,
    timeout: number,
    errorMessage?: string
  ): Promise<T> {
    const controller = new CancellableTimeout();
    this.controllers.push(controller);
    
    return controller.wrap(promise, timeout, errorMessage);
  }
  
  /**
   * 取消所有请求
   */
  cancelAll(): void {
    this.controllers.forEach(controller => controller.cancel());
    this.controllers = [];
  }
  
  /**
   * 获取活跃请求数量
   */
  getActiveCount(): number {
    return this.controllers.length;
  }
}

/**
 * 重试机制配置
 */
export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
  retryCondition?: (error: any) => boolean;
}

/**
 * 默认重试配置
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  retryCondition: (error) => {
    // 只重试网络错误和超时错误，不重试业务错误
    return error.code === 'ECONNRESET' ||
           error.code === 'ENOTFOUND' ||
           error.code === 'ETIMEDOUT' ||
           error instanceof TimeoutError;
  },
};

/**
 * 带重试和超时的请求包装器
 * 
 * @param fn - 要执行的函数
 * @param timeout - 超时时间
 * @param retryConfig - 重试配置
 * @returns 带重试和超时控制的 Promise
 */
export async function withRetryAndTimeout<T>(
  fn: () => Promise<T>,
  timeout: number,
  retryConfig: Partial<RetryConfig> = {}
): Promise<T> {
  const config = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
  let lastError: any;
  
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      // 应用超时控制
      const result = await withTimeout(
        fn(),
        timeout,
        `Request timeout after ${timeout}ms (attempt ${attempt + 1})`
      );
      
      return result;
    } catch (error) {
      lastError = error;
      
      // 如果是最后一次尝试，直接抛出错误
      if (attempt === config.maxRetries) {
        throw error;
      }
      
      // 检查是否应该重试
      if (config.retryCondition && !config.retryCondition(error)) {
        throw error;
      }
      
      // 计算延迟时间（指数退避）
      const delay = Math.min(
        config.baseDelay * Math.pow(config.backoffFactor, attempt),
        config.maxDelay
      );
      
      console.log(`[Retry] Attempt ${attempt + 1} failed, retrying in ${delay}ms:`, (error as Error)?.message || String(error));
      
      // 等待后重试
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

/**
 * 请求性能监控
 */
export class RequestMonitor {
  private static requests = new Map<string, {
    startTime: number;
    timeout: number;
    endpoint: string;
  }>();
  
  /**
   * 开始监控请求
   * 
   * @param requestId - 请求 ID
   * @param endpoint - 端点名称
   * @param timeout - 超时时间
   */
  static start(requestId: string, endpoint: string, timeout: number): void {
    this.requests.set(requestId, {
      startTime: Date.now(),
      timeout,
      endpoint,
    });
  }
  
  /**
   * 结束监控请求
   * 
   * @param requestId - 请求 ID
   * @param success - 是否成功
   * @param error - 错误信息
   */
  static end(requestId: string, success: boolean, error?: any): void {
    const request = this.requests.get(requestId);
    if (!request) return;
    
    const duration = Date.now() - request.startTime;
    const isTimeout = duration >= request.timeout;
    
    console.log(`[RequestMonitor] ${request.endpoint}:`, {
      requestId,
      duration: `${duration}ms`,
      timeout: `${request.timeout}ms`,
      success,
      isTimeout,
      error: error ? String(error) : undefined,
    });
    
    this.requests.delete(requestId);
  }
  
  /**
   * 获取活跃请求统计
   */
  static getStats(): {
    activeRequests: number;
    requests: Array<{
      requestId: string;
      endpoint: string;
      duration: number;
      timeout: number;
      isNearTimeout: boolean;
    }>;
  } {
    const now = Date.now();
    const requests: any[] = [];
    
    for (const [requestId, request] of this.requests.entries()) {
      const duration = now - request.startTime;
      const isNearTimeout = duration >= request.timeout * 0.8; // 80% 的超时时间
      
      requests.push({
        requestId,
        endpoint: request.endpoint,
        duration,
        timeout: request.timeout,
        isNearTimeout,
      });
    }
    
    return {
      activeRequests: this.requests.size,
      requests: requests.sort((a, b) => b.duration - a.duration), // 按持续时间排序
    };
  }
}