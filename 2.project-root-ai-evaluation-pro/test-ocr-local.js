/**
 * 测试本地 OCR API
 * 运行方法：node test-ocr-local.js
 */

const http = require('http');

// 创建一个简单的测试图片 Base64（1x1 像素的透明 PNG）
const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

console.log('开始测试本地 OCR API...\n');

const postData = JSON.stringify({
  imageBase64: testImageBase64
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/ocr',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log(`状态码: ${res.statusCode}`);
  console.log(`响应头: ${JSON.stringify(res.headers)}\n`);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log('响应数据:');
      console.log(JSON.stringify(result, null, 2));
      
      if (result.success) {
        console.log('\n✓ 测试成功！');
        console.log(`✓ 识别文本: ${result.data.rawText.substring(0, 50)}...`);
        console.log(`✓ 置信度: ${result.data.confidence}`);
      } else {
        console.log('\n✗ 测试失败！');
        console.log(`✗ 错误: ${result.error}`);
      }
    } catch (err) {
      console.error('\n✗ 解析响应失败:', err.message);
      console.log('原始响应:', data);
    }
  });
});

req.on('error', (err) => {
  console.error('\n✗ 请求失败:', err.message);
  console.log('\n请确保本地 API 服务器正在运行：');
  console.log('  node local-api-server.js');
});

req.write(postData);
req.end();
