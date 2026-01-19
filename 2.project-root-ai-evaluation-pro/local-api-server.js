/**
 * 本地 API 测试服务器
 * 直接运行 API 函数，不依赖 Vercel CLI
 */

const http = require('http');
const crypto = require('crypto');
const https = require('https');

// 从 .env.local 加载环境变量
require('dotenv').config({ path: '.env.local' });

// OCR 函数
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
  
  console.log('[OCR] Using credentials:', {
    accessKeyId: accessKeyId.substring(0, 10) + '...',
    hasSecret: !!accessKeySecret
  });
  
  // 临时：使用模拟数据，因为本地网络无法访问阿里云 API
  console.log('[OCR] 使用模拟数据（本地网络无法访问阿里云 API）');
  return Promise.resolve({
    success: true,
    text: 'A B C D A B C D A B C D A B C D A B C D A B C D A B C D A B C D A B C D A B C D A B C D A B C D A B C D A B C D A B C D',
    confidence: 0.95
  });
  
  /* 真实的 OCR 调用代码（网络可用时使用）
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
    console.log('[OCR] Calling Alibaba Cloud OCR API...');
    
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
          console.log('[OCR] Response:', JSON.stringify(result, null, 2));
          
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
          console.error('[OCR] Parse error:', err);
          reject(err);
        }
      });
    });
    
    req.on('error', (err) => {
      console.error('[OCR] Request error:', err);
      reject(err);
    });
    
    req.on('timeout', () => {
      console.error('[OCR] Request timeout');
      req.destroy();
      reject(new Error('OCR API timeout'));
    });
    
    req.end();
  });
  */
}

// 模拟 AI 分析结果
function generateMockAnalysis(gradingResult) {
  return {
    surfaceIssues: ['选择题正确率偏低', '阅读理解失分较多', '完形填空需要加强'],
    rootCauses: [
      '词汇量不足，影响理解准确性',
      '语法基础薄弱，句子结构分析能力欠缺',
      '阅读速度慢，时间管理不当'
    ],
    aiComment: '从整体来看，你的英语基础还不错，但在词汇积累和语法应用方面还有提升空间。建议重点加强词汇记忆和语法练习，同时多做阅读理解题目提高阅读速度。',
    knowledgeGaps: ['词汇积累', '语法应用', '阅读理解', '完形填空技巧', '时间管理']
  };
}

// 模拟学习路径生成
function generateMockLearningPath(analysisResult) {
  return {
    stages: [
      {
        title: '第一阶段：词汇强化',
        content: '每天背诵50个核心词汇，重点记忆高频词和易错词。使用词根词缀法提高记忆效率。',
        duration: '2周'
      },
      {
        title: '第二阶段：语法巩固',
        content: '系统复习时态、语态、从句等核心语法点。每天完成10道语法选择题，总结错题规律。',
        duration: '2周'
      },
      {
        title: '第三阶段：阅读提升',
        content: '每天完成2篇阅读理解，训练快速定位关键信息的能力。学习长难句分析方法。',
        duration: '3周'
      },
      {
        title: '第四阶段：综合训练',
        content: '进行模拟考试，严格控制时间。分析错题，查漏补缺，形成完整的知识体系。',
        duration: '1周'
      }
    ]
  };
}

// 创建 HTTP 服务器
const server = http.createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // 读取请求体
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', async () => {
    try {
      // 路由处理
      if (req.url === '/api/ocr' && req.method === 'POST') {
        // OCR 识别
        const { imageBase64 } = JSON.parse(body);
        
        if (!imageBase64) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            error: 'Missing imageBase64 parameter',
          }));
          return;
        }
        
        console.log('[API] Received OCR request');
        const ocrResult = await callAliCloudOCR(imageBase64);
        
        console.log('[API] OCR success!');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          data: {
            rawText: ocrResult.text,
            confidence: ocrResult.confidence,
            answers: [],
            regions: []
          },
        }));
        
      } else if (req.url === '/api/analyze' && req.method === 'POST') {
        // AI 错误分析
        console.log('[API] Received analyze request');
        const gradingResult = JSON.parse(body);
        const analysisResult = generateMockAnalysis(gradingResult);
        
        console.log('[API] Analysis success!');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(analysisResult));
        
      } else if (req.url === '/api/generate-path' && req.method === 'POST') {
        // 生成学习路径
        console.log('[API] Received generate-path request');
        const analysisResult = JSON.parse(body);
        const learningPath = generateMockLearningPath(analysisResult);
        
        console.log('[API] Learning path generated!');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(learningPath));
        
      } else {
        // 404 Not Found
        console.log(`[API] 404 Not Found: ${req.method} ${req.url}`);
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: false, 
          error: 'Not found',
          path: req.url,
          method: req.method
        }));
      }
    } catch (error) {
      console.error('[API] Error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
      }));
    }
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`\n✓ 本地 API 服务器运行在 http://localhost:${PORT}`);
  console.log(`✓ 可用端点:`);
  console.log(`  - POST http://localhost:${PORT}/api/ocr`);
  console.log(`  - POST http://localhost:${PORT}/api/analyze`);
  console.log(`  - POST http://localhost:${PORT}/api/generate-path`);
  console.log(`\n环境变量状态:`);
  console.log(`  ALICLOUD_ACCESS_KEY_ID: ${process.env.ALICLOUD_ACCESS_KEY_ID ? '✓ 已设置' : '✗ 未设置'}`);
  console.log(`  ALICLOUD_ACCESS_KEY_SECRET: ${process.env.ALICLOUD_ACCESS_KEY_SECRET ? '✓ 已设置' : '✗ 未设置'}`);
  console.log(`\n按 Ctrl+C 停止服务器\n`);
});
