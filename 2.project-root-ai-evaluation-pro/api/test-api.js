/**
 * API 测试脚本
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// 测试数据
const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

const testGradeResult = {
  totalScore: 85,
  maxScore: 100,
  accuracy: 85,
  correctCount: 85,
  wrongCount: 15,
  wrongAnswers: [
    {
      questionId: '5',
      userAnswer: 'B',
      correctAnswer: 'A',
      knowledgePoints: ['虚拟语气', '时态'],
    },
    {
      questionId: '12',
      userAnswer: 'C',
      correctAnswer: 'D',
      knowledgePoints: ['被动语态'],
    },
  ],
  dimensionScores: [
    { dimension: '听力', score: 18, maxScore: 20 },
    { dimension: '语法', score: 22, maxScore: 25 },
    { dimension: '阅读', score: 25, maxScore: 30 },
    { dimension: '完形', score: 12, maxScore: 15 },
    { dimension: '逻辑', score: 8, maxScore: 10 },
  ],
};

const testErrorAnalysis = {
  surfaceIssues: ['计算粗心', '审题不清', '时间管理不当'],
  rootCauses: ['基础知识不牢固', '逻辑推理能力弱'],
  aiComment: '本次测评显示你在基础知识掌握方面表现优秀...',
  knowledgeGaps: [
    {
      knowledgePoint: '虚拟语气',
      difficulty: 4,
      mastered: false,
      detail: '需要加强虚拟语气的理解和应用',
    },
  ],
};

async function testAPI() {
  console.log('🧪 开始测试 API 端点...\n');

  try {
    // 1. 测试健康检查
    console.log('1️⃣ 测试健康检查...');
    const healthRes = await axios.get(`${BASE_URL}/health`);
    console.log('✅ 健康检查通过:', healthRes.data);
    console.log('');

    // 2. 测试 OCR API
    console.log('2️⃣ 测试 OCR API...');
    const ocrRes = await axios.post(`${BASE_URL}/api/ocr`, {
      imageBase64: testImageBase64,
      templateId: 'standard',
    });
    console.log('✅ OCR API 响应:', JSON.stringify(ocrRes.data, null, 2));
    console.log('');

    // 3. 测试 Analyze API
    console.log('3️⃣ 测试 Analyze API...');
    const analyzeRes = await axios.post(`${BASE_URL}/api/analyze`, {
      gradeResult: testGradeResult,
      language: 'zh',
    });
    console.log('✅ Analyze API 响应:', JSON.stringify(analyzeRes.data, null, 2));
    console.log('');

    // 4. 测试 Generate Path API
    console.log('4️⃣ 测试 Generate Path API...');
    const pathRes = await axios.post(`${BASE_URL}/api/generate-path`, {
      errorAnalysis: testErrorAnalysis,
      language: 'zh',
    });
    console.log('✅ Generate Path API 响应:', JSON.stringify(pathRes.data, null, 2));
    console.log('');

    // 5. 测试错误处理（缺少参数）
    console.log('5️⃣ 测试错误处理（缺少参数）...');
    try {
      await axios.post(`${BASE_URL}/api/ocr`, {});
    } catch (error) {
      if (error.response) {
        console.log('✅ 错误处理正常:', error.response.data);
      }
    }
    console.log('');

    // 6. 测试 CORS
    console.log('6️⃣ 测试 CORS...');
    const corsRes = await axios.post(`${BASE_URL}/api/ocr`, 
      { imageBase64: testImageBase64 },
      { headers: { 'Origin': 'http://localhost:19006' } }
    );
    console.log('✅ CORS 头部:', corsRes.headers['access-control-allow-origin']);
    console.log('');

    console.log('🎉 所有测试通过！');
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('响应数据:', error.response.data);
    }
  }
}

// 运行测试
testAPI();
