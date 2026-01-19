# VISION-CORE 后端 API

## 概述

本目录包含 VISION-CORE 项目的后端 API 服务，使用 Vercel Serverless Functions 架构。

## API 端点

### 1. POST /api/ocr
识别答题卡图像

**请求**:
```json
{
  "imageBase64": "base64_encoded_image",
  "templateId": "standard" // 可选
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "answers": [
      {
        "questionId": "1",
        "userAnswer": "A",
        "confidence": 0.95,
        "position": { "x": 100, "y": 100, "width": 20, "height": 20 }
      }
    ],
    "confidence": 0.92
  }
}
```

### 2. POST /api/analyze
分析错题模式

**请求**:
```json
{
  "gradeResult": {
    "totalScore": 85,
    "maxScore": 100,
    "accuracy": 85,
    "wrongAnswers": [...]
  },
  "language": "zh" // 可选，默认 zh
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "surfaceIssues": ["计算粗心", "审题不清"],
    "rootCauses": ["基础知识不牢固"],
    "aiComment": "本次测评显示...",
    "knowledgeGaps": [...]
  }
}
```

### 3. POST /api/generate-path
生成学习路径

**请求**:
```json
{
  "errorAnalysis": {
    "surfaceIssues": [...],
    "rootCauses": [...],
    "knowledgeGaps": [...]
  },
  "language": "zh" // 可选，默认 zh
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "stages": [
      {
        "id": "1",
        "title": "基础修复",
        "content": ["复习基础语法", "完成练习题"],
        "videoLinks": [],
        "duration": "2周"
      }
    ]
  }
}
```

## 环境变量配置

复制 `.env.example` 为 `.env` 并填写以下配置：

```bash
# 阿里云 OCR API
ALICLOUD_ACCESS_KEY_ID=your_access_key_id
ALICLOUD_ACCESS_KEY_SECRET=your_access_key_secret

# DeepSeek API
DEEPSEEK_API_KEY=your_api_key

# 安全配置
ALLOWED_ORIGINS=http://localhost:19006,https://yourdomain.com
RATE_LIMIT_MAX=10
```

## 本地开发

```bash
# 安装依赖
npm install

# 启动测试服务器
node api/test-server.js

# 在另一个终端运行测试
node api/test-api.js

# 测试 OCR（使用真实图像）
# 1. 将图像文件放在 api 目录下，命名为 test-image.jpg
# 2. 运行测试脚本
node api/test-ocr-with-image.js
```

### 使用 Vercel Dev

```bash
# 启动 Vercel 开发服务器
vercel dev

# 测试 API
curl -X POST http://localhost:3000/api/ocr \
  -H "Content-Type: application/json" \
  -d '{"imageBase64": "..."}'
```

## 部署到 Vercel

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel --prod

# 配置环境变量（在 Vercel Dashboard）
```

## 安全特性

- ✅ CORS 保护
- ✅ 频率限制（10 次/分钟）
- ✅ API 密钥保护（不暴露给前端）
- ✅ 错误处理和重试机制
- ✅ 请求超时控制

## 错误处理

所有 API 在出错时返回统一格式：

```json
{
  "success": false,
  "error": "用户友好的错误消息"
}
```

## 性能优化

- 请求超时：30 秒
- 频率限制：10 次/分钟
- 缓存策略：待实现
- 并发控制：待实现

## 下一步

- [x] 实现阿里云 OCR API 客户端 ✅
- [ ] 实现 DeepSeek API 客户端
- [ ] 实现答案提取算法
- [ ] 实现缓存机制
- [ ] 添加单元测试
- [ ] 添加集成测试

## 测试文档

详细的测试指南请参考：
- [OCR 测试指南](./OCR_TESTING.md) - 阿里云 OCR API 测试说明
