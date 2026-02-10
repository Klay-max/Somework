/**
 * 真实 API 测试脚本 v1.1.0
 * 
 * 测试阿里云 OCR（杭州端点）和 DeepSeek AI
 */

const https = require('https');
const fs = require('fs');

// 测试配置
const HANGZHOU_ENDPOINT = 'ocr-api.cn-hangzhou.aliyuncs.com';
const API_BASE_URL = 'https://somegood.vercel.app/api';

console.log('='.repeat(60));
console.log('真实 API 测试 v1.1.0');
console.log('='.repeat(60));
console.log('');

// 测试 1: 阿里云 OCR 杭州端点连接
async function testHangzhouEndpoint() {
  console.log('📡 测试 1: 阿里云 OCR 杭州端点连接');
  console.log('-'.repeat(60));
  
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const req = https.request({
      hostname: HANGZHOU_ENDPOINT,
      port: 443,
      path: '/',
      method: 'GET',
      timeout: 5000,
    }, (res) => {
      const duration = Date.now() - startTime;
      console.log(`✅ 连接成功`);
      console.log(`   端点: ${HANGZHOU_ENDPOINT}`);
      console.log(`   状态码: ${res.statusCode}`);
      console.log(`   响应时间: ${duration}ms`);
      resolve({ success: true, duration });
    });

    req.on('error', (err) => {
      console.log(`❌ 连接失败`);
      console.log(`   错误: ${err.message}`);
      resolve({ success: false, error: err.message });
    });

    req.on('timeout', () => {
      req.destroy();
      console.log(`❌ 连接超时`);
      resolve({ success: false, error: 'timeout' });
    });

    req.end();
  });
}

// 测试 2: OCR API 端点
async function testOCRApi() {
  console.log('\n📡 测试 2: OCR API 端点');
  console.log('-'.repeat(60));
  
  // 创建一个简单的测试图片 Base64
  const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  
  const postData = JSON.stringify({
    imageBase64: testImageBase64
  });
  
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const req = https.request(`${API_BASE_URL}/ocr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 30000,
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const duration = Date.now() - startTime;
        
        try {
          const result = JSON.parse(data);
          
          if (result.success || result.data) {
            console.log(`✅ OCR API 正常`);
            console.log(`   响应时间: ${duration}ms`);
            console.log(`   置信度: ${result.data?.confidence || 'N/A'}`);
            if (result.warning) {
              console.log(`   ⚠️  警告: ${result.warning}`);
            }
            resolve({ success: true, duration, result });
          } else {
            console.log(`❌ OCR API 返回错误`);
            console.log(`   错误: ${result.error || '未知错误'}`);
            resolve({ success: false, error: result.error });
          }
        } catch (err) {
          console.log(`❌ 解析响应失败`);
          console.log(`   错误: ${err.message}`);
          console.log(`   原始响应: ${data.substring(0, 200)}`);
          resolve({ success: false, error: err.message });
        }
      });
    });
    
    req.on('error', (err) => {
      console.log(`❌ 请求失败`);
      console.log(`   错误: ${err.message}`);
      resolve({ success: false, error: err.message });
    });
    
    req.on('timeout', () => {
      req.destroy();
      console.log(`❌ 请求超时`);
      resolve({ success: false, error: 'timeout' });
    });
    
    req.write(postData);
    req.end();
  });
}

// 测试 3: AI 分析 API
async function testAnalyzeApi() {
  console.log('\n📡 测试 3: AI 分析 API');
  console.log('-'.repeat(60));
  
  const postData = JSON.stringify({
    wrongAnswers: [
      { questionNumber: 1, studentAnswer: 'B', correctAnswer: 'A' },
      { questionNumber: 5, studentAnswer: 'C', correctAnswer: 'D' }
    ]
  });
  
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const req = https.request(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 30000,
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const duration = Date.now() - startTime;
        
        try {
          const result = JSON.parse(data);
          
          if (result.success && result.data) {
            console.log(`✅ AI 分析 API 正常`);
            console.log(`   响应时间: ${duration}ms`);
            console.log(`   表面问题数: ${result.data.surfaceIssues?.length || 0}`);
            console.log(`   根本原因数: ${result.data.rootCauses?.length || 0}`);
            resolve({ success: true, duration, result });
          } else {
            console.log(`❌ AI 分析 API 返回错误`);
            console.log(`   错误: ${result.error || '未知错误'}`);
            resolve({ success: false, error: result.error });
          }
        } catch (err) {
          console.log(`❌ 解析响应失败`);
          console.log(`   错误: ${err.message}`);
          resolve({ success: false, error: err.message });
        }
      });
    });
    
    req.on('error', (err) => {
      console.log(`❌ 请求失败`);
      console.log(`   错误: ${err.message}`);
      resolve({ success: false, error: err.message });
    });
    
    req.on('timeout', () => {
      req.destroy();
      console.log(`❌ 请求超时`);
      resolve({ success: false, error: 'timeout' });
    });
    
    req.write(postData);
    req.end();
  });
}

// 主测试流程
async function runTests() {
  const results = {
    hangzhou: null,
    ocr: null,
    analyze: null,
  };
  
  // 测试 1
  results.hangzhou = await testHangzhouEndpoint();
  
  // 测试 2
  results.ocr = await testOCRApi();
  
  // 测试 3
  results.analyze = await testAnalyzeApi();
  
  // 总结
  console.log('\n' + '='.repeat(60));
  console.log('测试总结');
  console.log('='.repeat(60));
  
  const allPassed = results.hangzhou.success && 
                    results.ocr.success && 
                    results.analyze.success;
  
  if (allPassed) {
    console.log('✅ 所有测试通过！真实 API 已就绪');
    console.log('');
    console.log('📊 性能指标:');
    console.log(`   杭州端点响应: ${results.hangzhou.duration}ms`);
    console.log(`   OCR API 响应: ${results.ocr.duration}ms`);
    console.log(`   AI 分析响应: ${results.analyze.duration}ms`);
    console.log('');
    console.log('✨ 可以发布 OTA 更新了！');
  } else {
    console.log('❌ 部分测试失败');
    console.log('');
    console.log('失败项:');
    if (!results.hangzhou.success) console.log('   - 杭州端点连接');
    if (!results.ocr.success) console.log('   - OCR API');
    if (!results.analyze.success) console.log('   - AI 分析 API');
    console.log('');
    console.log('⚠️  建议检查网络连接和环境变量配置');
  }
  
  console.log('='.repeat(60));
}

// 运行测试
runTests().catch(err => {
  console.error('测试执行失败:', err);
  process.exit(1);
});
