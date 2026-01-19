/**
 * 请求队列管理器
 * 
 * 功能：
 * - 管理并发请求数量
 * - 支持请求优先级
 * - 支持请求取消
 * - 防止请求过载
 */

/**
 * 请求优先级
 */
export enum RequestPriority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2,
  URGENT = 3,
}

/**
 * 队列中的请求
 */
interface QueuedRequest<T> {
  id: string;
  priority: RequestPriority;
  executor: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: any) => void;
  timestamp: number;
  cancelled: boolean;
}

/**
 * 请求队列配置
 */
interface QueueConfig {
  maxConcurrent: number;  // 最大并发数
  timeout: number;        // 请求超时（毫秒）
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: QueueConfig = {
  maxConcurrent: 2,
  timeout: 30000,
};

/**
 * 请求队列管理器类
 */
export class RequestQueue {
  private config: QueueConfig;
  private queue: QueuedRequest<any>[] = [];
  private running: Set<string> = new Set();
  private requestCounter = 0;

  constructor(config: Partial<QueueConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * 添加请求到队列
   */
  async enqueue<T>(
    executor: () => Promise<T>,
    priority: RequestPriority = RequestPriority.NORMAL
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const id = `req_${++this.requestCounter}`;
      
      const request: QueuedRequest<T> = {
        id,
        priority,
        executor,
        resolve,
        reject,
        timestamp: Date.now(),
        cancelled: false,
      };

      // 插入队列（按优先级排序）
      this.insertByPriority(request);
      
      console.log(`[RequestQueue] 请求已加入队列: ${id}, 优先级: ${priority}, 队列长度: ${this.queue.length}`);

      // 尝试执行队列
      this.processQueue();
    });
  }

  /**
   * 按优先级插入请求
   */
  private insertByPriority(request: QueuedRequest<any>): void {
    let inserted = false;
    
    for (let i = 0; i < this.queue.length; i++) {
      if (request.priority > this.queue[i].priority) {
        this.queue.splice(i, 0, request);
        inserted = true;
        break;
      }
    }
    
    if (!inserted) {
      this.queue.push(request);
    }
  }

  /**
   * 处理队列
   */
  private async processQueue(): Promise<void> {
    // 检查是否可以执行更多请求
    while (
      this.running.size < this.config.maxConcurrent &&
      this.queue.length > 0
    ) {
      const request = this.queue.shift();
      
      if (!request || request.cancelled) {
        continue;
      }

      // 标记为运行中
      this.running.add(request.id);
      
      console.log(`[RequestQueue] 开始执行请求: ${request.id}, 运行中: ${this.running.size}/${this.config.maxConcurrent}`);

      // 执行请求（不等待）
      this.executeRequest(request);
    }
  }

  /**
   * 执行单个请求
   */
  private async executeRequest<T>(request: QueuedRequest<T>): Promise<void> {
    try {
      // 设置超时
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('请求超时'));
        }, this.config.timeout);
      });

      // 执行请求
      const result = await Promise.race([
        request.executor(),
        timeoutPromise,
      ]);

      // 成功
      if (!request.cancelled) {
        request.resolve(result);
        console.log(`[RequestQueue] 请求成功: ${request.id}`);
      }
    } catch (error) {
      // 失败
      if (!request.cancelled) {
        request.reject(error);
        console.error(`[RequestQueue] 请求失败: ${request.id}`, error);
      }
    } finally {
      // 从运行中移除
      this.running.delete(request.id);
      
      // 继续处理队列
      this.processQueue();
    }
  }

  /**
   * 取消请求
   */
  cancel(requestId: string): boolean {
    // 查找队列中的请求
    const index = this.queue.findIndex(r => r.id === requestId);
    
    if (index !== -1) {
      const request = this.queue[index];
      request.cancelled = true;
      request.reject(new Error('请求已取消'));
      this.queue.splice(index, 1);
      
      console.log(`[RequestQueue] 请求已取消: ${requestId}`);
      return true;
    }
    
    return false;
  }

  /**
   * 取消所有请求
   */
  cancelAll(): void {
    const count = this.queue.length;
    
    for (const request of this.queue) {
      request.cancelled = true;
      request.reject(new Error('请求已取消'));
    }
    
    this.queue = [];
    
    console.log(`[RequestQueue] 已取消所有请求: ${count} 个`);
  }

  /**
   * 获取队列状态
   */
  getStatus(): {
    queueLength: number;
    runningCount: number;
    maxConcurrent: number;
  } {
    return {
      queueLength: this.queue.length,
      runningCount: this.running.size,
      maxConcurrent: this.config.maxConcurrent,
    };
  }

  /**
   * 清空队列
   */
  clear(): void {
    this.cancelAll();
    this.running.clear();
  }
}

/**
 * 全局请求队列实例
 */
export const globalRequestQueue = new RequestQueue();
