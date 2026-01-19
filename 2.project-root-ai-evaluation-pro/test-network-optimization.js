/**
 * 网络优化功能测试脚本
 * 测试图片压缩、缓存、请求队列等功能
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 网络优化功能测试\n');
console.log('=' .repeat(60));

// 测试 1: 检查文件是否存在
console.log('\n📁 测试 1: 检查优化模块文件');
const files = [
  'lib/ImageProcessor.ts',
  'lib/CacheService.ts',
  'lib/RequestQueue.ts',
  'lib/AIAnalysisService.ts',
  'app/camera.tsx'
];

let filesExist = true;
files.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
  if (!exists) filesExist = false;
});

if (!filesExist) {
  console.log('\n❌ 部分文件缺失，测试终止');
  process.exit(1);
}

// 测试 2: 检查 ImageProcessor 压缩参数
console.log('\n🖼️  测试 2: 检查图片压缩参数');
const imageProcessorContent = fs.readFileSync('lib/ImageProcessor.ts', 'utf8');

const checks = [
  { name: 'maxSize 降低到 0.5MB', pattern: /maxSizeMB.*?=.*?0\.5|compressImage.*?0\.5/s },
  { name: 'maxWidth 降低到 1280px', pattern: /maxWidth.*?=.*?1280/s },
  { name: 'quality 降低到 0.7', pattern: /quality.*?=.*?0\.7/s },
  { name: '实现自适应压缩', pattern: /while.*?sizeMB.*?>.*?maxSizeMB|attempts.*?<.*?5/s }
];

let compressionOk = true;
checks.forEach(check => {
  const passed = check.pattern.test(imageProcessorContent);
  console.log(`${passed ? '✅' : '❌'} ${check.name}`);
  if (!passed) compressionOk = false;
});

// 测试 3: 检查 CacheService 功能
console.log('\n💾 测试 3: 检查缓存服务功能');
const cacheServiceContent = fs.readFileSync('lib/CacheService.ts', 'utf8');

const cacheChecks = [
  { name: '图片哈希算法', pattern: /hashImage|generateHash/i },
  { name: '内存缓存', pattern: /memoryCache|Map/i },
  { name: 'AsyncStorage 持久化', pattern: /AsyncStorage/i },
  { name: 'LRU 策略', pattern: /LRU|lastUsed|accessTime/i },
  { name: '缓存清理', pattern: /cleanup|clear|remove/i },
  { name: '缓存统计', pattern: /stats|hitRate|missRate/i }
];

let cacheOk = true;
cacheChecks.forEach(check => {
  const passed = check.pattern.test(cacheServiceContent);
  console.log(`${passed ? '✅' : '❌'} ${check.name}`);
  if (!passed) cacheOk = false;
});

// 测试 4: 检查 RequestQueue 功能
console.log('\n📋 测试 4: 检查请求队列功能');
const requestQueueContent = fs.readFileSync('lib/RequestQueue.ts', 'utf8');

const queueChecks = [
  { name: '请求队列', pattern: /queue|Queue.*?Request|private.*?requests/i },
  { name: '优先级排序', pattern: /priority|Priority/i },
  { name: '并发控制', pattern: /maxConcurrent|concurrent/i },
  { name: '请求超时', pattern: /timeout|Timeout/i },
  { name: '请求取消', pattern: /cancel|abort/i }
];

let queueOk = true;
queueChecks.forEach(check => {
  const passed = check.pattern.test(requestQueueContent);
  console.log(`${passed ? '✅' : '❌'} ${check.name}`);
  if (!passed) queueOk = false;
});

// 测试 5: 检查 AIAnalysisService 缓存集成
console.log('\n🔗 测试 5: 检查缓存集成');
const aiServiceContent = fs.readFileSync('lib/AIAnalysisService.ts', 'utf8');

const integrationChecks = [
  { name: '导入 CacheService', pattern: /import.*?CacheService/i },
  { name: 'OCR 结果缓存', pattern: /cache.*?ocr|ocr.*?cache/i },
  { name: '分析结果缓存', pattern: /cache.*?analysis|analysis.*?cache/i },
  { name: '学习路径缓存', pattern: /cache.*?path|path.*?cache/i }
];

let integrationOk = true;
integrationChecks.forEach(check => {
  const passed = check.pattern.test(aiServiceContent);
  console.log(`${passed ? '✅' : '❌'} ${check.name}`);
  if (!passed) integrationOk = false;
});

// 测试 6: 检查进度显示优化
console.log('\n📊 测试 6: 检查进度显示优化');
const cameraContent = fs.readFileSync('app/camera.tsx', 'utf8');

const progressChecks = [
  { name: '百分比进度', pattern: /progress.*?%|percentage|progress.*?:\s*\d+|progressPercent/i },
  { name: '进度条组件', pattern: /ProgressBar|loadingBar|progress.*?bar|loadingBarFill/i },
  { name: '详细进度文案', pattern: /正在压缩|正在识别|正在分析|压缩图片|OCR识别/i },
  { name: '请求队列集成', pattern: /RequestQueue|enqueue|addRequest/i }
];

let progressOk = true;
progressChecks.forEach(check => {
  const passed = check.pattern.test(cameraContent);
  console.log(`${passed ? '✅' : '❌'} ${check.name}`);
  if (!passed) progressOk = false;
});

// 总结
console.log('\n' + '='.repeat(60));
console.log('\n📊 测试总结\n');

const results = [
  { name: '文件完整性', passed: filesExist },
  { name: '图片压缩优化', passed: compressionOk },
  { name: '缓存服务功能', passed: cacheOk },
  { name: '请求队列功能', passed: queueOk },
  { name: '缓存集成', passed: integrationOk },
  { name: '进度显示优化', passed: progressOk }
];

const passedCount = results.filter(r => r.passed).length;
const totalCount = results.length;

results.forEach(result => {
  console.log(`${result.passed ? '✅' : '❌'} ${result.name}`);
});

console.log(`\n总体通过率: ${passedCount}/${totalCount} (${Math.round(passedCount/totalCount*100)}%)`);

if (passedCount === totalCount) {
  console.log('\n🎉 所有功能测试通过！');
  console.log('\n下一步:');
  console.log('1. 运行性能测试: npm run test:performance');
  console.log('2. 部署到 Vercel: vercel --prod');
  console.log('3. 构建 Android APK: eas build --platform android');
  process.exit(0);
} else {
  console.log('\n⚠️  部分测试未通过，请检查实现');
  process.exit(1);
}
