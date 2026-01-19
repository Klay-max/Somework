/**
 * API 客户端工具
 * 提供统一的 HTTP 请求接口，包含拦截器、错误处理、重试机制
 */

import { Platform } from 'react-native';

// API 配置
export const API_CONFIG = {
  baseURL: Platform.OS === 'web' 
    ? (process.env.NODE_ENV === 'development' ? 'http://localhost:3001/api' : '/api')  // 开发环境使用本地服务器
    : 'https://somegood.vercel.app/api',  // 移动端使用完整 URL
  timeout: 30000,  // 增加到 30 秒
  retryAttempts: 3,  // 增加重试次数
  retryDelay: 2000,  // 增加重试延迟
};

/**
 * HTTP 方法类型
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * 请求配置
 */
export interface RequestConfig {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retry?: boolean;
  retryAttempts?: number;
}

/**
 * 响应数据
 */
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

/**
 * API 错误
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * 请求拦截器类型
 */
export type RequestInterceptor = (
  url: string,
  config: RequestConfig
) => Promise<{ url: string; config: RequestConfig }> | { url: string; config: RequestConfig };

/**
 * 响应拦截器类型
 */
export type ResponseInterceptor = <T>(
  response: ApiResponse<T>
) => Promise<ApiResponse<T>> | ApiResponse<T>;

/**
 * 错误拦截器类型
 */
export type ErrorInterceptor = (
  error: ApiError
) => Promise<never> | never;

/**
 * API 客户端类
 */
export class ApiClient {
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];

  constructor(
    private baseURL: string = API_CONFIG.baseURL,
    private defaultTimeout: number = API_CONFIG.timeout
  ) {}

  /**
   * 添加请求拦截器
   */
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * 添加响应拦截器
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * 添加错误拦截器
   */
  addErrorInterceptor(interceptor: ErrorInterceptor): void {
    this.errorInterceptors.push(interceptor);
  }

  /**
   * 执行请求拦截器
   */
  private async runRequestInterceptors(
    url: string,
    config: RequestConfig
  ): Promise<{ url: string; config: RequestConfig }> {
    let result = { url, config };
    
    for (const interceptor of this.requestInterceptors) {
      result = await interceptor(result.url, result.config);
    }
    
    return result;
  }

  /**
   * 执行响应拦截器
   */
  private async runResponseInterceptors<T>(
    response: ApiResponse<T>
  ): Promise<ApiResponse<T>> {
    let result = response;
    
    for (const interceptor of this.responseInterceptors) {
      result = await interceptor(result);
    }
    
    return result;
  }

  /**
   * 执行错误拦截器
   */
  private async runErrorInterceptors(error: ApiError): Promise<never> {
    let currentError = error;
    
    for (const interceptor of this.errorInterceptors) {
      try {
        await interceptor(currentError);
      } catch (err) {
        if (err instanceof ApiError) {
          currentError = err;
        }
      }
    }
    
    throw currentError;
  }

  /**
   * 带超时的 fetch 请求
   */
  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeout: number
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError('请求超时', 408, 'TIMEOUT');
      }
      throw error;
    }
  }

  /**
   * 执行单次请求
   */
  private async executeRequest<T>(
    url: string,
    config: RequestConfig
  ): Promise<ApiResponse<T>> {
    const timeout = config.timeout || this.defaultTimeout;
    const fullURL = url.startsWith('http') ? url : `${this.baseURL}${url}`;

    // 构建请求选项
    const options: RequestInit = {
      method: config.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    };

    // 添加请求体
    if (config.body) {
      options.body = typeof config.body === 'string' 
        ? config.body 
        : JSON.stringify(config.body);
    }

    try {
      // 发送请求
      const response = await this.fetchWithTimeout(fullURL, options, timeout);

      // 解析响应
      let data: T;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text() as any;
      }

      // 检查响应状态
      if (!response.ok) {
        const errorData = data as any;
        throw new ApiError(
          errorData?.error || errorData?.message || '请求失败',
          response.status,
          errorData?.code || 'REQUEST_FAILED',
          errorData
        );
      }

      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      };
    } catch (error) {
      // 转换错误
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error instanceof Error) {
        throw new ApiError(
          error.message,
          undefined,
          'NETWORK_ERROR'
        );
      }
      
      throw new ApiError('未知错误', undefined, 'UNKNOWN_ERROR');
    }
  }

  /**
   * 带重试的请求
   */
  private async requestWithRetry<T>(
    url: string,
    config: RequestConfig
  ): Promise<ApiResponse<T>> {
    const maxAttempts = config.retry !== false 
      ? (config.retryAttempts || API_CONFIG.retryAttempts)
      : 0;
    
    let lastError: ApiError | undefined;

    for (let attempt = 0; attempt <= maxAttempts; attempt++) {
      try {
        return await this.executeRequest<T>(url, config);
      } catch (error) {
        lastError = error instanceof ApiError 
          ? error 
          : new ApiError('请求失败', undefined, 'REQUEST_FAILED');

        // 判断是否应该重试
        const shouldRetry = 
          attempt < maxAttempts &&
          lastError.code &&
          ['TIMEOUT', 'NETWORK_ERROR', 'SERVER_ERROR'].includes(lastError.code);

        if (!shouldRetry) {
          break;
        }

        // 等待后重试
        await new Promise(resolve => 
          setTimeout(resolve, API_CONFIG.retryDelay * (attempt + 1))
        );
      }
    }

    throw lastError!;
  }

  /**
   * 发送请求
   */
  async request<T = any>(
    url: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    try {
      // 执行请求拦截器
      const { url: interceptedUrl, config: interceptedConfig } = 
        await this.runRequestInterceptors(url, config);

      // 发送请求
      const response = await this.requestWithRetry<T>(
        interceptedUrl,
        interceptedConfig
      );

      // 执行响应拦截器
      return await this.runResponseInterceptors(response);
    } catch (error) {
      // 执行错误拦截器
      const apiError = error instanceof ApiError 
        ? error 
        : new ApiError('请求失败', undefined, 'REQUEST_FAILED');
      
      return await this.runErrorInterceptors(apiError);
    }
  }

  /**
   * GET 请求
   */
  async get<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'GET' });
  }

  /**
   * POST 请求
   */
  async post<T = any>(
    url: string,
    body?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'POST', body });
  }

  /**
   * PUT 请求
   */
  async put<T = any>(
    url: string,
    body?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'PUT', body });
  }

  /**
   * DELETE 请求
   */
  async delete<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'DELETE' });
  }

  /**
   * PATCH 请求
   */
  async patch<T = any>(
    url: string,
    body?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'PATCH', body });
  }
}

/**
 * 默认 API 客户端实例
 */
export const apiClient = new ApiClient();

/**
 * 添加默认请求拦截器 - 添加时间戳
 */
apiClient.addRequestInterceptor((url, config) => {
  console.log(`[API Request] ${config.method || 'GET'} ${url}`);
  return { url, config };
});

/**
 * 添加默认响应拦截器 - 记录响应
 */
apiClient.addResponseInterceptor((response) => {
  console.log(`[API Response] ${response.status} ${response.statusText}`);
  return response;
});

/**
 * 添加默认错误拦截器 - 记录错误
 */
apiClient.addErrorInterceptor((error) => {
  console.error(`[API Error] ${error.code}: ${error.message}`);
  throw error;
});
