/**
 * AI 分析服务客户端
 * 负责调用后端 API 进行错误分析和学习路径生成
 * 支持 Mock 模式用于离线开发
 */

import { apiClient, ApiError } from './ApiClient';
import { CacheService } from './CacheService';
import { MockApiService, isMockEnabled } from './MockApiService';
import type { 
  AnalysisResult, 
  LearningPath, 
  GradingResult 
} from './types';

// 请求超时时间（毫秒）
const TIMEOUT = {
  OCR: 30000,      // 30 秒
  ANALYZE: 30000,  // 30 秒
  PATH: 30000,     // 30 秒
};

/**
 * API 错误类（兼容旧代码）
 */
export class APIError extends ApiError {
  constructor(
    message: string,
    public statusCode?: number,
    public errorCode?: string
  ) {
    super(message, statusCode, errorCode);
    this.name = 'APIError';
  }
}

/**
 * AI 分析服务类
 */
export class AIAnalysisService {
  /**
   * OCR 识别答题卡（带缓存 + Mock 支持）
   * @param imageBase64 图像的 Base64 编码（包含 data:image/jpeg;base64, 前缀）
   * @returns OCR 识别结果
   */
  static async recognizeAnswerSheet(
    imageBase64: string
  ): Promise<{ text: string; confidence: number }> {
    try {
      console.log('[AIAnalysisService] 开始 OCR 识别...');
      console.log('[AIAnalysisService] Mock 模式:', isMockEnabled() ? '启用' : '禁用');
      console.log('[AIAnalysisService] 图像大小:', imageBase64.length, '字符');
      
      // Mock 模式
      if (isMockEnabled()) {
        console.log('[AIAnalysisService] 使用 Mock OCR');
        return await MockApiService.performOCR(imageBase64);
      }
      
      // 生成缓存键
      const cacheKey = await CacheService.hashImage(imageBase64);
      const cachedKey = `ocr_${cacheKey}`;
      
      // 检查缓存
      const cached = await CacheService.get<{ text: string; confidence: number }>(cachedKey);
      if (cached) {
        console.log('[AIAnalysisService] 使用缓存的 OCR 结果');
        return cached;
      }
      
      const response = await apiClient.post<{
        success: boolean;
        data?: {
          rawText?: string;
          confidence: number;
        };
        error?: string;
      }>(
        '/ocr',
        { imageBase64 },
        { timeout: TIMEOUT.OCR }
      );

      console.log('[AIAnalysisService] OCR 响应:', response.status);

      // 检查响应格式
      if (!response.data.success || !response.data.data) {
        throw new APIError(
          response.data.error || 'OCR 识别失败',
          500,
          'OCR_ERROR'
        );
      }

      const result = {
        text: response.data.data.rawText || '',
        confidence: response.data.data.confidence || 0
      };
      
      // 缓存结果
      await CacheService.set(cachedKey, result);
      
      console.log('[AIAnalysisService] OCR 成功');
      return result;
    } catch (error) {
      console.error('[AIAnalysisService] OCR 错误:', error);
      if (error instanceof ApiError) {
        throw new APIError(
          error.message,
          error.status,
          error.code
        );
      }
      throw error;
    }
  }

  /**
   * 分析错题并生成诊断报告（带缓存）
   * @param gradingResult 评分结果
   * @returns 错误分析结果
   */
  static async analyzeErrors(
    gradingResult: { 
      wrongAnswers: Array<{ 
        questionId?: string;
        questionNumber?: number;
        userAnswer: string; 
        correctAnswer: string;
      }>;
      [key: string]: any;
    }
  ): Promise<AnalysisResult> {
    try {
      // Mock 模式
      if (isMockEnabled()) {
        console.log('[AIAnalysisService] 使用 Mock 错误分析');
        const wrongAnswers = gradingResult.wrongAnswers.map(wa => ({
          questionNumber: wa.questionNumber || parseInt(wa.questionId || '0'),
          studentAnswer: wa.userAnswer,
          correctAnswer: wa.correctAnswer,
        }));
        const result = await MockApiService.analyzeErrors(wrongAnswers);
        return {
          surfaceIssues: result.surfaceIssues,
          rootCauses: result.rootCauses,
          aiComment: result.aiComment,
          knowledgeGaps: result.knowledgeGaps,
        };
      }
      
      // 生成缓存键（基于评分结果）
      const cacheKey = `analyze_${JSON.stringify(gradingResult).substring(0, 100)}`;
      
      // 检查缓存
      const cached = await CacheService.get<AnalysisResult>(cacheKey);
      if (cached) {
        console.log('[AIAnalysisService] 使用缓存的分析结果');
        return cached;
      }
      
      const response = await apiClient.post<AnalysisResult>(
        '/analyze',
        gradingResult,
        { timeout: TIMEOUT.ANALYZE }
      );

      const data = response.data;
      
      // 验证响应数据结构
      if (!data.surfaceIssues || !data.rootCauses || !data.aiComment) {
        throw new APIError(
          '分析结果格式错误',
          500,
          'INVALID_RESPONSE'
        );
      }

      // 缓存结果
      await CacheService.set(cacheKey, data);

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new APIError(
          error.message,
          error.status,
          error.code
        );
      }
      throw error;
    }
  }

  /**
   * 生成个性化学习路径（带缓存 + Mock 支持）
   * @param analysisResult 错误分析结果
   * @returns 学习路径
   */
  static async generateLearningPath(
    analysisResult: AnalysisResult
  ): Promise<LearningPath> {
    try {
      // Mock 模式
      if (isMockEnabled()) {
        console.log('[AIAnalysisService] 使用 Mock 学习路径');
        const weakPoints = analysisResult.rootCauses || [];
        const result = await MockApiService.generateLearningPath(weakPoints);
        // 为每个阶段添加 id，并添加总时长和目标分数
        return { 
          stages: result.stages.map((stage, index) => ({
            id: `stage-${index + 1}`,
            ...stage
          })),
          estimatedDuration: '7 周',
          targetScore: 90
        };
      }
      
      // 生成缓存键（基于分析结果）
      const cacheKey = `path_${JSON.stringify(analysisResult).substring(0, 100)}`;
      
      // 检查缓存
      const cached = await CacheService.get<LearningPath>(cacheKey);
      if (cached) {
        console.log('[AIAnalysisService] 使用缓存的学习路径');
        return cached;
      }
      
      const response = await apiClient.post<LearningPath>(
        '/generate-path',
        analysisResult,
        { timeout: TIMEOUT.PATH }
      );

      const data = response.data;
      
      // 验证响应数据结构
      if (!data.stages || !Array.isArray(data.stages)) {
        throw new APIError(
          '学习路径格式错误',
          500,
          'INVALID_RESPONSE'
        );
      }

      // 缓存结果
      await CacheService.set(cacheKey, data);

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new APIError(
          error.message,
          error.status,
          error.code
        );
      }
      throw error;
    }
  }

  /**
   * 完整的分析流程：错误分析 + 学习路径生成
   * @param gradingResult 评分结果
   * @returns 包含分析结果和学习路径的对象
   */
  static async performFullAnalysis(
    gradingResult: any
  ): Promise<{
    analysis: AnalysisResult;
    learningPath: LearningPath;
  }> {
    // 先进行错误分析
    const analysis = await this.analyzeErrors(gradingResult);
    
    // 基于分析结果生成学习路径
    const learningPath = await this.generateLearningPath(analysis);
    
    return { analysis, learningPath };
  }

  /**
   * 检查 API 服务健康状态
   * @returns 服务是否可用
   */
  static async checkHealth(): Promise<boolean> {
    try {
      await apiClient.get('/health', { timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  }
}
