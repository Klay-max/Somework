/**
 * 频率限制中间件
 * 
 * 限制每个客户端的请求频率，防止滥用
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

// 简单的内存存储（生产环境应使用 Redis）
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function rateLimitMiddleware(req: VercelRequest, res: VercelResponse): boolean {
  const maxRequests = parseInt(process.env.RATE_LIMIT_MAX || '10', 10);
  const windowMs = 60 * 1000; // 1 分钟
  
  // 获取客户端标识（优先使用自定义 header，否则使用 IP）
  const clientId = 
    (req.headers['x-client-id'] as string) || 
    req.headers['x-forwarded-for'] as string ||
    req.socket.remoteAddress ||
    'unknown';
  
  const now = Date.now();
  const clientData = requestCounts.get(clientId);
  
  if (!clientData || now > clientData.resetTime) {
    // 新客户端或窗口已过期，重置计数
    requestCounts.set(clientId, {
      count: 1,
      resetTime: now + windowMs,
    });
    return false;
  }
  
  if (clientData.count >= maxRequests) {
    // 超过限制
    const retryAfter = Math.ceil((clientData.resetTime - now) / 1000);
    
    res.setHeader('Retry-After', retryAfter.toString());
    res.status(429).json({
      success: false,
      error: 'Too many requests',
      retryAfter,
    });
    return true;
  }
  
  // 增加计数
  clientData.count++;
  requestCounts.set(clientId, clientData);
  
  // 清理过期的记录（简单实现）
  if (requestCounts.size > 1000) {
    for (const [key, value] of requestCounts.entries()) {
      if (now > value.resetTime) {
        requestCounts.delete(key);
      }
    }
  }
  
  return false;
}
