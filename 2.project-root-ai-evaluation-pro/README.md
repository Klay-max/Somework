# 安辅导

赛博朋克风格的 AI 教育测评应用，支持 Web 和移动端（Android/iOS）双平台。

## 技术栈

- **框架**: Expo SDK 51+ with TypeScript
- **路由**: expo-router (file-based routing)
- **样式**: NativeWind (Tailwind CSS for React Native)
- **动画**: react-native-reanimated
- **图表**: react-native-svg + react-native-gifted-charts
- **相机**: expo-camera (CameraView API)
- **图标**: lucide-react-native

## 安装依赖

```bash
npm install --legacy-peer-deps
```

## 运行项目

### Web 端
```bash
npm run web
```

### Android 端
```bash
npm run android
```

### iOS 端
```bash
npm run ios
```

## 项目结构

```
.
├── app/                    # Expo Router 页面目录
│   ├── _layout.tsx        # 全局布局
│   ├── index.tsx          # 首页仪表盘
│   ├── camera.tsx         # 扫描终端
│   └── report/
│       └── [id].tsx       # 动态报告页面
├── components/            # 可复用组件
├── lib/                   # 工具库和类型定义
├── assets/                # 静态资源
└── .kiro/specs/          # 项目规范文档
```

## 开发状态

项目核心功能开发完成！✅

**已完成功能**：
- ✅ 完整的后端 API 服务（Vercel Serverless Functions）
- ✅ 阿里云 OCR 集成（答题卡识别）
- ✅ DeepSeek AI 集成（错误分析 + 学习路径生成）
- ✅ 图像处理和答案提取
- ✅ 自动评分和五维能力分析
- ✅ 历史记录和数据持久化
- ✅ 完整的端到端扫描流程
- ✅ 赛博朋克风格 UI
- ✅ 跨平台支持（Web + Android + iOS）

**核心特性**：
- 🎨 赛博朋克风格 UI（深黑背景 + 青色/绿色霓虹效果）
- 📱 跨平台支持（Web + Android + iOS）
- 🤖 AI 驱动分析（OCR + DeepSeek）
- 📊 五维能力评估（听力、语法、阅读、完形、逻辑）
- 🎯 个性化学习路径
- 💾 历史记录管理
- 🔄 平台自适应（Web 文件上传 / 移动端相机）

**项目完成度**：
- 阶段 1（后端基础）: 100% ✅
- 阶段 2（前端核心）: 100% ✅
- 阶段 3（UI 集成）: 95% ✅
- 阶段 4（高级功能）: 0% ⏳
- 阶段 5（测试）: 0% ⏳
- 阶段 6（部署）: 20% 🔄
- **总体完成度**: ~50%

## 项目结构

```
.
├── app/                    # Expo Router 页面目录
│   ├── _layout.tsx        # 全局布局（深色主题）
│   ├── index.tsx          # 首页仪表盘
│   ├── camera.tsx         # 扫描终端
│   └── report/
│       └── [id].tsx       # 动态报告页面
├── components/            # 可复用组件
│   ├── ui/               # 基础 UI 组件
│   │   ├── Card.tsx
│   │   ├── Button.tsx
│   │   ├── StatusIndicator.tsx
│   │   └── ProgressBar.tsx
│   ├── dashboard/        # 仪表盘组件
│   │   ├── StatusBar.tsx
│   │   ├── MainControl.tsx
│   │   └── DataPanel.tsx
│   ├── scanner/          # 扫描组件
│   │   ├── Viewfinder.tsx
│   │   ├── MatrixAnimation.tsx
│   │   ├── WebUploader.tsx
│   │   └── CameraView.tsx
│   └── report/           # 报告组件
│       ├── ScoreCore.tsx
│       ├── AbilityRadar.tsx
│       ├── DeepAnalysis.tsx
│       ├── KnowledgeMatrix.tsx
│       └── UpgradePath.tsx
├── lib/                   # 工具库和类型定义
│   ├── types.ts          # TypeScript 接口
│   └── mockData.ts       # 模拟数据生成
├── assets/                # 静态资源
└── .kiro/specs/          # 项目规范文档
    └── vision-core-app/
        ├── requirements.md
        ├── design.md
        └── tasks.md
```

## 功能说明

### 1. 首页仪表盘
- 显示系统状态（SYSTEM ONLINE + 绿色呼吸灯）
- 大型主控按钮（启动视觉诊断）
- 数据统计面板（准确率、扫描次数）

### 2. 扫描终端
- **Web 端**：拖拽或点击上传图片文件
- **移动端**：使用设备相机拍照
- 科幻风格取景框（四角青色边框）
- 矩阵代码流动画（3 秒）
- 自动导航至报告页面

### 3. 诊断报告
- **核心计分板**：环形进度条 + 横向对比数据
- **五维能力雷达图**：听力、语法、阅读、完形、逻辑
- **深度归因分析**：表层病灶 + 深层病根 + AI 点评（打字机效果）
- **知识点矩阵**：状态指示灯 + 难度星级 + 可展开详情
- **提分路径规划**：时间轴样式 + 学习内容 + 视频链接

### 4. 分享功能
- Web 端：使用 Web Share API 或复制链接
- 移动端：使用系统分享功能
- 包含报告摘要信息

## API 集成

### 阿里云 OCR
- **功能**: 答题卡识别
- **端点**: `/api/ocr`
- **超时**: 10 秒
- **文档**: [api/OCR_TESTING.md](./api/OCR_TESTING.md)

### DeepSeek AI
- **功能**: 错误分析 + 学习路径生成
- **端点**: `/api/analyze`, `/api/generate-path`
- **超时**: 15 秒（分析）、12 秒（路径）
- **文档**: [api/DEEPSEEK_TESTING.md](./api/DEEPSEEK_TESTING.md)

### 安全特性
- ✅ API 密钥环境变量保护
- ✅ CORS 跨域保护
- ✅ 频率限制（10 次/分钟）
- ✅ 请求超时控制
- ✅ 智能缓存机制
- ✅ 错误重试机制

## 已知问题

1. **移动端相机**: 当前只实现 Web 端文件上传，移动端相机需要实际设备测试
2. **TypeScript 警告**: 旧的 NativeWind className 错误，不影响运行时
3. **报告导出**: PDF/图片导出功能未实现（可选功能）

## 部署

### 快速部署到 Vercel（推荐）

#### 前置准备
1. **获取 API 密钥**：
   - 阿里云 OCR：访问 [阿里云 RAM 控制台](https://ram.console.aliyun.com/) 创建 AccessKey
   - DeepSeek：访问 [DeepSeek 平台](https://platform.deepseek.com/) 创建 API Key

2. **安装 Vercel CLI**：
   ```bash
   npm install -g vercel
   ```

#### 部署步骤

**方法 1: 使用部署脚本（最简单）**
```bash
# Linux/Mac
chmod +x deploy.sh
./deploy.sh

# Windows
deploy.bat
```

**方法 2: 手动部署**
```bash
# 1. 登录 Vercel
vercel login

# 2. 配置环境变量
vercel env add ALICLOUD_ACCESS_KEY_ID
vercel env add ALICLOUD_ACCESS_KEY_SECRET
vercel env add DEEPSEEK_API_KEY

# 3. 部署到生产环境
vercel --prod
```

**方法 3: 通过 Git 自动部署**
1. 推送代码到 GitHub/GitLab/Bitbucket
2. 访问 [Vercel Dashboard](https://vercel.com/new)
3. 导入 Git 仓库
4. 配置环境变量
5. 点击 Deploy

#### 环境变量配置

在 Vercel Dashboard 或使用 CLI 配置以下环境变量：

| 变量名 | 说明 | 必需 |
|--------|------|------|
| `ALICLOUD_ACCESS_KEY_ID` | 阿里云访问密钥 ID | ✅ |
| `ALICLOUD_ACCESS_KEY_SECRET` | 阿里云访问密钥 Secret | ✅ |
| `DEEPSEEK_API_KEY` | DeepSeek API 密钥 | ✅ |

可选配置（有默认值）：
- `ALICLOUD_OCR_ENDPOINT` - OCR API 端点
- `DEEPSEEK_API_ENDPOINT` - DeepSeek API 端点
- `RATE_LIMIT_MAX` - 频率限制（默认 10 次/分钟）
- `CACHE_DEFAULT_TTL` - 缓存过期时间（默认 1 小时）

#### 部署后验证

```bash
# 检查 API 端点
curl https://your-domain.vercel.app/api/ocr
curl https://your-domain.vercel.app/api/analyze
curl https://your-domain.vercel.app/api/generate-path

# 访问应用
open https://your-domain.vercel.app
```

#### 详细文档
- 📖 [完整部署指南](./DEPLOYMENT_GUIDE.md) - 详细的部署步骤和故障排除
- 🚀 [快速部署指南](./QUICKSTART_DEPLOYMENT.md) - 5 分钟快速上手

### 移动端部署（未来计划）

#### Android 构建

**前置准备**：
```bash
# 安装 EAS CLI
npm install -g eas-cli

# 登录 Expo 账号
eas login
```

**构建 APK**：
```bash
# 开发版本（包含调试工具）
eas build --profile development --platform android

# 预览版本（用于测试）
eas build --profile preview --platform android

# 生产版本（正式发布）
eas build --profile production --platform android
```

**本地测试**：
```bash
# 生成原生代码
npx expo prebuild --platform android

# 运行 Android 模拟器
npm run android
```

**详细文档**：
- 📱 [Android 构建指南](./ANDROID_BUILD_GUIDE.md) - 完整的构建和发布流程

#### iOS 构建（可选）

```bash
# 构建 iOS 应用
eas build --platform ios

# 提交到 App Store
eas submit --platform ios
```

## 开发团队

VISION-CORE © 2026

## 测试

```bash
npm test
```

## 文档

### 项目规范
- [需求文档](./.kiro/specs/ai-integration/requirements.md) - AI 功能需求
- [设计文档](./.kiro/specs/ai-integration/design.md) - 技术设计
- [任务列表](./.kiro/specs/ai-integration/tasks.md) - 实施任务

### 部署文档
- [完整部署指南](./DEPLOYMENT_GUIDE.md) - 详细的部署步骤和故障排除
- [快速部署指南](./QUICKSTART_DEPLOYMENT.md) - 5 分钟快速上手
- [部署准备总结](./TASK_18_DEPLOYMENT_PREP.md) - 部署准备工作

### API 文档
- [API 概览](./api/README.md) - 后端 API 说明
- [OCR 测试指南](./api/OCR_TESTING.md) - OCR API 测试
- [DeepSeek 测试指南](./api/DEEPSEEK_TESTING.md) - AI API 测试

### 开发文档
- [开发指南](./DEVELOPMENT.md) - 开发环境配置
- [检查点 3 总结](./CHECKPOINT_3_SUMMARY.md) - UI 集成完成总结
- [项目状态总结](./PROJECT_STATUS_SUMMARY.md) - 整体进度

## 下一步计划

### 立即可做
1. **部署到 Vercel** 🚀
   - 获取 API 密钥
   - 配置环境变量
   - 执行部署
   - 测试生产环境
   - 📖 [详细步骤](./NEXT_STEPS.md)

2. **端到端测试** 🧪
   - 完整扫描流程
   - 错误场景测试
   - 性能测试

### 未来功能（阶段 4-7）
- [ ] 批量处理功能（最多 50 张）
- [ ] 多语言支持（中文/英文）
- [ ] 离线模式
- [ ] 报告导出（PDF/图片）
- [ ] 移动端相机优化
- [ ] 性能优化
- [ ] 完整测试套件

### 项目进度
查看 [PROJECT_PROGRESS.md](./PROJECT_PROGRESS.md) 了解详细进度。

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License
