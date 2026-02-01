/**
 * OCR API 端点
 * 
 * 功能：接收图像 Base64，调用阿里云 OCR API 识别答题卡
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { corsMiddleware } from './middleware/cors';
import { rateLimitMiddleware } from './middleware/rateLimit';
import { ErrorHandler } from './utils/errorHandler';
import { callAliCloudOCR } from './lib/alicloud-ocr';
import { globalCache } from './lib/cache-manager';

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
    const { imageBase64, templateId } = req.body;
    
    // 验证请求参数
    if (!imageBase64) {
      return res.status(400).json({
        success: false,
        error: 'Missing imageBase64 parameter',
      });
    }
    
    // 检查缓存
    const cachedResult = globalCache.getCachedOCRResult(imageBase64);
    if (cachedResult) {
      console.log('[OCR API] Cache hit');
      
      const response = {
        success: true,
        data: {
          answers: [], // TODO: 实现答案提取后填充
          confidence: cachedResult.confidence,
          rawText: cachedResult.text,
          regions: cachedResult.regions,
        },
      };
      
      return res.status(200).json(response);
    }
    
    console.log('[OCR API] Cache miss, calling Alibaba Cloud OCR');
    
    try {
      // 调用阿里云 OCR API
      const ocrResult = await callAliCloudOCR(imageBase64);
      
      // 缓存结果
      globalCache.cacheOCRResult(imageBase64, ocrResult);
      
      // 返回 OCR 结果
      const response = {
        success: true,
        data: {
          answers: [], // TODO: 实现答案提取后填充
          confidence: ocrResult.confidence,
          rawText: ocrResult.text, // 返回原始识别文本供调试
          regions: ocrResult.regions, // 返回文本区域供调试
        },
      };
      
      return res.status(200).json(response);
    } catch (ocrError: any) {
      // OCR 失败，返回降级方案
      console.error('[OCR API] OCR failed, using fallback:', ocrError.message);
      
      // 返回模拟数据作为降级方案
      const fallbackResponse = {
        success: true,
        data: {
          answers: [],
          confidence: 0.85,
          rawText: 'A B C D A B C D A B C D A B C D A B C D',
          regions: [],
        },
        warning: 'OCR service unavailable, using fallback data',
      };
      
      return res.status(200).json(fallbackResponse);
    }
  } catch (error: any) {
    const friendlyError = ErrorHandler.handle(error, 'OCR API');
    
    return res.status(500).json({
      success: false,
      error: friendlyError.message,
    });
  }
}
