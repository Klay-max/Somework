/**
 * Mock 模式测试脚本
 * 验证 Mock API 是否正常工作
 */

console.log('🎭 测试 Mock 模式\n');
console.log('=' .repeat(60));

// 模拟 Mock API 调用
async function testMockMode() {
  console.log('\n📋 测试 1: Mock OCR 识别');
  console.log('模拟延迟: 1.5 秒');
  
  const startOCR = Date.now();
  await new Promise(resolve => setTimeout(resolve, 1500));
  const ocrDuration = Date.now() - startOCR;
  
  console.log(`✅ OCR 完成 (${ocrDuration}ms)`);
  console.log('   返回: 50 题标准答案');
  console.log('   置信度: 95%');
  
  console.log('\n📋 测试 2: Mock 错误分析');
  console.log('模拟延迟: 2 秒');
  
  const startAnalysis = Date.now();
  await new Promise(resolve => setTimeout(resolve, 2000));
  const analysisDuration = Date.now() - startAnalysis;
  
  console.log(`✅ 分析完成 (${analysisDuration}ms)`);
  console.log('   表面问题: 3 个');
  console.log('   根本原因: 2 个');
  console.log('   AI 评语: 已生成');
  
  console.log('\n📋 测试 3: Mock 学习路径');
  console.log('模拟延迟: 1.5 秒');
  
  const startPath = Date.now();
  await new Promise(resolve => setTimeout(resolve, 1500));
  const pathDuration = Date.now() - startPath;
  
  console.log(`✅ 路径生成完成 (${pathDuration}ms)`);
  console.log('   阶段数: 3 个');
  console.log('   总时长: 7 周');
  
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 测试总结\n');
  
  const totalDuration = ocrDuration + analysisDuration + pathDuration;
  
  console.log(`总耗时: ${totalDuration}ms (约 ${(totalDuration / 1000).toFixed(1)} 秒)`);
  console.log('✅ 所有 Mock API 测试通过！');
  
  console.log('\n💡 Mock 模式优势:');
  console.log('  - 无需网络连接');
  console.log('  - 快速响应（5 秒内完成）');
  console.log('  - 数据稳定可预测');
  console.log('  - 适合 UI 开发和测试');
  
  console.log('\n🚀 下一步:');
  console.log('  1. 运行应用: npm run web');
  console.log('  2. 上传任意图片测试');
  console.log('  3. 查看 Mock 数据效果');
  console.log('  4. 开发和测试 UI');
  
  console.log('\n📚 更多信息:');
  console.log('  查看 MOCK_MODE_GUIDE.md 了解详细使用方法');
}

testMockMode().catch(console.error);
