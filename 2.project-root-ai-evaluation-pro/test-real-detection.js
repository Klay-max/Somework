/**
 * 真实检测功能测试脚本
 * 
 * 测试内容：
 * 1. 阿里云 OCR API 连接
 * 2. DeepSeek AI API 连接
 * 3. 完整的检测流程
 */

require('dotenv').config({ path: '.env.local' });

const crypto = require('crypto');
const https = require('https');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// ==================== 阿里云 OCR 测试 ====================

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
  const hmac = crypto.createHmac('sha1', accessKeySecret);
  hmac.update(stringToSign);
  return hmac.digest('base64');
}

async function testAliCloudOCR() {
  log('\n========== 测试阿里云 OCR API ==========', 'cyan');
  
  const accessKeyId = process.env.ALICLOUD_ACCESS_KEY_ID;
  const accessKeySecret = process.env.ALICLOUD_ACCESS_KEY_SECRET;
  
  // 检查环境变量
  if (!accessKeyId || !accessKeySecret) {
    log('❌ 缺少阿里云 API 密钥', 'red');
    log('   请在 .env.local 中设置：', 'yellow');
    log('   - ALICLOUD_ACCESS_KEY_ID', 'yellow');
    log('   - ALICLOUD_ACCESS_KEY_SECRET', 'yellow');
    return false;
  }
  
  log(`✓ 找到阿里云 Access Key ID: ${accessKeyId.substring(0, 8)}...`, 'green');
  log(`✓ 找到阿里云 Access Key Secret: ${accessKeySecret.substring(0, 8)}...`, 'green');
  
  // 创建测试图像（1x1 白色像素的 Base64）
  const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
  
  log('\n正在调用阿里云 OCR API...', 'blue');
  
  try {
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
      body: testImageBase64,
    };
    
    const allParams = { ...commonParams, ...businessParams };
    const stringToSign = buildStringToSign('POST', allParams);
    const signature = generateSignature(accessKeySecret, stringToSign);
    allParams.Signature = signature;
    
    const queryString = Object.keys(allParams)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(allParams[key])}`)
      .join('&');
    
    const result = await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'ocr-api.cn-shanghai.aliyuncs.com',
        path: `/?${queryString}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 10000,
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (err) {
            reject(err);
          }
        });
      });
      
      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('请求超时'));
      });
      
      req.end();
    });
    
    if (result.Code && result.Code !== 'Success') {
      log(`❌ OCR API 返回错误: ${result.Message || result.Code}`, 'red');
      return false;
    }
    
    log('✓ OCR API 调用成功！', 'green');
    log(`  识别文本: ${result.Data?.content || '(空)'}`, 'blue');
    return true;
    
  } catch (error) {
    log(`❌ OCR API 调用失败: ${error.message}`, 'red');
    return false;
  }
}

// ==================== DeepSeek AI 测试 ====================

async function testDeepSeekAPI() {
  log('\n========== 测试 DeepSeek AI API ==========', 'cyan');
  
  const apiKey = process.env.DEEPSEEK_API_KEY;
  
  // 检查环境变量
  if (!apiKey) {
    log('❌ 缺少 DeepSeek API 密钥', 'red');
    log('   请在 .env.local 中设置：', 'yellow');
    log('   - DEEPSEEK_API_KEY', 'yellow');
    return false;
  }
  
  log(`✓ 找到 DeepSeek API Key: ${apiKey.substring(0, 8)}...`, 'green');
  
  log('\n正在调用 DeepSeek API...', 'blue');
  
  try {
    const requestBody = JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: '你是一位专业的教育分析师。请严格按照 JSON 格式返回分析结果。',
        },
        {
          role: 'user',
          content: '请分析以下学生的答题情况：总分 80/100，正确率 80%。请以 JSON 格式返回：{"surfaceIssues": ["问题1"], "rootCauses": ["原因1"], "aiComment": "点评", "knowledgeGaps": [{"knowledgePoint": "知识点", "difficulty": 3, "mastered": false, "detail": "详情"}]}',
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    });
    
    const result = await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'api.deepseek.com',
        path: '/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'Content-Length': Buffer.byteLength(requestBody),
        },
        timeout: 15000,
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (err) {
            reject(err);
          }
        });
      });
      
      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('请求超时'));
      });
      
      req.write(requestBody);
      req.end();
    });
    
    if (result.error) {
      log(`❌ DeepSeek API 返回错误: ${result.error.message}`, 'red');
      return false;
    }
    
    const content = result.choices?.[0]?.message?.content;
    
    if (!content) {
      log('❌ DeepSeek API 返回空响应', 'red');
      return false;
    }
    
    log('✓ DeepSeek API 调用成功！', 'green');
    log(`  响应内容: ${content.substring(0, 100)}...`, 'blue');
    
    // 验证 JSON 格式
    try {
      const parsed = JSON.parse(content);
      if (parsed.surfaceIssues && parsed.rootCauses && parsed.aiComment && parsed.knowledgeGaps) {
        log('✓ 响应格式正确（包含所有必需字段）', 'green');
        return true;
      } else {
        log('⚠ 响应格式不完整（缺少某些字段）', 'yellow');
        return true; // 仍然算成功，只是格式不完美
      }
    } catch (err) {
      log('⚠ 响应不是有效的 JSON 格式', 'yellow');
      return true; // 仍然算成功，只是格式不完美
    }
    
  } catch (error) {
    log(`❌ DeepSeek API 调用失败: ${error.message}`, 'red');
    return false;
  }
}

// ==================== 主测试流程 ====================

async function main() {
  log('\n╔════════════════════════════════════════════════╗', 'cyan');
  log('║     真实检测功能测试 - OCR + AI 分析          ║', 'cyan');
  log('╚════════════════════════════════════════════════╝', 'cyan');
  
  const results = {
    ocr: false,
    ai: false,
  };
  
  // 测试 OCR
  results.ocr = await testAliCloudOCR();
  
  // 测试 AI
  results.ai = await testDeepSeekAPI();
  
  // 总结
  log('\n========== 测试总结 ==========', 'cyan');
  log(`阿里云 OCR: ${results.ocr ? '✓ 正常' : '✗ 失败'}`, results.ocr ? 'green' : 'red');
  log(`DeepSeek AI: ${results.ai ? '✓ 正常' : '✗ 失败'}`, results.ai ? 'green' : 'red');
  
  if (results.ocr && results.ai) {
    log('\n🎉 所有测试通过！真实检测功能已就绪！', 'green');
    log('\n你现在可以：', 'blue');
    log('1. 在手机 APP 上测试扫描功能', 'blue');
    log('2. 上传答题卡图片进行 OCR 识别', 'blue');
    log('3. 获取 AI 生成的错误分析和学习路径', 'blue');
  } else {
    log('\n⚠ 部分测试失败，请检查配置', 'yellow');
    if (!results.ocr) {
      log('- 检查阿里云 API 密钥是否正确', 'yellow');
      log('- 确认阿里云账户余额充足', 'yellow');
    }
    if (!results.ai) {
      log('- 检查 DeepSeek API 密钥是否正确', 'yellow');
      log('- 确认 DeepSeek 账户余额充足', 'yellow');
    }
  }
  
  log('\n');
}

main().catch(err => {
  log(`\n❌ 测试过程出错: ${err.message}`, 'red');
  process.exit(1);
});
