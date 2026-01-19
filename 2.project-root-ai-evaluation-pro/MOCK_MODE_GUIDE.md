# 🎭 Mock 模式使用指南

## 什么是 Mock 模式？

Mock 模式允许你在**没有网络连接**或**API 不可用**时继续开发和测试应用。所有 API 调用都会被模拟数据替代，让你可以：

- ✅ 测试 UI 和交互流程
- ✅ 开发新功能
- ✅ 演示应用效果
- ✅ 离线工作

---

## 🚀 快速启用 Mock 模式

### 方法 1: 代码中启用（推荐）

Mock 模式**默认已启用**！无需任何配置即可使用。

如果需要切换，编辑 `lib/MockApiService.ts`:

```typescript
export const MOCK_CONFIG = {
  enabled: true,  // 改为 false 禁用 Mock 模式
  // ...
};
```

### 方法 2: 环境变量控制

在 `.env.local` 中添加：

```env
USE_MOCK_API=true   # 启用 Mock 模式
# USE_MOCK_API=false  # 禁用 Mock 模式
```

---

## 📊 Mock 数据说明

### 1. OCR 识别

Mock OCR 会返回一个标准的 50 题答题卡结果：

```
1. A  2. B  3. C  4. D  5. A
6. B  7. C  8. D  9. A  10. B
...
```

**特点**:
- 模拟 1.5 秒识别延迟
- 95% 置信度
- 5% 概率模拟失败（测试错误处理）

### 2. 错误分析

根据错题数量生成不同的分析：

- **0-5 题错误**: 优秀，偶有疏忽
- **6-15 题错误**: 良好，部分知识点需加强
- **16+ 题错误**: 需要系统复习

**特点**:
- 模拟 2 秒分析延迟
- 包含表面问题、根本原因、AI 评语
- 5% 概率模拟失败

### 3. 学习路径

生成 3 阶段学习路径：

1. **基础修复** (2 周)
2. **强化训练** (3 周)
3. **冲刺提升** (2 周)

**特点**:
- 模拟 1.5 秒生成延迟
- 包含学习内容、视频链接、时长
- 5% 概率模拟失败

---

## 🎨 Mock 模式的优势

### 1. 快速开发

不需要等待真实 API 响应，可以快速迭代 UI：

```typescript
// Mock 模式下，这些调用都会立即返回模拟数据
const ocrResult = await AIAnalysisService.recognizeAnswerSheet(image);
const analysis = await AIAnalysisService.analyzeErrors(grading);
const path = await AIAnalysisService.generateLearningPath(analysis);
```

### 2. 离线工作

即使没有网络，也能继续开发：

- ✅ 测试扫描流程
- ✅ 测试报告页面
- ✅ 测试历史记录
- ✅ 测试所有 UI 组件

### 3. 稳定测试

Mock 数据是可预测的，便于测试：

- 固定的答案模式
- 可控的错误率
- 一致的分析结果

### 4. 演示效果

向他人展示应用时，不需要真实的 API：

- 快速响应
- 完整流程
- 专业效果

---

## 🔧 自定义 Mock 数据

### 修改 Mock 配置

编辑 `lib/MockApiService.ts`:

```typescript
export const MOCK_CONFIG = {
  enabled: true,
  delay: {
    ocr: 1500,      // 修改 OCR 延迟
    analysis: 2000,  // 修改分析延迟
    path: 1500,      // 修改路径延迟
  },
  successRate: 0.95, // 修改成功率（0.95 = 95%）
};
```

### 修改 Mock 答案

编辑 `lib/MockApiService.ts` 中的 `performOCR` 方法：

```typescript
const mockText = `
1. A  2. B  3. C  4. D  5. A
// 修改这里的答案
`;
```

### 修改 Mock 分析

编辑 `lib/MockApiService.ts` 中的 `analyzeErrors` 方法：

```typescript
surfaceIssues = ['你的自定义问题'];
rootCauses = ['你的自定义原因'];
aiComment = '你的自定义评语';
```

### 修改 Mock 学习路径

编辑 `lib/mockData.ts` 中的 `generateMockLearningPath` 函数。

---

## 🔄 切换模式

### 开发时使用 Mock

```typescript
// lib/MockApiService.ts
export const MOCK_CONFIG = {
  enabled: true,  // 开发时启用
  // ...
};
```

### 生产环境使用真实 API

```typescript
// lib/MockApiService.ts
export const MOCK_CONFIG = {
  enabled: false,  // 生产环境禁用
  // ...
};
```

### 动态切换

在代码中动态切换：

```typescript
import { setMockEnabled } from './lib/MockApiService';

// 启用 Mock
setMockEnabled(true);

// 禁用 Mock
setMockEnabled(false);
```

---

## 📝 使用示例

### 完整流程测试

```typescript
import { AIAnalysisService } from './lib/AIAnalysisService';
import { setMockEnabled } from './lib/MockApiService';

// 启用 Mock 模式
setMockEnabled(true);

// 测试完整流程
async function testFullFlow() {
  // 1. OCR 识别
  const ocrResult = await AIAnalysisService.recognizeAnswerSheet('mock-image');
  console.log('OCR 结果:', ocrResult);
  
  // 2. 提取答案和评分
  // ... (使用本地逻辑)
  
  // 3. 错误分析
  const analysis = await AIAnalysisService.analyzeErrors(gradingResult);
  console.log('分析结果:', analysis);
  
  // 4. 学习路径
  const path = await AIAnalysisService.generateLearningPath(analysis);
  console.log('学习路径:', path);
}

testFullFlow();
```

---

## 🐛 调试 Mock 模式

### 查看 Mock 状态

```typescript
import { isMockEnabled, getMockConfig } from './lib/MockApiService';

console.log('Mock 模式:', isMockEnabled());
console.log('Mock 配置:', getMockConfig());
```

### 查看控制台日志

Mock 模式会输出详细日志：

```
[AIAnalysisService] Mock 模式: 启用
[MockAPI] 模拟 OCR 识别...
[MockAPI] 模拟错误分析...
[MockAPI] 模拟学习路径生成...
```

---

## ⚠️ 注意事项

### 1. Mock 数据的局限性

- Mock 数据是固定的，不会根据输入变化
- 不能测试真实的 API 错误情况
- 不能测试网络延迟和超时

### 2. 切换到真实 API

当网络问题解决后，记得切换回真实 API：

```typescript
// lib/MockApiService.ts
export const MOCK_CONFIG = {
  enabled: false,  // 禁用 Mock
  // ...
};
```

### 3. 生产环境

**务必确保生产环境禁用 Mock 模式！**

检查方法：
```cmd
# 查看 Mock 配置
type lib\MockApiService.ts | findstr "enabled"
```

应该看到：
```typescript
enabled: false,  // 生产环境必须是 false
```

---

## 🎯 最佳实践

### 1. 开发流程

```
开发新功能 → 使用 Mock 模式 → 快速迭代 UI
     ↓
测试完成 → 切换真实 API → 集成测试
     ↓
部署前 → 确认禁用 Mock → 生产部署
```

### 2. 团队协作

- 提交代码前确认 Mock 模式状态
- 在 README 中说明如何切换模式
- 使用环境变量控制（推荐）

### 3. 测试策略

- Mock 模式：测试 UI 和交互
- 真实 API：测试集成和性能
- 两者结合：全面测试

---

## 📚 相关文件

- `lib/MockApiService.ts` - Mock API 服务实现
- `lib/mockData.ts` - Mock 数据生成
- `lib/AIAnalysisService.ts` - 集成 Mock 支持
- `NETWORK_TROUBLESHOOTING.md` - 网络问题排查

---

## 🚀 现在开始使用

1. **确认 Mock 模式已启用**
   ```cmd
   # 查看配置
   type lib\MockApiService.ts | findstr "enabled"
   ```

2. **启动应用**
   ```cmd
   npm run web
   ```

3. **测试功能**
   - 上传图片
   - 查看 Mock 数据
   - 测试完整流程

4. **查看日志**
   - 打开浏览器控制台
   - 查看 Mock 模式日志

---

**更新时间**: 2026-01-19  
**Mock 模式状态**: ✅ 已启用  
**适用场景**: 网络不可用、离线开发、快速测试
