/**
 * 性能和缓存测试脚本
 * 
 * 测试内容：
 * - 缓存功能
 * - 超时控制
 * - 性能监控
 * 
 * 使用方法：
 * 1. 启动测试服务器: node api/test-server.js
 * 2. 运行测试: node api/test-performance.js
 */

const axios = require('axios');

// 模拟评分结果
const mockGradeResult = {
  totalScore: 75,
  maxScore: 100,
  accuracy: 75,
  correctCount: 15,
  wrongCount: 5,
  wrongAnswers: [
    {
      questionId: '3',
      userAnswer: 'B',
      correctAnswer: 'C',
      knowledgePoints: ['虚拟语气', '条件句'],
    },
  ],
  dimensionScores: [
    { dimension: '听力', score: 18, maxScore: 20 },
    { dimension: '语法', score: 12, maxScore: 20 },
  ],
};

// 测试图像 Base64（1x1 透明 PNG）
const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

// 测试缓存功能
async function testCache() {
  console.log('🗄️  测试缓存功能...\n');
  
  try {
    console.log('1️⃣ 第一次 OCR 请求（应该调用 API）...');
    const start1 = Date.now();
    
    const response1 = await axios.post('http://localhost:3000/api/ocr', {
      imageBase64: testImageBase64,
    });
    
    const duration1 = Date.now() - start1;
    console.log(`   ✅ 完成，耗时: ${duration1}ms`);
    console.log(`   📊 置信度: ${response1.data.data.confidence}`);
    
    console.log('\n2️⃣ 第二次 OCR 请求（应该使用缓存）...');
    const start2 = Date.now();
    
    const response2 = await axios.post('http://localhost:3000/api/ocr', {
      imageBase64: testImageBase64,
    });
    
    const duration2 = Date.now() - start2;
    console.log(`   ✅ 完成，耗时: ${duration2}ms`);
    console.log(`   📊 置信度: ${response2.data.data.confidence}`);
    
    // 比较性能
    const speedup = Math.round((duration1 / duration2) * 100) / 100;
    console.log(`\n📈 缓存性能提升: ${speedup}x 倍`);
    
    if (duration2 < duration1 / 2) {
      console.log('✅ 缓存工作正常！');
    } else {
      console.log('⚠️  缓存可能未生效');
    }
    
  } catch (error) {
    console.error('❌ 缓存测试失败:', error.message);
  }
}

// 测试 AI 分析缓存
async function testAnalysisCache() {
  console.log('\n🧠 测试 AI 分析缓存...\n');
  
  try {
    console.log('1️⃣ 第一次分析请求（应该调用 API）...');
    const start1 = Date.now();
    
    const response1 = await axios.post('http://localhost:3000/api/analyze', {
      gradeResult: mockGradeResult,
    });
    
    const duration1 = Date.now() - start1;
    console.log(`   ✅ 完成，耗时: ${duration1}ms`);
    console.log(`   📊 表层问题数量: ${response1.data.data.surfaceIssues.length}`);
    
    console.log('\n2️⃣ 第二次分析请求（应该使用缓存）...');
    const start2 = Date.now();
    
    const response2 = await axios.post('http://localhost:3000/api/analyze', {
      gradeResult: mockGradeResult,
    });
    
    const duration2 = Date.now() - start2;
    console.log(`   ✅ 完成，耗时: ${duration2}ms`);
    console.log(`   📊 表层问题数量: ${response2.data.data.surfaceIssues.length}`);
    
    // 比较性能
    const speedup = Math.round((duration1 / duration2) * 100) / 100;
    console.log(`\n📈 缓存性能提升: ${speedup}x 倍`);
    
    if (duration2 < duration1 / 2) {
      console.log('✅ AI 分析缓存工作正常！');
    } else {
      console.log('⚠️  AI 分析缓存可能未生效');
    }
    
  } catch (error) {
    console.error('❌ AI 分析缓存测试失败:', error.message);
  }
}

// 测试缓存统计
async function testCacheStats() {
  console.log('\n📊 测试缓存统计...\n');
  
  try {
    const response = await axios.get('http://localhost:3000/api/cache-stats');
    
    console.log('缓存统计信息:');
    console.log('─────────────────────────────────────');
    
    const stats = response.data.data;
    console.log(`总条目数: ${stats.totalEntries}`);
    console.log(`命中次数: ${stats.hitCount}`);
    console.log(`未命中次数: ${stats.missCount}`);
    console.log(`命中率: ${stats.hitRate}%`);
    console.log(`内存使用: ${Math.round(stats.memoryUsage / 1024)} KB`);
    
    console.log('\n─────────────────────────────────────');
    
    // 获取详细调试信息
    console.log('\n🔍 获取详细缓存信息...');
    const debugResponse = await axios.get('http://localhost:3000/api/cache-stats?debug=true');
    
    const debugInfo = debugResponse.data.data;
    console.log(`\n缓存条目详情 (前 5 个):`);
    
    debugInfo.entries.slice(0, 5).forEach((entry, i) => {
      console.log(`${i + 1}. ${entry.key.substring(0, 50)}...`);
      console.log(`   访问次数: ${entry.accessCount}`);
      console.log(`   创建时间: ${entry.createdAt}`);
      console.log(`   是否过期: ${entry.isExpired ? '是' : '否'}`);
    });
    
  } catch (error) {
    console.error('❌ 缓存统计测试失败:', error.message);
  }
}

// 测试并发请求
async function testConcurrency() {
  console.log('\n🚀 测试并发请求...\n');
  
  try {
    console.log('发送 5 个并发 OCR 请求...');
    const start = Date.now();
    
    const promises = Array(5).fill().map((_, i) => 
      axios.post('http://localhost:3000/api/ocr', {
        imageBase64: testImageBase64 + i, // 稍微不同的图像
      }).catch(error => ({ error: error.message }))
    );
    
    const results = await Promise.all(promises);
    const duration = Date.now() - start;
    
    console.log(`✅ 并发请求完成，总耗时: ${duration}ms`);
    
    const successCount = results.filter(r => !r.error).length;
    const errorCount = results.filter(r => r.error).length;
    
    console.log(`成功: ${successCount}, 失败: ${errorCount}`);
    
    if (errorCount > 0) {
      console.log('\n错误详情:');
      results.forEach((result, i) => {
        if (result.error) {
          console.log(`  请求 ${i + 1}: ${result.error}`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ 并发测试失败:', error.message);
  }
}

// 测试频率限制
async function testRateLimit() {
  console.log('\n⏱️  测试频率限制...\n');
  
  try {
    console.log('快速发送 15 个请求（超过限制）...');
    
    const promises = [];
    for (let i = 0; i < 15; i++) {
      promises.push(
        axios.post('http://localhost:3000/api/ocr', {
          imageBase64: testImageBase64,
        }).catch(error => ({
          error: error.response?.status === 429 ? 'RATE_LIMITED' : error.message,
          status: error.response?.status,
        }))
      );
    }
    
    const results = await Promise.all(promises);
    
    const successCount = results.filter(r => !r.error).length;
    const rateLimitedCount = results.filter(r => r.error === 'RATE_LIMITED').length;
    const otherErrorCount = results.filter(r => r.error && r.error !== 'RATE_LIMITED').length;
    
    console.log(`成功: ${successCount}`);
    console.log(`频率限制: ${rateLimitedCount}`);
    console.log(`其他错误: ${otherErrorCount}`);
    
    if (rateLimitedCount > 0) {
      console.log('✅ 频率限制工作正常！');
    } else {
      console.log('⚠️  频率限制可能未生效');
    }
    
  } catch (error) {
    console.error('❌ 频率限制测试失败:', error.message);
  }
}

// 运行所有测试
async function runAllTests() {
  console.log('═══════════════════════════════════════');
  console.log('   性能和缓存功能测试');
  console.log('═══════════════════════════════════════\n');
  
  try {
    await testCache();
    await testAnalysisCache();
    await testCacheStats();
    await testConcurrency();
    await testRateLimit();
    
    console.log('\n✨ 所有测试完成！');
    
  } catch (error) {
    console.error('\n💥 测试失败:', error.message);
    process.exit(1);
  }
}

runAllTests();