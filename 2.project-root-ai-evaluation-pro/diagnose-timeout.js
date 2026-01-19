/**
 * 超时问题诊断脚本
 * 测试各个 API 端点的响应时间
 */

require('dotenv').config({ path: '.env.local' });

const https = require('https');
const crypto = require('crypto');

console.log('🔍 开始诊断超时问题...\n');
console.log('=' .repeat(60));

// 测试 1: 检查环境变量
console.log('\n📋 测试 1: 检查环境变量');
const accessKeyId = process.env.ALICLOUD_ACCESS_KEY_ID;
const accessKeySecret = process.env.ALICLOUD_ACCESS_KEY_SECRET;
const deepseekKey = process.env.DEEPSEEK_API_KEY;

if (!accessKeyId || !accessKeySecret) {
  console.log('❌ 阿里云 AccessKey 未配置');
  process.exit(1);
}

console.log(`✅ ALICLOUD_ACCESS_KEY_ID: ${accessKeyId.substring(0, 8)}...`);
console.log(`✅ ALICLOUD_ACCESS_KEY_SECRET: ${accessKeySecret.substring(0, 8)}...`);
console.log(`✅ DEEPSEEK_API_KEY: ${deepseekKey ? deepseekKey.substring(0, 8) + '...' : '未配置'}`);

// 测试 2: 测试阿里云 OCR API 连接
console.log('\n🌐 测试 2: 测试阿里云 OCR API 连接');

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
  const hmac = crypto.createHmac('sha1', accessKeySecret + '&');
  hmac.update(stringToSign);
  return hmac.digest('base64');
}

async function testOCRConnection() {
  const startTime = Date.now();
  
  return new Promise((resolve, reject) => {
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
      body: 'test', // 测试用的小数据
    };
    
    const allParams = { ...commonParams, ...businessParams };
    const stringToSign = buildStringToSign('POST', allParams);
    const signature = generateSignature(accessKeySecret, stringToSign);
    allParams.Signature = signature;
    
    const queryString = Object.keys(allParams)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(allParams[key])}`)
      .join('&');
    
    const req = https.request({
      hostname: 'ocr-api.cn-shanghai.aliyuncs.com',
      path: `/?${queryString}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      timeout: 15000, // 15秒超时
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const duration = Date.now() - startTime;
        try {
          const result = JSON.parse(data);
          
          if (result.Code) {
            console.log(`⚠️  API 返回错误 (${duration}ms):`);
            console.log(`   Code: ${result.Code}`);
            console.log(`   Message: ${result.Message || '无详细信息'}`);
            
            if (result.Code === 'InvalidAccessKeyId.NotFound') {
              console.log('\n❌ AccessKey 无效或未激活');
              console.log('   请检查:');
              console.log('   1. AccessKey 是否正确');
              console.log('   2. AccessKey 是否已激活');
              console.log('   3. 是否有 OCR 服务权限');
            }
            
            resolve({ success: false, duration, error: result });
          } else {
            console.log(`✅ API 连接成功 (${duration}ms)`);
            resolve({ success: true, duration });
          }
        } catch (err) {
          console.log(`❌ 解析响应失败 (${duration}ms):`, err.message);
          console.log(`   原始响应: ${data.substring(0, 200)}`);
          resolve({ success: false, duration, error: err });
        }
      });
    });
    
    req.on('error', (err) => {
      const duration = Date.now() - startTime;
      console.log(`❌ 网络请求失败 (${duration}ms):`, err.message);
      resolve({ success: false, duration, error: err });
    });
    
    req.on('timeout', () => {
      req.destroy();
      const duration = Date.now() - startTime;
      console.log(`❌ 请求超时 (${duration}ms)`);
      resolve({ success: false, duration, error: new Error('Timeout') });
    });
    
    req.end();
  });
}

// 测试 3: 测试 Vercel API 端点
console.log('\n🌐 测试 3: 测试 Vercel API 端点');

async function testVercelAPI() {
  const startTime = Date.now();
  
  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'somegood.vercel.app',
      path: '/api/ocr',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const duration = Date.now() - startTime;
        console.log(`✅ Vercel API 可访问 (${duration}ms)`);
        console.log(`   状态码: ${res.statusCode}`);
        resolve({ success: true, duration });
      });
    });
    
    req.on('error', (err) => {
      const duration = Date.now() - startTime;
      console.log(`❌ Vercel API 访问失败 (${duration}ms):`, err.message);
      resolve({ success: false, duration, error: err });
    });
    
    req.on('timeout', () => {
      req.destroy();
      const duration = Date.now() - startTime;
      console.log(`❌ Vercel API 超时 (${duration}ms)`);
      resolve({ success: false, duration, error: new Error('Timeout') });
    });
    
    // 发送测试数据
    req.write(JSON.stringify({ imageBase64: 'test' }));
    req.end();
  });
}

// 执行所有测试
(async () => {
  try {
    const ocrResult = await testOCRConnection();
    const vercelResult = await testVercelAPI();
    
    console.log('\n' + '='.repeat(60));
    console.log('\n📊 诊断总结\n');
    
    console.log('阿里云 OCR API:');
    console.log(`  状态: ${ocrResult.success ? '✅ 正常' : '❌ 异常'}`);
    console.log(`  响应时间: ${ocrResult.duration}ms`);
    if (ocrResult.error) {
      console.log(`  错误: ${ocrResult.error.Code || ocrResult.error.message}`);
    }
    
    console.log('\nVercel API:');
    console.log(`  状态: ${vercelResult.success ? '✅ 正常' : '❌ 异常'}`);
    console.log(`  响应时间: ${vercelResult.duration}ms`);
    
    console.log('\n💡 建议:');
    
    if (!ocrResult.success) {
      console.log('1. 检查阿里云 AccessKey 是否正确配置');
      console.log('2. 确认 AccessKey 已激活且有 OCR 权限');
      console.log('3. 检查网络连接是否正常');
      console.log('4. 尝试增加超时时间');
    }
    
    if (ocrResult.duration > 5000) {
      console.log('5. OCR API 响应较慢，建议:');
      console.log('   - 增加超时时间到 20-30 秒');
      console.log('   - 检查网络质量');
      console.log('   - 考虑使用更快的 OCR 服务');
    }
    
    if (!vercelResult.success) {
      console.log('6. Vercel 部署可能有问题，检查:');
      console.log('   - 环境变量是否正确配置');
      console.log('   - 部署是否成功');
      console.log('   - 查看 Vercel 日志');
    }
    
  } catch (error) {
    console.error('\n❌ 诊断过程出错:', error);
  }
})();
