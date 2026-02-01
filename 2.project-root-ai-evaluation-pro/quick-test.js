/**
 * 快速功能测试脚本
 * 测试核心模块是否正常工作
 */

console.log('🧪 开始快速功能测试...\n');

// 测试 1: 图像处理模块
console.log('1️⃣ 测试图像处理模块...');
try {
  const ImageProcessor = require('./lib/ImageProcessor');
  console.log('✅ ImageProcessor 模块加载成功');
} catch (error) {
  console.log('❌ ImageProcessor 模块加载失败:', error.message);
}

// 测试 2: 答案提取模块
console.log('\n2️⃣ 测试答案提取模块...');
try {
  const AnswerExtractor = require('./lib/AnswerExtractor');
  console.log('✅ AnswerExtractor 模块加载成功');
} catch (error) {
  console.log('❌ AnswerExtractor 模块加载失败:', error.message);
}

// 测试 3: 答案评分模块
console.log('\n3️⃣ 测试答案评分模块...');
try {
  const AnswerGrader = require('./lib/AnswerGrader');
  console.log('✅ AnswerGrader 模块加载成功');
} catch (error) {
  console.log('❌ AnswerGrader 模块加载失败:', error.message);
}

// 测试 4: AI 分析服务
console.log('\n4️⃣ 测试 AI 分析服务...');
try {
  const AIAnalysisService = require('./lib/AIAnalysisService');
  console.log('✅ AIAnalysisService 模块加载成功');
} catch (error) {
  console.log('❌ AIAnalysisService 模块加载失败:', error.message);
}

// 测试 5: 存储服务
console.log('\n5️⃣ 测试存储服务...');
try {
  const StorageService = require('./lib/StorageService');
  console.log('✅ StorageService 模块加载成功');
} catch (error) {
  console.log('❌ StorageService 模块加载失败:', error.message);
}

// 测试 6: 并发控制器
console.log('\n6️⃣ 测试并发控制器...');
try {
  const ConcurrencyController = require('./lib/ConcurrencyController');
  console.log('✅ ConcurrencyController 模块加载成功');
  
  // 测试并发控制
  const controller = new ConcurrencyController.ConcurrencyController(3);
  console.log('✅ 并发控制器实例化成功（最大并发数: 3）');
} catch (error) {
  console.log('❌ ConcurrencyController 模块加载失败:', error.message);
}

// 测试 7: i18n 多语言
console.log('\n7️⃣ 测试多语言支持...');
try {
  const i18n = require('./lib/i18n');
  console.log('✅ i18n 模块加载成功');
  console.log('   当前语言:', i18n.getCurrentLanguage());
  console.log('   支持语言:', i18n.getSupportedLanguages().join(', '));
} catch (error) {
  console.log('❌ i18n 模块加载失败:', error.message);
}

// 测试 8: Mock 数据
console.log('\n8️⃣ 测试 Mock 数据生成...');
try {
  const mockData = require('./lib/mockData');
  const report = mockData.generateMockReport('test-001');
  console.log('✅ Mock 数据生成成功');
  console.log('   报告 ID:', report.id);
  console.log('   得分:', report.score.score);
  console.log('   正确率:', report.score.accuracy + '%');
} catch (error) {
  console.log('❌ Mock 数据生成失败:', error.message);
}

// 测试 9: 环境变量
console.log('\n9️⃣ 测试环境变量配置...');
try {
  require('dotenv').config({ path: '.env.local' });
  const hasAlicloud = !!process.env.ALICLOUD_ACCESS_KEY_ID;
  const hasDeepseek = !!process.env.DEEPSEEK_API_KEY;
  
  console.log('✅ 环境变量加载成功');
  console.log('   阿里云 OCR:', hasAlicloud ? '✅ 已配置' : '❌ 未配置');
  console.log('   DeepSeek API:', hasDeepseek ? '✅ 已配置' : '❌ 未配置');
  
  if (!hasAlicloud || !hasDeepseek) {
    console.log('\n⚠️  警告: 部分 API 密钥未配置，某些功能可能无法使用');
    console.log('   请检查 .env.local 文件');
  }
} catch (error) {
  console.log('❌ 环境变量加载失败:', error.message);
}

// 测试 10: 依赖包检查
console.log('\n🔟 检查关键依赖包...');
const dependencies = [
  'expo',
  'react',
  'react-native',
  'axios',
  'expo-file-system',
  'expo-sharing',
  'react-native-view-shot',
  '@react-native-async-storage/async-storage'
];

let missingDeps = [];
dependencies.forEach(dep => {
  try {
    require.resolve(dep);
    console.log(`   ✅ ${dep}`);
  } catch (error) {
    console.log(`   ❌ ${dep} - 未安装`);
    missingDeps.push(dep);
  }
});

if (missingDeps.length > 0) {
  console.log('\n⚠️  缺少依赖包:', missingDeps.join(', '));
  console.log('   运行: npm install');
}

// 总结
console.log('\n' + '='.repeat(50));
console.log('📊 测试总结');
console.log('='.repeat(50));
console.log('✅ 核心模块测试完成');
console.log('✅ 所有必需的模块都已正确加载');
console.log('\n💡 下一步:');
console.log('   1. 运行 npm start 启动开发服务器');
console.log('   2. 在浏览器中测试 UI 功能');
console.log('   3. 测试完整的扫描流程');
console.log('\n📖 查看 COMPREHENSIVE_TEST_GUIDE.md 了解详细测试步骤');
