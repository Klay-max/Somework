# 本地测试环境配置完成

## 已创建的文件

### 1. 启动脚本
- **`start-local-dev.bat`** - 一键启动本地开发环境
  - 自动启动 API 服务器（端口 3001）
  - 自动启动 Expo 开发服务器（端口 8081）

### 2. 测试脚本
- **`test-ocr-local.js`** - 测试 OCR API 是否正常工作
  - 运行方法：`node test-ocr-local.js`

### 3. 文档
- **`TEST_INSTRUCTIONS.md`** - 3 步测试指南（最简单）
- **`现在就测试.md`** - 立即开始测试指南
- **`如何本地测试.md`** - 详细测试指南
- **`TEST_LOCAL.md`** - 完整测试和调试指南

## 代码改进

### 1. 增强的日志输出

**`app/camera.tsx`**
- 添加了导航前的日志
- 显示报告 ID 和数据

**`app/report/[id].tsx`**
- 添加了详细的加载日志
- 显示数据来源（路由参数/存储/模拟）

### 2. 本地 API 服务器

**`local-api-server.js`**
- 独立运行，不依赖 Vercel CLI
- 使用模拟 OCR 数据（因为本地网络无法访问阿里云）
- 完整的错误处理和日志

### 3. API 客户端配置

**`lib/ApiClient.ts`**
- 开发环境：`http://localhost:3001/api`
- 生产环境：`https://somegood.vercel.app/api`

## 使用方法

### 快速开始（推荐）

1. 双击 `start-local-dev.bat`
2. 等待两个服务器启动
3. 在 Expo 窗口按 `w` 键
4. 开始测试

### 手动启动（调试用）

**窗口 1 - API 服务器：**
```cmd
cd /d D:\桌面文件\project-root\2.project-root-ai-evaluation-pro
node local-api-server.js
```

**窗口 2 - Expo 服务器：**
```cmd
cd /d D:\桌面文件\project-root\2.project-root-ai-evaluation-pro
npx expo start --web
```

### 测试 API 服务器

```cmd
node test-ocr-local.js
```

应该看到：
```
✓ 测试成功！
✓ 识别文本: A B C D A B C D...
✓ 置信度: 0.95
```

## 测试流程

1. **启动服务器** → 双击 `start-local-dev.bat`
2. **打开应用** → 按 `w` 键或访问 `http://localhost:8081`
3. **开始扫描** → 点击"启动视觉诊断"
4. **选择图片** → 任意图片
5. **等待处理** → 显示 1/6 到 6/6
6. **查看报告** → 自动跳转

## 调试方法

### 浏览器控制台（F12）

查看：
- 前端日志
- 网络请求
- JavaScript 错误

关键日志：
```
[API Request] POST /ocr
准备导航到报告页面: report-xxxxx
报告页面加载，参数: {id: "...", hasData: true}
✓ 使用路由参数中的报告数据
```

### API 服务器窗口

查看：
- 收到的请求
- OCR 处理结果
- 错误信息

关键日志：
```
[API] Received OCR request
[OCR] 使用模拟数据（本地网络无法访问阿里云 API）
[API] OCR success!
```

### Expo 服务器窗口

查看：
- 页面加载
- 模块打包
- 运行时错误

## 常见问题

### "Cannot find module" 错误

**原因：** 不在项目目录下

**解决：**
1. 进入项目目录：`D:\桌面文件\project-root\2.project-root-ai-evaluation-pro`
2. 在文件夹空白处，Shift + 右键
3. 选择"在此处打开 PowerShell 窗口"
4. 运行命令

### "Not found" 错误

**可能原因：**
1. 路由问题
2. 数据传递问题
3. 页面加载问题

**调试步骤：**
1. 打开浏览器控制台（F12）
2. 查看 Console 标签的日志
3. 查看地址栏 URL
4. 截图发给我

### 识别超时

**当前方案：** 使用模拟数据，不应该超时

**如果仍然超时：**
1. 检查 API 服务器是否运行
2. 检查浏览器网络请求
3. 查看控制台错误

## 下一步

### 如果测试成功 ✓

1. 告诉我："本地测试成功！"
2. 我们可以部署到生产环境
3. 继续开发其他功能

### 如果测试失败 ✗

请提供：
1. 错误截图（浏览器地址栏 + 页面内容）
2. 浏览器控制台日志（F12 → Console）
3. API 服务器窗口输出
4. Expo 服务器窗口输出

我会根据这些信息帮你解决问题。

## 技术细节

### 为什么使用模拟数据？

本地网络无法访问阿里云 OCR API（DNS 解析失败），所以：
- 本地测试：使用模拟数据
- 生产环境：使用真实 API

### 为什么需要两个服务器？

1. **API 服务器（3001）**：处理 OCR 请求
2. **Expo 服务器（8081）**：提供前端页面

### 数据流程

```
用户上传图片
  ↓
前端处理（ImageProcessor）
  ↓
发送到 API 服务器（/api/ocr）
  ↓
OCR 识别（模拟数据）
  ↓
返回识别结果
  ↓
前端提取答案（AnswerExtractor）
  ↓
评分（AnswerGrader）
  ↓
AI 分析（模拟）
  ↓
生成学习路径（模拟）
  ↓
保存报告（StorageService）
  ↓
导航到报告页面
```

## 文件位置

所有测试相关文件都在项目根目录：
```
D:\桌面文件\project-root\2.project-root-ai-evaluation-pro\
├── start-local-dev.bat          # 启动脚本
├── test-ocr-local.js            # API 测试脚本
├── local-api-server.js          # 本地 API 服务器
├── TEST_INSTRUCTIONS.md         # 简单测试指南
├── 现在就测试.md                 # 立即测试指南
├── 如何本地测试.md               # 详细测试指南
└── TEST_LOCAL.md                # 完整测试指南
```

---

准备好了！现在你可以开始测试了。

**第一步：双击 `start-local-dev.bat`**

有问题随时告诉我！
