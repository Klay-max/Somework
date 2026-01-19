# HR文档分析工具

一个基于DeepSeek AI的智能人力资源文档分析和修复工具。

## 功能特性

- 📄 **多格式支持**: PDF、Word、Excel、纯文本
- 🔍 **智能分析**: 使用DeepSeek AI检测语法、格式、一致性等问题
- ⚡ **一键修复**: 自动修复可修复的问题
- 📊 **详细报告**: 问题分类、严重程度评估、修复建议
- 💾 **格式保留**: 下载时保持原始文档格式

## 快速开始

### 前置要求

- Node.js 16+
- npm 或 yarn
- DeepSeek API Key

### 安装

1. 克隆项目
```bash
git clone <repository-url>
cd project-root-v1215
```

2. 安装后端依赖
```bash
cd backend
npm install
```

3. 安装前端依赖
```bash
cd ../frontend
npm install
```

### 配置

1. 在backend目录创建`.env`文件：
```env
# 服务器配置
NODE_ENV=development
PORT=3001

# CORS配置
CORS_ORIGIN=http://localhost:3000

# 文件上传配置
UPLOAD_DIR=./uploads
TEMP_DIR=./temp
MAX_FILE_SIZE=52428800

# DeepSeek API配置
DEEPSEEK_API_URL=https://api.deepseek.com/v1
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# 日志配置
LOG_LEVEL=info
```

2. 替换`your_deepseek_api_key_here`为你的实际API Key

### 运行

1. 启动后端服务器：
```bash
cd backend
npm run dev
```

后端将在 http://localhost:3001 运行

2. 启动前端开发服务器：
```bash
cd frontend
npm start
```

前端将在 http://localhost:3000 运行

### 测试

运行后端测试：
```bash
cd backend
npm test
```

运行前端测试：
```bash
cd frontend
npm test
```

## API文档

### 上传文档
```
POST /api/documents/upload
Content-Type: multipart/form-data

Response:
{
  "documentId": "string",
  "filename": "string",
  "size": number
}
```

### 分析文档
```
POST /api/documents/:id/analyze

Response:
{
  "analysisId": "string",
  "status": "processing" | "completed" | "failed"
}
```

### 获取分析结果
```
GET /api/documents/:id/analysis/:analysisId

Response:
{
  "issues": Issue[],
  "suggestions": FixSuggestion[],
  "status": "string"
}
```

### 应用修复
```
POST /api/documents/:id/fix
Body: {
  "selectedIssues": string[],
  "autoFix": boolean
}

Response:
{
  "fixedDocumentId": "string",
  "fixSummary": FixSummary
}
```

### 下载文档
```
GET /api/documents/:id/download?format=fixed|original

Response: File stream
```

## 项目结构

```
project-root-v1215/
├── backend/                 # 后端服务
│   ├── src/
│   │   ├── controllers/    # API控制器
│   │   ├── middleware/     # 中间件
│   │   ├── models/         # 数据模型
│   │   ├── routes/         # 路由定义
│   │   ├── services/       # 业务逻辑
│   │   ├── tests/          # 测试文件
│   │   └── utils/          # 工具函数
│   └── package.json
├── frontend/                # 前端应用
│   ├── src/
│   │   ├── components/     # React组件
│   │   ├── services/       # API服务
│   │   ├── types/          # TypeScript类型
│   │   └── utils/          # 工具函数
│   └── package.json
└── .kiro/                   # 项目规范文档
    └── specs/
        └── hr-document-analyzer/
            ├── requirements.md
            ├── design.md
            └── tasks.md
```

## 技术栈

### 后端
- Node.js + Express
- TypeScript
- Multer (文件上传)
- Mammoth (Word解析)
- PDF-parse (PDF解析)
- XLSX (Excel解析)
- Winston (日志)
- Jest + fast-check (测试)

### 前端
- React 18
- TypeScript
- Ant Design
- Axios
- React Router

## 开发

### 代码规范
- 使用TypeScript严格模式
- 遵循ESLint规则
- 编写单元测试和属性测试

### 测试策略
- 单元测试：验证具体功能
- 属性测试：验证通用正确性
- 集成测试：验证端到端流程

## 许可证

MIT

## 贡献

欢迎提交Issue和Pull Request！
