/**
 * 阿里云 OCR 网络诊断脚本
 * 
 * 功能：
 * - 测试多个阿里云区域端点的连接性
 * - 诊断 DNS 解析问题
 * - 测试 HTTPS 连接
 * - 提供详细的诊断报告
 */

const https = require('https');
const dns = require('dns');
const { promisify } = require('util');

const dnsResolve = promisify(dns.resolve4);

// 阿里云 OCR 端点列表
const endpoints = [
  { name: '上海', hostname: 'ocr-api.cn-shanghai.aliyuncs.com' },
  { name: '北京', hostname: 'ocr-api.cn-beijing.aliyuncs.com' },
  { name: '杭州', hostname: 'ocr-api.cn-hangzhou.aliyuncs.com' },
  { name: '深圳', hostname: 'ocr-api.cn-shenzhen.aliyuncs.com' },
  { name: '香港', hostname: 'ocr-api.cn-hongkong.aliyuncs.com' },
];

/**
 * 测试 DNS 解析
 */
async function testDNS(hostname) {
  try {
    const addresses = await dnsResolve(hostname);
    return {
      success: true,
      addresses,
      message: `解析成功: ${addresses.join(', ')}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error.code || error.message,
      message: `解析失败: ${error.message}`,
    };
  }
}

/**
 * 测试 HTTPS 连接
 */
async function testHTTPS(hostname) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const req = https.request({
      hostname,
      port: 443,
      path: '/',
      method: 'GET',
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    }, (res) => {
      const duration = Date.now() - startTime;
      resolve({
        success: true,
        statusCode: res.statusCode,
        duration,
        message: `连接成功 (${duration}ms, HTTP ${res.statusCode})`,
      });
      res.resume(); // 消费响应数据
    });

    req.on('error', (err) => {
      const duration = Date.now() - startTime;
      resolve({
        success: false,
        error: err.code || err.message,
        duration,
        message: `连接失败: ${err.message}`,
      });
    });

    req.on('timeout', () => {
      req.destroy();
      const duration = Date.now() - startTime;
      resolve({
        success: false,
        error: 'TIMEOUT',
        duration,
        message: `连接超时 (${duration}ms)`,
      });
    });

    req.end();
  });
}

/**
 * 测试单个端点
 */
async function testEndpoint(endpoint) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`测试端点: ${endpoint.name} (${endpoint.hostname})`);
  console.log('='.repeat(60));

  // 1. DNS 解析测试
  console.log('\n[1/2] DNS 解析测试...');
  const dnsResult = await testDNS(endpoint.hostname);
  console.log(`  ${dnsResult.success ? '✅' : '❌'} ${dnsResult.message}`);

  // 2. HTTPS 连接测试
  console.log('\n[2/2] HTTPS 连接测试...');
  const httpsResult = await testHTTPS(endpoint.hostname);
  console.log(`  ${httpsResult.success ? '✅' : '❌'} ${httpsResult.message}`);

  return {
    endpoint: endpoint.name,
    hostname: endpoint.hostname,
    dns: dnsResult,
    https: httpsResult,
    overall: dnsResult.success && httpsResult.success,
  };
}

/**
 * 生成诊断报告
 */
function generateReport(results) {
  console.log('\n\n');
  console.log('╔' + '═'.repeat(78) + '╗');
  console.log('║' + ' '.repeat(25) + '诊断报告' + ' '.repeat(45) + '║');
  console.log('╚' + '═'.repeat(78) + '╝');

  // 统计
  const total = results.length;
  const successful = results.filter(r => r.overall).length;
  const failed = total - successful;

  console.log('\n📊 统计信息:');
  console.log(`  总端点数: ${total}`);
  console.log(`  成功: ${successful} ✅`);
  console.log(`  失败: ${failed} ❌`);
  console.log(`  成功率: ${((successful / total) * 100).toFixed(1)}%`);

  // 详细结果
  console.log('\n📋 详细结果:');
  console.log('\n' + '-'.repeat(80));
  console.log(
    '端点'.padEnd(10) +
    '主机名'.padEnd(40) +
    'DNS'.padEnd(10) +
    'HTTPS'.padEnd(10) +
    '状态'
  );
  console.log('-'.repeat(80));

  results.forEach(result => {
    const dnsStatus = result.dns.success ? '✅' : '❌';
    const httpsStatus = result.https.success ? '✅' : '❌';
    const overallStatus = result.overall ? '✅ 正常' : '❌ 失败';

    console.log(
      result.endpoint.padEnd(10) +
      result.hostname.padEnd(40) +
      dnsStatus.padEnd(10) +
      httpsStatus.padEnd(10) +
      overallStatus
    );
  });
  console.log('-'.repeat(80));

  // 推荐方案
  console.log('\n💡 推荐方案:');

  if (successful === 0) {
    console.log('\n  ⚠️  所有端点都无法连接！');
    console.log('\n  可能原因:');
    console.log('    1. 网络防火墙屏蔽了阿里云服务');
    console.log('    2. DNS 服务器无法解析阿里云域名');
    console.log('    3. 本地网络环境限制');
    console.log('\n  建议解决方案:');
    console.log('    ✓ 更换 DNS 服务器（如 8.8.8.8 或 114.114.114.114）');
    console.log('    ✓ 使用 VPN 或代理服务');
    console.log('    ✓ 联系网络管理员解除限制');
    console.log('    ✓ 考虑使用备用 OCR 服务（腾讯云、百度等）');
  } else if (successful < total) {
    console.log('\n  ⚠️  部分端点可用');
    console.log('\n  推荐使用以下端点:');
    results
      .filter(r => r.overall)
      .forEach(r => {
        const duration = r.https.duration;
        console.log(`    ✓ ${r.endpoint}: ${r.hostname} (${duration}ms)`);
      });
    console.log('\n  建议:');
    console.log('    ✓ 在代码中配置使用可用的端点');
    console.log('    ✓ 实现自动切换机制');
  } else {
    console.log('\n  ✅ 所有端点都可用！');
    console.log('\n  推荐使用最快的端点:');
    const fastest = results.sort((a, b) => a.https.duration - b.https.duration)[0];
    console.log(`    ✓ ${fastest.endpoint}: ${fastest.hostname} (${fastest.https.duration}ms)`);
    console.log('\n  建议:');
    console.log('    ✓ 可以安全地切换到真实 API 模式');
    console.log('    ✓ 在 lib/MockApiService.ts 中设置 enabled: false');
  }

  // 错误详情
  const failedResults = results.filter(r => !r.overall);
  if (failedResults.length > 0) {
    console.log('\n❌ 失败详情:');
    failedResults.forEach(result => {
      console.log(`\n  ${result.endpoint} (${result.hostname}):`);
      if (!result.dns.success) {
        console.log(`    DNS 错误: ${result.dns.error}`);
      }
      if (!result.https.success) {
        console.log(`    HTTPS 错误: ${result.https.error}`);
      }
    });
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n');
}

/**
 * 主函数
 */
async function main() {
  console.log('\n🔍 阿里云 OCR 网络诊断工具');
  console.log('='.repeat(80));
  console.log('开始测试...\n');

  const results = [];

  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    results.push(result);
    
    // 添加延迟避免请求过快
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  generateReport(results);

  // 返回退出码
  const hasSuccess = results.some(r => r.overall);
  process.exit(hasSuccess ? 0 : 1);
}

// 运行
main().catch(error => {
  console.error('\n❌ 诊断过程出错:', error);
  process.exit(1);
});
