/**
 * 测试真实的阿里云 OCR 和 DeepSeek API
 */

const http = require('http');
const fs = require('fs');

console.log('='.repeat(60));
console.log('测试真实 API 调用');
console.log('='.repeat(60));
console.log('');

// 测试 1: OCR API（使用真实图片）
async function testOCR() {
  console.log('【测试 1】阿里云 OCR API');
  console.log('-'.repeat(60));
  
  // 创建一个简单的测试图片 base64（1x1 白色像素）
  const testImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
  
  const requestData = JSON.stringify({
    imageBase64: testImage
  });
  
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/ocr',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestData)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('✓ OCR 请求成功');
          console.log('  状态码:', res.statusCode);
          console.log('  响应:', JSON.stringify(result, null, 2));
          console.log('');
          resolve(result);
        } catch (err) {
          console.error('✗ 解析响应失败:', err.message);
          reject(err);
        }
      });
    });
    
    req.on('error', (err) => {
      console.error('✗ 请求失败:', err.message);
      reject(err);
    });
    
    req.write(requestData);
    req.end();
  });
}

// 测试 2: 分析 API（使用 DeepSeek）
async function testAnalyze() {
  console.log('【测试 2】DeepSeek 错误分析 API');
  console.log('-'.repeat(60));
  
  const requestData = JSON.stringify({
    wrongAnswers: [
      { questionNumber: 1, userAnswer: 'A', correctAnswer: 'B' },
      { questionNumber: 5, userAnswer: 'C', correctAnswer: 'D' },
      { questionNumber: 12, userAnswer: 'B', correctAnswer: 'A' }
    ]
  });
  
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/analyze',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestData)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('✓ 分析请求成功');
          console.log('  状态码:', res.statusCode);
          console.log('  表面问题:', result.surfaceIssues);
          console.log('  根本原因:', result.rootCauses);
          console.log('  AI 评价:', result.aiComment);
          console.log('  知识薄弱点:', result.knowledgeGaps);
          console.log('');
          resolve(result);
        } catch (err) {
          console.error('✗ 解析响应失败:', err.message);
          reject(err);
        }
      });
    });
    
    req.on('error', (err) => {
      console.error('✗ 请求失败:', err.message);
      reject(err);
    });
    
    req.write(requestData);
    req.end();
  });
}

// 测试 3: 学习路径 API（使用 DeepSeek）
async function testLearningPath() {
  console.log('【测试 3】DeepSeek 学习路径生成 API');
  console.log('-'.repeat(60));
  
  const requestData = JSON.stringify({
    rootCauses: ['词汇量不足', '语法基础薄弱'],
    knowledgeGaps: ['虚拟语气', '被动语态', '定语从句']
  });
  
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/generate-path',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestData)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('✓ 学习路径请求成功');
          console.log('  状态码:', res.statusCode);
          console.log('  学习阶段数:', result.stages?.length || 0);
          result.stages?.forEach((stage, i) => {
            console.log(`  阶段 ${i + 1}: ${stage.title} (${stage.duration})`);
          });
          console.log('');
          resolve(result);
        } catch (err) {
          console.error('✗ 解析响应失败:', err.message);
          reject(err);
        }
      });
    });
    
    req.on('error', (err) => {
      console.error('✗ 请求失败:', err.message);
      reject(err);
    });
    
    req.write(requestData);
    req.end();
  });
}

// 运行所有测试
async function runTests() {
  try {
    await testOCR();
    await new Promise(resolve => setTimeout(resolve, 1000)); // 等待 1 秒
    
    await testAnalyze();
    await new Promise(resolve => setTimeout(resolve, 1000)); // 等待 1 秒
    
    await testLearningPath();
    
    console.log('='.repeat(60));
    console.log('✓ 所有测试完成！');
    console.log('='.repeat(60));
  } catch (error) {
    console.error('');
    console.error('='.repeat(60));
    console.error('✗ 测试失败:', error.message);
    console.error('='.repeat(60));
  }
}

runTests();
