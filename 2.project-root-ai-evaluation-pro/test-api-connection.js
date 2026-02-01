/**
 * 测试本地 API 服务器连接
 */

const http = require('http');

console.log('测试本地 API 服务器连接...\n');

// 测试 OCR 端点
const testData = JSON.stringify({
  imageBase64: 'data:image/jpeg;base64,/9j/4AAQSkZJRg=='
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/ocr',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(testData)
  }
};

const req = http.request(options, (res) => {
  console.log(`✓ 连接成功！状态码: ${res.statusCode}`);
  console.log(`✓ 响应头:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\n✓ 响应数据:');
    console.log(data);
    console.log('\n✓ API 服务器工作正常！');
  });
});

req.on('error', (error) => {
  console.error('✗ 连接失败:', error.message);
  console.error('✗ 请确保本地 API 服务器正在运行');
});

req.write(testData);
req.end();
