/**
 * 本地 API 测试服务器
 * 直接运行 API 函数，不依赖 Vercel CLI
 */

const http = require('http');
const crypto = require('crypto');
const https = require('https');

// 从 .env.local 加载环境变量
require('dotenv').config({ path: '.env.local' });

// DeepSeek API 调用
async function callDeepSeekAPI(prompt, systemPrompt = '') {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  
  if (!apiKey) {
    throw new Error('Missing DeepSeek API key');
  }
  
  console.log('[DeepSeek] Calling API...');
  
  const requestBody = JSON.stringify({
    model: 'deepseek-chat',
    messages: [
      ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 2000
  });
  
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.deepseek.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(requestBody)
      },
      timeout: 30000,
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('[DeepSeek] Response status:', res.statusCode);
          
          if (res.statusCode !== 200) {
            console.error('[DeepSeek] Error:', result);
            reject(new Error(`DeepSeek API Error: ${result.error?.message || 'Unknown error'}`));
          } else {
            const content = result.choices?.[0]?.message?.content || '';
            console.log('[DeepSeek] Response received, length:', content.length);
            resolve(content);
          }
        } catch (err) {
          console.error('[DeepSeek] Parse error:', err);
          reject(err);
        }
      });
    });
    
    req.on('error', (err) => {
      console.error('[DeepSeek] Request error:', err);
      reject(err);
    });
    
    req.on('timeout', () => {
      console.error('[DeepSeek] Request timeout');
      req.destroy();
      reject(new Error('DeepSeek API timeout'));
    });
    
    req.write(requestBody);
    req.end();
  });
}

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
  
  // 移除 data:image/jpeg;base64, 前缀
  const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
  
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
    body: base64Data,
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
      timeout: 30000,
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('[OCR] Response status:', res.statusCode);
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
}

// AI 错误分析（使用 DeepSeek）
async function generateAIAnalysis(gradingResult) {
  try {
    const wrongAnswers = gradingResult.wrongAnswers || [];
    const errorCount = wrongAnswers.length;
    
    const prompt = `作为一名资深教育专家，请分析以下学生的答题情况：

错题数量：${errorCount}
错题详情：
${wrongAnswers.map((wa, i) => `${i + 1}. 题号 ${wa.questionNumber || wa.questionId}: 学生答案 ${wa.userAnswer}, 正确答案 ${wa.correctAnswer}`).join('\n')}

请提供以下分析（用 JSON 格式返回）：
1. surfaceIssues: 表面问题列表（3-5个字符串）
2. rootCauses: 根本原因列表（2-4个字符串）
3. aiComment: AI 综合评价（100-200字）
4. knowledgeGaps: 知识薄弱点列表（3-6个字符串）

返回格式示例：
{
  "surfaceIssues": ["选择题正确率偏低", "阅读理解失分较多"],
  "rootCauses": ["词汇量不足", "语法基础薄弱"],
  "aiComment": "从整体来看...",
  "knowledgeGaps": ["词汇积累", "语法应用"]
}`;

    const systemPrompt = '你是一名专业的教育分析专家，擅长分析学生的学习问题并提供针对性建议。请用中文回答，并严格按照 JSON 格式返回结果。';
    
    const response = await callDeepSeekAPI(prompt, systemPrompt);
    
    // 尝试解析 JSON
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      return analysis;
    }
    
    // 如果无法解析，返回默认结果
    throw new Error('Failed to parse DeepSeek response');
  } catch (error) {
    console.error('[Analysis] DeepSeek error:', error.message);
    // 降级到模拟数据
    return generateMockAnalysis(gradingResult);
  }
}

// 模拟 AI 分析结果（降级方案）
function generateMockAnalysis(gradingResult) {
  const errorCount = (gradingResult.wrongAnswers || []).length;
  
  if (errorCount <= 5) {
    return {
      surfaceIssues: ['个别题目粗心', '时间分配不均'],
      rootCauses: ['基础扎实，偶有疏忽'],
      aiComment: '整体表现优秀！只有少量错题，主要是粗心导致。建议做题时更加细心，注意审题。',
      knowledgeGaps: ['审题技巧', '时间管理']
    };
  } else if (errorCount <= 15) {
    return {
      surfaceIssues: ['部分知识点掌握不牢', '解题思路不够清晰', '时间管理需要改进'],
      rootCauses: ['基础知识有漏洞', '缺乏系统训练'],
      aiComment: '你的基础还不错，但在某些知识点上需要加强。建议针对错题涉及的知识点进行专项训练，并多做类似题目巩固。',
      knowledgeGaps: ['虚拟语气', '被动语态', '定语从句', '完形填空技巧']
    };
  } else {
    return {
      surfaceIssues: ['多个知识点掌握不足', '解题方法欠缺', '基础概念模糊'],
      rootCauses: ['基础知识薄弱', '缺乏系统学习', '练习量不足'],
      aiComment: '需要系统性地复习基础知识。建议从基础概念开始，逐步建立知识体系，并通过大量练习巩固。不要急于求成，打好基础最重要。',
      knowledgeGaps: ['基础语法', '词汇量', '阅读理解', '长难句分析', '写作技巧', '听力训练']
    };
  }
}

// 生成学习路径（使用 DeepSeek）
async function generateAILearningPath(analysisResult) {
  try {
    const rootCauses = analysisResult.rootCauses || [];
    const knowledgeGaps = analysisResult.knowledgeGaps || [];
    
    const prompt = `作为一名资深教育规划专家，请根据以下学生的学习问题，制定个性化学习路径：

根本原因：
${rootCauses.map((cause, i) => `${i + 1}. ${cause}`).join('\n')}

知识薄弱点：
${knowledgeGaps.map((gap, i) => `${i + 1}. ${gap}`).join('\n')}

请制定 3-4 个学习阶段，每个阶段包括：
1. title: 阶段标题（简洁明了）
2. content: 学习内容（字符串，100-150字）
3. duration: 预计时长（如"2周"）

返回 JSON 格式：
{
  "stages": [
    {
      "title": "第一阶段：基础修复",
      "content": "详细的学习内容描述...",
      "duration": "2周"
    }
  ]
}`;

    const systemPrompt = '你是一名专业的教育规划专家，擅长制定个性化学习计划。请用中文回答，并严格按照 JSON 格式返回结果。';
    
    const response = await callDeepSeekAPI(prompt, systemPrompt);
    
    // 尝试解析 JSON
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const learningPath = JSON.parse(jsonMatch[0]);
      return learningPath;
    }
    
    // 如果无法解析，返回默认结果
    throw new Error('Failed to parse DeepSeek response');
  } catch (error) {
    console.error('[LearningPath] DeepSeek error:', error.message);
    // 降级到模拟数据
    return generateMockLearningPath(analysisResult);
  }
}

// 模拟学习路径生成（降级方案）
function generateMockLearningPath(analysisResult) {
  const weakPoints = analysisResult.knowledgeGaps || analysisResult.rootCauses || [];
  
  return {
    stages: [
      {
        title: '第一阶段：基础修复',
        content: `复习 ${weakPoints[0] || '基础知识'} 的核心概念，完成 20 道基础练习题。学习 ${weakPoints[1] || '重点内容'} 的应用方法，完成 15 道专项练习题。`,
        duration: '2周'
      },
      {
        title: '第二阶段：强化训练',
        content: '综合题目训练（每天 10 题），完成 5 套模拟测试。错题整理和分析，专项突破薄弱环节。',
        duration: '3周'
      },
      {
        title: '第三阶段：冲刺提升',
        content: '难点专项突破，完成 10 套真题模拟。时间管理和答题技巧训练，查漏补缺，全面复习。',
        duration: '2周'
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
        
        try {
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
        } catch (error) {
          console.error('[API] OCR failed, using fallback:', error.message);
          
          // 降级：返回模拟 OCR 结果
          const mockText = 'A B C D A B C D A B C D A B C D A B C D A B C D A B C D A B C D A B C D A B C D A B C D A B C D A B C D A B C D A B C D';
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            data: {
              rawText: mockText,
              confidence: 0.85,
              answers: [],
              regions: []
            },
            warning: 'OCR service unavailable, using fallback data'
          }));
        }
        
      } else if (req.url === '/api/analyze' && req.method === 'POST') {
        // AI 错误分析
        console.log('[API] Received analyze request');
        const gradingResult = JSON.parse(body);
        const analysisResult = await generateAIAnalysis(gradingResult);
        
        console.log('[API] Analysis success!');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(analysisResult));
        
      } else if (req.url === '/api/generate-path' && req.method === 'POST') {
        // 生成学习路径
        console.log('[API] Received generate-path request');
        const analysisResult = JSON.parse(body);
        const learningPath = await generateAILearningPath(analysisResult);
        
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
