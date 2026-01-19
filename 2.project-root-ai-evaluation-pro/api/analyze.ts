/**
 * AI 分析 API 端点
 * 
 * 功能：接收评分结果，调用 DeepSeek API 进行错误分析
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { corsMiddleware } from './middleware/cors';
import { rateLimitMiddleware } from './middleware/rateLimit';
import { ErrorHandler } from './utils/errorHandler';
import { analyzeErrors } from './lib/deepseek-client';
import { globalCache } from './lib/cache-manager';
import type { AnalyzeRequest, AnalyzeResponse } from './types';

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
    const { gradeResult, language = 'zh' }: AnalyzeRequest = req.body;
    
    // 验证请求参数
    if (!gradeResult) {
      return res.status(400).json({
        success: false,
        error: 'Missing gradeResult parameter',
      });
    }
    
    // 验证 gradeResult 结构
    if (!gradeResult.wrongAnswers || !Array.isArray(gradeResult.wrongAnswers)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid gradeResult: missing wrongAnswers',
      });
    }
    
    if (!gradeResult.dimensionScores || !Array.isArray(gradeResult.dimensionScores)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid gradeResult: missing dimensionScores',
      });
    }
    
    // 检查缓存
    const cachedAnalysis = globalCache.getCachedAnalysisResult(gradeResult);
    if (cachedAnalysis) {
      console.log('[Analyze API] Cache hit');
      
      const response: AnalyzeResponse = {
        success: true,
        data: cachedAnalysis,
      };
      
      return res.status(200).json(response);
    }
    
    console.log('[Analyze API] Cache miss, calling DeepSeek API');
    
    // 调用 DeepSeek API 进行错误分析
    const analysis = await analyzeErrors(gradeResult);
    
    // 缓存结果
    globalCache.cacheAnalysisResult(gradeResult, analysis);
    
    const response: AnalyzeResponse = {
      success: true,
      data: analysis,
    };
    
    return res.status(200).json(response);
  } catch (error: any) {
    const friendlyError = ErrorHandler.handle(error, 'AI Analysis API');
    
    return res.status(500).json({
      success: false,
      error: friendlyError.message,
    });
  }
}
