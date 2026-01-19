/**
 * 简单的 OCR 测试端点
 * 不依赖其他模块，直接测试阿里云 OCR
 */

const crypto = require('crypto');
const https = require('https');

function percentEncode(value) {
  return encodeURIComponent(value)
    .replace(/\+/g, '%20')
    .replace(/\*/g, '%2A')
    .replace(/%7E/g, '~');
}

function buildStringToSign(method, params) {
  const sortedKeys = Object.keys(params).sort();
  const canonicalizedQueryString = sortedKeys
    .map(key => `${percentEncode(key)}=${percentEncode(params[key])}`)
    .join('&');
  return `${method}&${percentEncode('/')}&${percentEncode(canonicalizedQueryString)}`;
}

function generateSignature(accessKeySecret, stringToSign) {
  const hmac = crypto.createHmac('sha1', accessKeySecret);
  hmac.update(stringToSign);
  return hmac.digest('base64');
}

async function callAliCloudOCR(imageBase64) {
  const accessKeyId = process.env.ALICLOUD_ACCESS_KEY_ID;
  const accessKeySecret = process.env.ALICLOUD_ACCESS_KEY_SECRET;
  
  if (!accessKeyId || !accessKeySecret) {
    throw new Error('Missing Alibaba Cloud credentials');
  }
  
  const commonParams = {
    Format: 'JSON',
    Version: '2021-07-07',
    AccessKeyId: accessKeyId,
    SignatureMethod: 'HMAC-SHA1',
    Timestamp: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
    SignatureVersion: '1.0',
    SignatureNonce: Math.random().toString(36).substring(2, 15),
  };
  
  const businessParams = {
    Action: 'RecognizeGeneral',
    body: imageBase64,
  };
  
  const allParams = { ...commonParams, ...businessParams };
  const stringToSign = buildStringToSign('POST', allParams);
  const signature = generateSignature(accessKeySecret, stringToSign);
  allParams.Signature = signature;
  
  const queryString = Object.keys(allParams)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(allParams[key])}`)
    .join('&');
  
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'ocr-api.cn-shanghai.aliyuncs.com',
      path: `/?${queryString}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      timeout: 10000,
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.Code && result.Code !== 'Success') {
            reject(new Error(`OCR API Error: ${result.Message || result.Code}`));
          } else {
            const content = result.Data?.content || '';
            resolve({
              success: true,
              text: content,
              confidence: 0.95
            });
          }
        } catch (err) {
          reject(err);
        }
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('OCR API timeout'));
    });
    
    req.end();
  });
}

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed' 
    });
  }
  
  try {
    const { imageBase64 } = req.body;
    
    if (!imageBase64) {
      return res.status(400).json({
        success: false,
        error: 'Missing imageBase64 parameter',
      });
    }
    
    console.log('[Test OCR API] Calling Alibaba Cloud OCR...');
    const ocrResult = await callAliCloudOCR(imageBase64);
    
    console.log('[Test OCR API] Success!', ocrResult);
    
    return res.status(200).json({
      success: true,
      data: {
        rawText: ocrResult.text,
        confidence: ocrResult.confidence,
      },
    });
  } catch (error) {
    console.error('[Test OCR API] Error:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message || 'OCR failed',
    });
  }
};
