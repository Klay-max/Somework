/**
 * 学习路径生成 API 端点
 * 
 * 功能：接收错误分析，调用 DeepSeek API 生成个性化学习路径
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { corsMiddleware } from './middleware/cors';
import { rateLimitMiddleware } from './middleware/rateLimit';
import { ErrorHandler } from './utils/errorHandler';
import { generateLearningPath } from './lib/deepseek-client';
import { globalCache } from './lib/cache-manager';
import type { GeneratePathRequest, GeneratePathResponse } from './types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS 处理
  if (corsMiddleware(req, res)) {
    return;
  }
  
  // 频率限制
  if (rateLimitMiddleware(req, res)) {
    return;
  }
  
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed' 
    });
  }
  
  try {
    const { errorAnalysis, language = 'zh' }: GeneratePathRequest = req.body;
    
    // 验证请求参数
    if (!errorAnalysis) {
      return res.status(400).json({
        success: false,
        error: 'Missing errorAnalysis parameter',
      });
    }
    
    // 验证 errorAnalysis 结构
    if (!errorAnalysis.surfaceIssues || !Array.isArray(errorAnalysis.surfaceIssues)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid errorAnalysis: missing surfaceIssues',
      });
    }
    
    if (!errorAnalysis.rootCauses || !Array.isArray(errorAnalysis.rootCauses)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid errorAnalysis: missing rootCauses',
      });
    }
    
    if (!errorAnalysis.knowledgeGaps || !Array.isArray(errorAnalysis.knowledgeGaps)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid errorAnalysis: missing knowledgeGaps',
      });
    }
    
    // 检查缓存
    const cachedPath = globalCache.getCachedLearningPath(errorAnalysis);
    if (cachedPath) {
      console.log('[Generate Path API] Cache hit');
      
      const response: GeneratePathResponse = {
        success: true,
        data: cachedPath,
      };
      
      return res.status(200).json(response);
    }
    
    console.log('[Generate Path API] Cache miss, calling DeepSeek API');
    
    // 调用 DeepSeek API 生成学习路径
    const learningPath = await generateLearningPath(errorAnalysis);
    
    // 缓存结果
    globalCache.cacheLearningPath(errorAnalysis, learningPath);
    
    const response: GeneratePathResponse = {
      success: true,
      data: learningPath,
    };
    
    return res.status(200).json(response);
  } catch (error: any) {
    const friendlyError = ErrorHandler.handle(error, 'Generate Path API');
    
    return res.status(500).json({
      success: false,
      error: friendlyError.message,
    });
  }
}
