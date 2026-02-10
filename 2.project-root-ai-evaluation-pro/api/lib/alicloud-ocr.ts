/**
 * 阿里云 OCR API 客户端
 * 
 * 功能：
 * - 实现阿里云 API 签名算法
 * - 调用通用文字识别 API
 * - 解析 OCR 响应
 */

import crypto from 'crypto';
import axios from 'axios';

// OCR 结果类型
export interface OCRResult {
  success: boolean;
  text: string;
  regions: TextRegion[];
  confidence: number;
  error?: string;
}

export interface TextRegion {
  text: string;
  boundingBox: BoundingBox;
  confidence: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * 生成 HMAC-SHA1 签名
 */
function generateSignature(
  accessKeySecret: string,
  stringToSign: string
): string {
  const hmac = crypto.createHmac('sha1', accessKeySecret);
  hmac.update(stringToSign);
  return hmac.digest('base64');
}

/**
 * URL 编码（符合阿里云规范）
 */
function percentEncode(value: string): string {
  return encodeURIComponent(value)
    .replace(/\+/g, '%20')
    .replace(/\*/g, '%2A')
    .replace(/%7E/g, '~');
}


/**
 * 构造待签名字符串
 */
function buildStringToSign(
  method: string,
  params: Record<string, string>
): string {
  // 1. 按参数名排序
  const sortedKeys = Object.keys(params).sort();
  
  // 2. 构造规范化查询字符串
  const canonicalizedQueryString = sortedKeys
    .map(key => `${percentEncode(key)}=${percentEncode(params[key])}`)
    .join('&');
  
  // 3. 构造待签名字符串
  // StringToSign = HTTPMethod + "&" + percentEncode("/") + "&" + percentEncode(CanonicalizedQueryString)
  return `${method}&${percentEncode('/')}&${percentEncode(canonicalizedQueryString)}`;
}

/**
 * 生成公共参数
 */
function generateCommonParams(accessKeyId: string): Record<string, string> {
  return {
    Format: 'JSON',
    Version: '2021-07-07',
    AccessKeyId: accessKeyId,
    SignatureMethod: 'HMAC-SHA1',
    Timestamp: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
    SignatureVersion: '1.0',
    SignatureNonce: Math.random().toString(36).substring(2, 15) + 
                    Math.random().toString(36).substring(2, 15),
  };
}


/**
 * 解析 OCR API 响应
 */
function parseOCRResponse(data: any): OCRResult {
  // 检查响应状态
  if (data.Code && data.Code !== 'Success') {
    throw new Error(`OCR API Error: ${data.Message || data.Code}`);
  }
  
  // 提取识别结果
  const result = data.Data || {};
  const content = result.content || '';
  const wordsInfo = result.prism_wordsInfo || [];
  
  // 解析文本区域
  const regions: TextRegion[] = wordsInfo.map((word: any) => {
    const pos = word.pos || [];
    const topLeft = pos[0] || { x: 0, y: 0 };
    const bottomRight = pos[2] || { x: 0, y: 0 };
    
    return {
      text: word.word || '',
      boundingBox: {
        x: topLeft.x,
        y: topLeft.y,
        width: bottomRight.x - topLeft.x,
        height: bottomRight.y - topLeft.y,
      },
      confidence: word.prob || 0,
    };
  });
  
  // 计算平均置信度
  const avgConfidence = regions.length > 0
    ? regions.reduce((sum, r) => sum + r.confidence, 0) / regions.length
    : 0;
  
  return {
    success: true,
    text: content,
    regions,
    confidence: avgConfidence,
  };
}

/**
 * 调用阿里云 OCR API
 * 
 * @param imageBase64 - 图像的 Base64 编码字符串
 * @returns OCR 识别结果
 */
export async function callAliCloudOCR(imageBase64: string): Promise<OCRResult> {
  const accessKeyId = process.env.ALICLOUD_ACCESS_KEY_ID;
  const accessKeySecret = process.env.ALICLOUD_ACCESS_KEY_SECRET;
  // 使用杭州端点（网络诊断显示可用）
  const endpoint = process.env.ALICLOUD_OCR_ENDPOINT || 'https://ocr-api.cn-hangzhou.aliyuncs.com';
  
  // 验证环境变量
  if (!accessKeyId || !accessKeySecret) {
    throw new Error('Missing Alibaba Cloud credentials. Please set ALICLOUD_ACCESS_KEY_ID and ALICLOUD_ACCESS_KEY_SECRET');
  }
  
  // 公共参数
  const commonParams = generateCommonParams(accessKeyId);
  
  // 业务参数
  const businessParams: Record<string, string> = {
    Action: 'RecognizeGeneral',
    body: imageBase64,
  };
  
  // 合并所有参数
  const allParams = { ...commonParams, ...businessParams };
  
  // 生成签名
  const stringToSign = buildStringToSign('POST', allParams);
  const signature = generateSignature(accessKeySecret, stringToSign);
  
  // 添加签名到参数
  allParams.Signature = signature;
  
  try {
    // 发送 POST 请求（带超时控制）
    const timeout = parseInt(process.env.ALICLOUD_TIMEOUT || '10000', 10);
    
    const response = await axios.post(endpoint, null, {
      params: allParams,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      timeout, // 使用配置的超时时间
    });
    
    // 解析响应
    return parseOCRResponse(response.data);
  } catch (error: any) {
    // 处理错误
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      const timeout = parseInt(process.env.ALICLOUD_TIMEOUT || '10000', 10);
      throw new Error(`OCR API timeout after ${timeout}ms`);
    } else if (error.response) {
      // API 返回错误响应
      throw new Error(`OCR API Error: ${error.response.data?.Message || error.response.statusText}`);
    } else if (error.request) {
      // 请求发送但没有收到响应
      throw new Error('OCR API Timeout: No response received');
    } else {
      // 其他错误
      throw new Error(`OCR Request Error: ${error.message}`);
    }
  }
}

