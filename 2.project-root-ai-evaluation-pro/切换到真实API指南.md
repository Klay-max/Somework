# 🚀 切换到真实 API 指南

## 当前状态

✅ **真实 API 已完全实现**
- 阿里云 OCR API - 已实现并测试通过
- DeepSeek AI API - 已实现并测试通过
- 所有后端接口 - 已部署到 Vercel

❌ **当前使用 Mock 数据**
- Mock 模式默认启用
- 所有 API 调用返回模拟数据

---

## 🎯 切换步骤

### 步骤 1: 禁用 Mock 模式

编辑 `lib/MockApiService.ts` 文件，将第 15 行的 `enabled` 改为 `false`：

```typescript
export const MOCK_CONFIG = {
  enabled: false, // ⬅️ 改为 false 禁用 Mock 模式
  delay: {
    ocr: 1500,
    analysis: 2000,
    path: 1500,
  },
  successRate: 0.95,
};
```

### 步骤 2: 确认环境变量

检查 `.env.local` 文件是否包含所有必需的 API 密钥：

```env
# 阿里云 OCR API
ALICLOUD_ACCESS_KEY_ID=你的阿里云AccessKeyId
ALICLOUD_ACCESS_KEY_SECRET=你的阿里云AccessKeySecret

# DeepSeek API
DEEPSEEK_API_KEY=你的DeepSeek API密钥
```

如果没有 `.env.local` 文件，从 `.env.example` 复制一份：

```cmd
copy .env.example .env.local
```

然后编辑 `.env.local`，填入真实的 API 密钥。

### 步骤 3: 重启开发服务器

```cmd
# 停止当前服务器（Ctrl+C）
# 然后重新启动
npx expo start --clear
```

### 步骤 4: 测试真实 API

1. **上传真实的答题卡图片**
2. **等待 OCR 识别**（可能需要 5-10 秒）
3. **查看 AI 分析结果**（真实的 DeepSeek 分析）
4. **查看学习路径**（真实的 AI 生成）

---

## 📊 真实 API vs Mock 数据对比

| 功能 | Mock 模式 | 真实 API |
|------|----------|---------|
| **OCR 识别** | 固定答案模式 | 真实图像识别 |
| **响应时间** | 1.5 秒 | 5-10 秒 |
| **准确度** | 100%（模拟） | 实际识别准确度 |
| **错误分析** | 固定模板 | AI 深度分析 |
| **学习路径** | 固定 3 阶段 | 个性化路径 |
| **成本** | 免费 | API 调用费用 |

---

## 🔍 验证真实 API 是否工作

### 方法 1: 查看浏览器控制台

打开浏览器开发者工具（F12），查看 Console 标签：

**Mock 模式**:
```
[AIAnalysisService] Mock 模式: 启用
[MockAPI] 模拟 OCR 识别...
```

**真实 API**:
```
[AIAnalysisService] Mock 模式: 禁用
[API Request] POST /api/ocr
[API Response] 200 OK
```

### 方法 2: 查看 Network 标签

在浏览器开发者工具的 Network 标签中：

**Mock 模式**: 没有真实的网络请求

**真实 API**: 可以看到以下请求：
- `POST /api/ocr` - OCR 识别
- `POST /api/analyze` - 错误分析
- `POST /api/generate-path` - 学习路径

### 方法 3: 查看响应时间

**Mock 模式**: 固定延迟（1.5-2 秒）

**真实 API**: 变化的延迟（5-15 秒，取决于网络和 API 响应）

---

## 🎨 真实 API 的优势

### 1. 真实的 OCR 识别

- ✅ 支持各种答题卡格式
- ✅ 自动识别答案位置
- ✅ 高准确度识别
- ✅ 支持手写和打印

### 2. AI 深度分析

DeepSeek AI 提供：
- 🧠 深度错误分析
- 🎯 精准知识点定位
- 💡 个性化建议
- 📊 多维度评估

### 3. 个性化学习路径

- 📚 根据实际错题生成
- ⏱️ 动态调整学习时长
- 🎯 精准的知识点推荐
- 📈 可追踪的进度目标

---

## ⚙️ API 配置说明

### 阿里云 OCR API

**获取方式**:
1. 访问 [阿里云控制台](https://ram.console.aliyun.com/manage/ak)
2. 创建 AccessKey
3. 开通 OCR 服务

**配置**:
```env
ALICLOUD_ACCESS_KEY_ID=LTAI5t...
ALICLOUD_ACCESS_KEY_SECRET=xxx...
```

**费用**: 
- 前 1000 次/月免费
- 超出后约 ¥0.01/次

### DeepSeek API

**获取方式**:
1. 访问 [DeepSeek 官网](https://platform.deepseek.com/)
2. 注册账号
3. 获取 API Key

**配置**:
```env
DEEPSEEK_API_KEY=sk-xxx...
```

**费用**:
- 新用户有免费额度
- 约 ¥0.001/1K tokens

---

## 🐛 常见问题

### Q1: 切换后报错 "API Key 无效"

**解决方案**:
1. 检查 `.env.local` 文件是否存在
2. 确认 API Key 正确无误
3. 重启开发服务器

### Q2: OCR 识别很慢

**原因**: 真实 API 需要：
- 上传图片到阿里云
- OCR 处理
- 返回结果

**正常时间**: 5-10 秒

**优化建议**:
- 压缩图片大小
- 使用缓存（已实现）

### Q3: 分析结果与 Mock 不同

**这是正常的！** 真实 API 会：
- 根据实际错题分析
- 提供更深入的见解
- 生成个性化建议

### Q4: 想临时切回 Mock 模式

编辑 `lib/MockApiService.ts`:
```typescript
enabled: true, // 改回 true
```

---

## 📈 性能优化

### 已实现的优化

1. **缓存机制** (`lib/CacheService.ts`)
   - OCR 结果缓存
   - 分析结果缓存
   - 学习路径缓存

2. **请求队列** (`lib/RequestQueue.ts`)
   - 并发控制
   - 自动重试
   - 超时处理

3. **网络优化** (`lib/ApiClient.ts`)
   - 请求拦截器
   - 响应拦截器
   - 错误处理

### 使用建议

1. **首次识别**: 会比较慢（5-10 秒）
2. **重复识别**: 使用缓存，秒级响应
3. **批量处理**: 自动队列管理，避免超时

---

## 🔄 混合模式（高级）

如果你想在某些情况下使用 Mock，某些情况下使用真实 API：

### 方法 1: 环境变量控制

在 `lib/MockApiService.ts` 中：

```typescript
export const MOCK_CONFIG = {
  enabled: process.env.USE_MOCK_API === 'true', // 从环境变量读取
  // ...
};
```

然后在 `.env.local` 中：
```env
USE_MOCK_API=false  # 使用真实 API
# USE_MOCK_API=true   # 使用 Mock
```

### 方法 2: 动态切换

在代码中动态切换：

```typescript
import { setMockEnabled } from './lib/MockApiService';

// 根据条件切换
if (isOffline) {
  setMockEnabled(true);  // 离线时使用 Mock
} else {
  setMockEnabled(false); // 在线时使用真实 API
}
```

---

## 📝 测试清单

切换到真实 API 后，测试以下功能：

- [ ] OCR 识别真实答题卡图片
- [ ] 查看真实的错误分析
- [ ] 查看真实的学习路径
- [ ] 测试缓存功能（重复识别同一图片）
- [ ] 测试批量处理
- [ ] 测试历史记录保存
- [ ] 测试多语言支持（中英文）

---

## 🎯 推荐流程

### 开发阶段
```
使用 Mock 模式 → 快速开发 UI → 测试交互流程
```

### 集成测试
```
切换真实 API → 测试完整流程 → 验证功能正确性
```

### 生产部署
```
确认禁用 Mock → 配置 API 密钥 → 部署到生产环境
```

---

## 📚 相关文档

- `MOCK_MODE_GUIDE.md` - Mock 模式详细指南
- `API_INTEGRATION_GUIDE.md` - API 集成文档
- `NETWORK_OPTIMIZATION_SUMMARY.md` - 网络优化说明
- `DEPLOYMENT_GUIDE.md` - 部署指南

---

## 🚀 立即开始

1. **编辑 `lib/MockApiService.ts`**
   ```typescript
   enabled: false, // 禁用 Mock
   ```

2. **确认 `.env.local` 配置**
   ```env
   ALICLOUD_ACCESS_KEY_ID=你的密钥
   DEEPSEEK_API_KEY=你的密钥
   ```

3. **重启服务器**
   ```cmd
   npx expo start --clear
   ```

4. **测试真实 API**
   - 上传答题卡图片
   - 查看真实分析结果

---

**更新时间**: 2026-01-20  
**当前模式**: Mock（需要切换）  
**目标模式**: 真实 API  
**预计切换时间**: 5 分钟

