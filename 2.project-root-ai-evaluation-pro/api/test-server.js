/**
 * 本地测试服务器
 * 用于测试 API 端点，无需 Vercel 登录
 */

const express = require('express');
const cors = require('cors');

// 注册 ts-node 以支持 TypeScript
require('ts-node').register({
  project: './api/tsconfig.json',
  transpileOnly: true,
});

const app = express();
const PORT = 3000;

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// 模拟 Vercel 环境变量
process.env.ALLOWED_ORIGINS = 'http://localhost:3000,http://localhost:19006';
process.env.RATE_LIMIT_MAX = '10';

// 加载 API 端点
const loadHandler = (handlerPath) => {
  const handler = require(handlerPath).default;
  
  return (req, res) => {
    handler(req, res);
  };
};

// 注册路由
app.post('/api/ocr', loadHandler('./ocr.ts'));
app.post('/api/analyze', loadHandler('./analyze.ts'));
app.post('/api/generate-path', loadHandler('./generate-path.ts'));

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`\n✅ 测试服务器已启动！`);
  console.log(`📍 地址: http://localhost:${PORT}`);
  console.log(`\n可用的 API 端点:`);
  console.log(`  POST http://localhost:${PORT}/api/ocr`);
  console.log(`  POST http://localhost:${PORT}/api/analyze`);
  console.log(`  POST http://localhost:${PORT}/api/generate-path`);
  console.log(`  GET  http://localhost:${PORT}/health`);
  console.log(`\n按 Ctrl+C 停止服务器\n`);
});
