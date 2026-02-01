/**
 * 测试真实 API 连接
 */

const http = require('http');

// 测试数据 - 一个简单的 base64 图片
const testImageBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=';

console.log('🧪 测试真实 API 连接...\n');

// 测试 OCR API
function testOCR() {
  return new Promise((resolve, reject) => {
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

    console.log('📡 测试 OCR API...');
    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('✅ OCR API 响应成功');
          console.log('   状态码:', res.statusCode);
          console.log('   响应:', JSON.stringify(result, null, 2).substring(0, 200) + '...');
          resolve(result);
        } catch (error) {
          console.log('❌ OCR API 响应解析失败:', error.message);
