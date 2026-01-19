/**
 * 缓存统计 API 端点
 * 
 * 功能：返回缓存统计信息和调试信息
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { corsMiddleware } from './middleware/cors';
import { globalCache } from './lib/cache-manager';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS 处理
  if (corsMiddleware(req, res)) {
    return;
  }
  
  // 只允许 GET 请求
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed' 
    });
  }
  
  try {
    const { debug } = req.query;
    
    if (debug === 'true') {
      // 返回详细调试信息
      const debugInfo = globalCache.getDebugInfo();
      return res.status(200).json({
        success: true,
        data: debugInfo,
      });
    } else {
      // 返回基本统计信息
      const stats = globalCache.getStats();
      return res.status(200).json({
        success: true,
        data: stats,
      });
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}