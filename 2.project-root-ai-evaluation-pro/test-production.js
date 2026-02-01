/**
 * 生产环境测试脚本
 * 测试部署到 Vercel 的应用
 */

const https = require('https');

const PRODUCTION_URL = 'https://somegood.vercel.app';

// 测试函数
async function testEndpoint(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, PRODUCTION_URL);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    };

    if (data) {
      const body = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(body);
    }

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          const result = {
            status: res.statusCode,
            headers: res.headers,
            body: responseData,
          };
          resolve(result);
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// 主测试流程
async function runTests() {
  console.log('🚀 开始测试生产环境...\n');
  console.log(`📍 URL: ${PRODUCTION_URL}\n`);

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // 测试 1: 首页加载
  console.log('1️⃣ 测试首页加载...');
  try {
    const response = await testEndpoint('/');
    if (response.status === 200) {
      console.log('   ✅ 首页加载成功');
      results.passed++;
      results.tests.push({ name: '首页加载', status: 'passed' });
    } else {
      console.log(`   ❌ 首页加载失败: ${response.status}`);
      results.failed++;
      results.tests.push({ name: '首页加载', status: 'failed', error: `Status ${response.status}` });
    }
  } catch (error) {
    console.log(`   ❌ 首页加载错误: ${error.message}`);
    results.failed++;
    results.tests.push({ name: '首页加载', status: 'failed', error: error.message });
  }

  // 测试 2: API OCR 端点
  console.log('\n2️⃣ 测试 OCR API 端点...');
  try {
    const testImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRg=='; // 最小的 JPEG
    const response = await testEndpoint('/api/ocr', 'POST', { imageBase64: testImage });
    if (response.status === 200 || response.status === 400) {
      console.log('   ✅ OCR API 端点可访问');
      results.passed++;
      results.tests.push({ name: 'OCR API', status: 'passed' });
    } else {
      console.log(`   ❌ OCR API 失败: ${response.status}`);
      results.failed++;
      results.tests.push({ name: 'OCR API', status: 'failed', error: `Status ${response.status}` });
    }
  } catch (error) {
    console.log(`   ❌ OCR API 错误: ${error.message}`);
    results.failed++;
    results.tests.push({ name: 'OCR API', status: 'failed', error: error.message });
  }

  // 测试 3: API Analyze 端点
  console.log('\n3️⃣ 测试 Analyze API 端点...');
  try {
    const testData = {
      wrongAnswers: [
        { questionNumber: 1, userAnswer: 'A', correctAnswer: 'B' }
      ]
    };
    const response = await testEndpoint('/api/analyze', 'POST', testData);
    if (response.status === 200) {
      console.log('   ✅ Analyze API 端点正常');
      results.passed++;
      results.tests.push({ name: 'Analyze API', status: 'passed' });
    } else {
      console.log(`   ❌ Analyze API 失败: ${response.status}`);
      results.failed++;
      results.tests.push({ name: 'Analyze API', status: 'failed', error: `Status ${response.status}` });
    }
  } catch (error) {
    console.log(`   ❌ Analyze API 错误: ${error.message}`);
    results.failed++;
    results.tests.push({ name: 'Analyze API', status: 'failed', error: error.message });
  }

  // 测试 4: API Generate Path 端点
  console.log('\n4️⃣ 测试 Generate Path API 端点...');
  try {
    const testData = {
      rootCauses: ['基础知识薄弱'],
      knowledgeGaps: ['语法', '词汇']
    };
    const response = await testEndpoint('/api/generate-path', 'POST', testData);
    if (response.status === 200) {
      console.log('   ✅ Generate Path API 端点正常');
      results.passed++;
      results.tests.push({ name: 'Generate Path API', status: 'passed' });
    } else {
      console.log(`   ❌ Generate Path API 失败: ${response.status}`);
      results.failed++;
      results.tests.push({ name: 'Generate Path API', status: 'failed', error: `Status ${response.status}` });
    }
  } catch (error) {
    console.log(`   ❌ Generate Path API 错误: ${error.message}`);
    results.failed++;
    results.tests.push({ name: 'Generate Path API', status: 'failed', error: error.message });
  }

  // 输出总结
  console.log('\n' + '='.repeat(50));
  console.log('📊 测试总结');
  console.log('='.repeat(50));
  console.log(`✅ 通过: ${results.passed}`);
  console.log(`❌ 失败: ${results.failed}`);
  console.log(`📈 成功率: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
  console.log('='.repeat(50));

  if (results.failed === 0) {
    console.log('\n🎉 所有测试通过！生产环境运行正常！');
  } else {
    console.log('\n⚠️ 部分测试失败，请检查详细信息。');
  }

  console.log('\n📝 详细结果:');
  results.tests.forEach((test, index) => {
    const icon = test.status === 'passed' ? '✅' : '❌';
    console.log(`${index + 1}. ${icon} ${test.name}`);
    if (test.error) {
      console.log(`   错误: ${test.error}`);
    }
  });

  console.log('\n🔗 访问应用: ' + PRODUCTION_URL);
  console.log('🔍 检查面板: https://vercel.com/klays-projects-3394eafa/somegood\n');
}

// 运行测试
runTests().catch(error => {
  console.error('测试运行失败:', error);
  process.exit(1);
});
