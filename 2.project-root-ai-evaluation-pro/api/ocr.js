/**
 * OCR API 端点
 * 
 * 功能：接收图像 Base64，调用阿里云 OCR API 识别答题卡
 */

const { corsMiddleware } = require('./middleware/cors');
const { rateLimitMiddleware } = require('./middleware/rateLimit');
const { ErrorHandler } = require('./utils/errorHandler');
const { callAliCloudOCR } = require('./lib/alicloud-ocr');
const { globalCache } = require('./lib/cache-manager');

module.exports = async function handler(req, res) {
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
    
    // 调用阿里云 OCR API
    const ocrResult = await callAliCloudOCR(imageBase64);
    
    // 缓存结果
    globalCache.cacheOCRResult(imageBase64, ocrResult);
    
    // TODO: 提取答案（当前直接返回 OCR 原始结果）
    // const answers = extractAnswers(ocrResult, templateId);
    
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
  } catch (error) {
    const friendlyError = ErrorHandler.handle(error, 'OCR API');
    
    return res.status(500).json({
      success: false,
      error: friendlyError.message,
    });
  }
};
