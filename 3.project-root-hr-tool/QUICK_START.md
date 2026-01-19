# 🚀 快速启动指南

## ✅ 当前状态

**后端服务器**: ✅ 运行中 (http://localhost:3001)
**前端应用**: 🔄 启动中 (http://localhost:3000)
**DeepSeek API**: ✅ 已配置

## 📝 如何使用

### 1. 访问应用

打开浏览器访问: **http://localhost:3000**

### 2. 上传文档

1. 在主界面左侧看到"Upload Document"区域
2. 点击或拖拽文件到上传区域
3. 支持的格式：
   - PDF (.pdf)
   - Word (.docx)
   - Excel (.xlsx, .xls)
   - 纯文本 (.txt)
4. 文件大小限制：50MB

### 3. 查看分析结果

上传后，系统会自动：
1. 解析文档内容
2. 调用DeepSeek AI分析
3. 在"Issues Found"列表中显示发现的问题

问题分类：
- 🔤 **Grammar** - 语法问题
- 📐 **Format** - 格式问题
- 🔄 **Consistency** - 一致性问题
- 🏗️ **Structure** - 结构问题
- 📄 **Content** - 内容问题

严重程度：
- 🔴 **Critical** - 关键
- 🟠 **High** - 高
- 🟡 **Medium** - 中
- 🟢 **Low** - 低

### 4. 查看问题详情

1. 点击问题列表中的任意问题
2. 在"Issue Details"面板查看：
   - 问题描述
   - 原始文本
   - 上下文
   - 修复建议
   - 置信度

### 5. 应用修复

1. 在问题详情中点击"Apply Fix"按钮
2. 或选择多个问题后批量修复
3. 在"Fix Preview"中查看修复前后对比

### 6. 下载文档

1. 在"Download Manager"面板
2. 选择下载格式：
   - **Original** - 原始文档
   - **Fixed** - 修复后文档
3. 点击"Download"按钮

## 🔧 API测试

### 健康检查
```bash
curl http://localhost:3001/health
```

### 上传文档
```bash
curl -X POST http://localhost:3001/api/documents/upload \
  -F "file=@your-document.pdf"
```

### 分析文档
```bash
curl -X POST http://localhost:3001/api/documents/{documentId}/analyze
```

### 获取分析结果
```bash
curl http://localhost:3001/api/documents/{documentId}/analysis/{analysisId}
```

## 📊 功能特性

### ✅ 已实现
- ✅ 多格式文档上传
- ✅ 智能文档分析（DeepSeek AI）
- ✅ 问题检测和分类
- ✅ 自动修复建议
- ✅ 修复前后对比
- ✅ 文档下载
- ✅ 实时进度显示
- ✅ 错误处理

### 🎯 核心流程

```
上传文档 → 解析内容 → AI分析 → 显示问题 → 应用修复 → 下载文档
```

## 🐛 故障排除

### 后端无法启动
```bash
cd backend
npm install
npm run dev
```

### 前端无法启动
```bash
cd frontend
npm install
npm start
```

### API调用失败
检查：
1. DeepSeek API Key是否正确配置
2. 网络连接是否正常
3. 查看后端日志：`backend/logs/combined.log`

### 文件上传失败
检查：
1. 文件格式是否支持
2. 文件大小是否超过50MB
3. 后端uploads目录是否有写权限

## 📁 目录结构

```
project-root-v1215/
├── backend/              # 后端服务 (运行在 :3001)
│   ├── src/
│   ├── uploads/         # 上传文件存储
│   ├── temp/            # 临时文件
│   ├── logs/            # 日志文件
│   └── .env             # 环境配置
├── frontend/            # 前端应用 (运行在 :3000)
│   └── src/
└── README.zh-CN.md      # 详细文档
```

## 🔑 环境变量

后端 `.env` 文件：
```env
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:3000
DEEPSEEK_API_KEY=sk-316771173bb642328d31cd166bcb63d3
UPLOAD_DIR=./uploads
TEMP_DIR=./temp
MAX_FILE_SIZE=52428800
LOG_LEVEL=info
```

## 💡 使用技巧

1. **批量处理**: 可以连续上传多个文档
2. **过滤问题**: 使用问题列表的过滤器按类型/严重程度筛选
3. **搜索功能**: 在问题列表中搜索特定关键词
4. **选择性修复**: 只修复你想要修复的问题
5. **保留原文档**: 系统会保留原始文档，修复后生成新文档

## 📞 获取帮助

- 查看详细文档: `README.zh-CN.md`
- 查看项目状态: `PROJECT_STATUS.md`
- 查看API文档: 访问 http://localhost:3001/health

## 🎉 开始使用

现在你可以：
1. 打开 http://localhost:3000
2. 上传一个HR文档
3. 查看AI分析结果
4. 应用修复建议
5. 下载修复后的文档

祝使用愉快！🚀
