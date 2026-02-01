/**
 * 并发控制器
 * 
 * 功能：
 * - 限制并发任务数量
 * - 任务队列管理
 * - 进度追踪
 * - 错误处理
 */

export interface Task<T> {
  id: string;
  execute: () => Promise<T>;
  priority?: number;
}

export interface TaskResult<T> {
  id: string;
  status: 'success' | 'error';
  result?: T;
  error?: Error;
  duration: number;
}

export interface ConcurrencyOptions {
  maxConcurrent?: number;
  onProgress?: (completed: number, total: number) => void;
  onTaskComplete?: <T>(result: TaskResult<T>) => void;
  onTaskError?: (id: string, error: Error) => void;
}

export class ConcurrencyController {
  private maxConcurrent: number;
  private running: number = 0;
  private queue: Task<any>[] = [];
  private results: TaskResult<any>[] = [];
  private onProgress?: (completed: number, total: number) => void;
  private onTaskComplete?: <T>(result: TaskResult<T>) => void;
  private onTaskError?: (id: string, error: Error) => void;

  constructor(options: ConcurrencyOptions = {}) {
    this.maxConcurrent = options.maxConcurrent || 3;
    this.onProgress = options.onProgress;
    this.onTaskComplete = options.onTaskComplete;
    this.onTaskError = options.onTaskError;
  }

  /**
   * 添加任务到队列
   */
  addTask<T>(task: Task<T>): void {
    this.queue.push(task);
  }

  /**
   * 添加多个任务
   */
  addTasks<T>(tasks: Task<T>[]): void {
    this.queue.push(...tasks);
  }

  /**
   * 执行所有任务
   */
  async executeAll<T>(): Promise<TaskResult<T>[]> {
    const totalTasks = this.queue.length;
    
    if (totalTasks === 0) {
      return [];
    }

    console.log(`[ConcurrencyController] 开始执行 ${totalTasks} 个任务，最大并发数: ${this.maxConcurrent}`);

    // 按优先级排序（如果有）
    this.queue.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    return new Promise((resolve) => {
      const checkComplete = () => {
        if (this.results.length === totalTasks) {
          console.log(`[ConcurrencyController] 所有任务完成`);
          resolve(this.results as TaskResult<T>[]);
        }
      };

      const runNext = () => {
        // 如果队列为空或达到最大并发数，不执行
        if (this.queue.length === 0 || this.running >= this.maxConcurrent) {
          return;
        }

        const task = this.queue.shift();
        if (!task) return;

        this.running++;
        const startTime = Date.now();

        console.log(`[ConcurrencyController] 开始任务 ${task.id}，当前并发: ${this.running}`);

        task.execute()
          .then((result) => {
            const duration = Date.now() - startTime;
            const taskResult: TaskResult<any> = {
              id: task.id,
              status: 'success',
              result,
              duration,
            };

            this.results.push(taskResult);
            this.onTaskComplete?.(taskResult);

            console.log(`[ConcurrencyController] 任务 ${task.id} 成功，耗时: ${duration}ms`);
          })
          .catch((error) => {
            const duration = Date.now() - startTime;
            const taskResult: TaskResult<any> = {
              id: task.id,
              status: 'error',
              error,
              duration,
            };

            this.results.push(taskResult);
            this.onTaskError?.(task.id, error);

            console.error(`[ConcurrencyController] 任务 ${task.id} 失败:`, error);
          })
          .finally(() => {
            this.running--;

            // 更新进度
            this.onProgress?.(this.results.length, totalTasks);

            // 检查是否完成
            checkComplete();

            // 继续执行下一个任务
            runNext();
          });

        // 如果还有空闲槽位，继续启动任务
        if (this.running < this.maxConcurrent) {
          runNext();
        }
      };

      // 启动初始任务
      for (let i = 0; i < Math.min(this.maxConcurrent, this.queue.length); i++) {
        runNext();
      }
    });
  }

  /**
   * 获取统计信息
   */
  getStats() {
    const successful = this.results.filter(r => r.status === 'success').length;
    const failed = this.results.filter(r => r.status === 'error').length;
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);
    const avgDuration = this.results.length > 0 ? totalDuration / this.results.length : 0;

    return {
      total: this.results.length,
      successful,
      failed,
      totalDuration,
      avgDuration,
      successRate: this.results.length > 0 ? (successful / this.results.length) * 100 : 0,
    };
  }

  /**
   * 重置控制器
   */
  reset(): void {
    this.queue = [];
    this.results = [];
    this.running = 0;
  }

  /**
   * 获取当前状态
   */
  getStatus() {
    return {
      running: this.running,
      queued: this.queue.length,
      completed: this.results.length,
      maxConcurrent: this.maxConcurrent,
    };
  }
}

/**
 * 创建并发控制器的便捷函数
 */
export function createConcurrencyController(options?: ConcurrencyOptions): ConcurrencyController {
  return new ConcurrencyController(options);
}

/**
 * 批量执行任务的便捷函数
 */
export async function executeConcurrently<T>(
  tasks: Task<T>[],
  options?: ConcurrencyOptions
): Promise<TaskResult<T>[]> {
  const controller = new ConcurrencyController(options);
  controller.addTasks(tasks);
  return controller.executeAll<T>();
}
