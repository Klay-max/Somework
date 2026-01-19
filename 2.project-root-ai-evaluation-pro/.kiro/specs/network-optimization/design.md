# 网络性能优化 - 设计文档

## 1. 设计概述

本设计文档描述了网络性能优化的技术实现方案，旨在解决 Android 应用的网络超时和连接失败问题。

### 1.1 设计目标

- **减少网络传输大小**: 图片压缩到 < 500KB
- **避免重复请求**: 实现智能缓存机制
- **优化并发控制**: 限制同时请求数量
- **改善用户体验**: 实时进度反馈

### 1.2 技术栈

- **图片处理**: expo-image-manipulator (移动端), Canvas API (Web)
- **缓存**: @react-native-async-storage/async-storage
- **请求管理**: 自定义请求队列
- **状态管理**: React Hooks

---

## 2. 架构设计

### 2.1 系统架构

```
┌─────────────────────────────────────────────────────────┐
│                      Camera.tsx                          │
│                    (用户界面层)                           │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  RequestQueue                            │
│                 (请求队列层)                              │
│  - 优先级管理                                             │
│  - 并发控制                                               │
│  - 超时处理                                               │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│               AIAnalysisService                          │
│                 (业务逻辑层)                              │
│  - OCR 识别                                               │
│  - 错误分析                                               │
│  - 路径生成                                               │
└────────┬───────────────────────────────┬────────────────┘
         │                               │
         ▼                               ▼
┌──────────────────┐          ┌──────────────────┐
│  CacheService    │          │   ApiClient      │
│   (缓存层)        │          │  (网络层)         │
│  - 内存缓存       │          │  - HTTP 请求      │
│  - 持久化缓存     │          │  - 重试机制       │
│  - LRU 策略      │          │  - 错误处理       │
└──────────────────┘          └──────────────────┘
         │
         ▼
┌──────────────────┐
│  AsyncStorage    │
│   (存储层)        │
└──────────────────┘
```

### 2.2 数据流

```
用户上传图片
    │
    ▼
图片压缩 (ImageProcessor)
    │
    ▼
生成图片哈希
    │
    ▼
检查缓存 (CacheService)
    │
    ├─ 缓存命中 ──────────────┐
    │                         │
    └─ 缓存未命中             │
        │                     │
        ▼                     │
    加入请求队列              │
        │                     │
        ▼                     │
    执行 API 请求             │
        │                     │
        ▼                     │
    保存到缓存                │
        │                     │
        └─────────────────────┘
                │
                ▼
            返回结果
```

---

## 3. 核心模块设计

### 3.1 ImageProcessor (图片处理器)

**职责**: 压缩图片到目标大小

**关键参数**:
- `maxSizeMB`: 0.5 (500KB)
- `maxWidth`: 1280px
- `quality`: 0.7 (初始质量)

**压缩策略**:
1. 首先调整图片尺寸（最大宽度 1280px）
2. 使用初始质量 0.7 压缩
3. 检查压缩后大小
4. 如果仍超过目标，降低质量继续压缩
5. 最多尝试 5 次

**代码示例**:
```typescript
// Web 平台
const base64 = canvas.toDataURL('image/jpeg', quality).split(',')[1];

// 移动平台
const result = await ImageManipulator.manipulateAsync(
  uri,
  [{ resize: { width: 1280 } }],
  { compress: quality, format: SaveFormat.JPEG }
);
```

### 3.2 CacheService (缓存服务)

**职责**: 管理 API 响应缓存

**缓存策略**:
- **两级缓存**: 内存缓存 + 持久化缓存
- **LRU 淘汰**: 按时间排序，删除最旧的
- **大小限制**: 最大 50MB
- **时间限制**: 最长 7 天

**缓存键生成**:
```typescript
// 图片哈希（基于前 1000 个字符）
const hash = hashImage(imageBase64);
const cacheKey = `ocr_${hash}`;

// 分析结果哈希（基于评分结果）
const cacheKey = `analyze_${JSON.stringify(gradingResult).substring(0, 100)}`;
```

**缓存流程**:
1. 检查内存缓存
2. 检查持久化缓存
3. 如果命中，返回缓存数据
4. 如果未命中，执行请求
5. 保存结果到缓存
6. 定期清理过期缓存

### 3.3 RequestQueue (请求队列)

**职责**: 管理并发请求

**队列配置**:
- `maxConcurrent`: 2 (最多同时 2 个请求)
- `timeout`: 30000ms (30 秒超时)

**优先级**:
```typescript
enum RequestPriority {
  LOW = 0,      // 低优先级
  NORMAL = 1,   // 普通优先级
  HIGH = 2,     // 高优先级
  URGENT = 3,   // 紧急优先级
}
```

**队列管理**:
1. 请求加入队列时按优先级排序
2. 检查当前运行数量
3. 如果未达到上限，立即执行
4. 如果达到上限，等待队列
5. 请求完成后，继续处理队列

**使用示例**:
```typescript
const result = await globalRequestQueue.enqueue(
  () => AIAnalysisService.recognizeAnswerSheet(base64),
  RequestPriority.HIGH
);
```

### 3.4 AIAnalysisService (AI 分析服务)

**职责**: 调用后端 API 并集成缓存

**缓存集成**:
```typescript
// OCR 识别
const cacheKey = await CacheService.hashImage(imageBase64);
const cached = await CacheService.get(`ocr_${cacheKey}`);
if (cached) return cached;

// 执行请求
const result = await apiClient.post('/ocr', { imageBase64 });

// 保存缓存
await CacheService.set(`ocr_${cacheKey}`, result);
```

**超时配置**:
- OCR: 30 秒
- 分析: 30 秒
- 路径: 30 秒

---

## 4. 用户界面设计

### 4.1 进度显示

**进度划分**:
- 10%: 图像压缩
- 25%: OCR 识别
- 45%: 答案提取
- 55%: 评分
- 70%: 错误分析
- 85%: 学习路径
- 95%: 生成报告
- 100%: 完成

**UI 组件**:
```typescript
<View style={styles.progressContainer}>
  <Text style={styles.scanningText}>正在分析...</Text>
  <Text style={styles.progressText}>{progress}</Text>
  <View style={styles.loadingBar}>
    <View style={[styles.loadingBarFill, { width: `${progressPercent}%` }]} />
  </View>
  <Text style={styles.percentText}>{progressPercent}%</Text>
</View>
```

### 4.2 错误处理

**错误类型**:
- `TIMEOUT`: 请求超时
- `NETWORK_ERROR`: 网络错误
- `OCR_ERROR`: OCR 识别失败
- `INVALID_RESPONSE`: 响应格式错误

**错误提示**:
```typescript
switch (error.errorCode) {
  case 'TIMEOUT':
    message = '请求超时，请检查网络连接后重试';
    break;
  case 'NETWORK_ERROR':
    message = '网络错误，请检查网络连接';
    break;
  case 'OCR_ERROR':
    message = 'OCR 识别失败，请确保图像清晰';
    break;
}
```

---

## 5. 性能优化

### 5.1 图片压缩优化

**优化前**:
- 最大宽度: 1920px
- 压缩质量: 0.8
- 平均大小: 1-2MB

**优化后**:
- 最大宽度: 1280px
- 压缩质量: 0.7 (自适应)
- 平均大小: < 500KB

**预期效果**:
- 上传时间减少 60-70%
- 网络流量减少 60-70%

### 5.2 缓存优化

**缓存命中率**:
- 目标: > 50%
- 相同图片: 100% 命中
- 相似结果: 50-80% 命中

**响应时间**:
- 缓存命中: < 100ms
- 缓存未命中: 10-30s

**预期效果**:
- 重复请求响应时间减少 99%
- 服务器负载减少 50%

### 5.3 并发控制

**优化前**:
- 无并发控制
- 可能同时发送多个请求
- 容易导致超时

**优化后**:
- 最多同时 2 个请求
- 按优先级排队
- 避免请求过载

**预期效果**:
- 成功率提升 20-30%
- 超时率降低 50%

---

## 6. 测试计划

### 6.1 单元测试

- [ ] ImageProcessor 压缩测试
- [ ] CacheService 缓存测试
- [ ] RequestQueue 队列测试

### 6.2 集成测试

- [ ] 完整扫描流程测试
- [ ] 缓存命中测试
- [ ] 并发请求测试

### 6.3 性能测试

- [ ] 压缩时间测试
- [ ] OCR 识别时间测试
- [ ] 总处理时间测试
- [ ] 缓存命中率测试

### 6.4 用户体验测试

- [ ] 进度显示测试
- [ ] 错误提示测试
- [ ] 网络异常测试

---

## 7. 部署计划

### 7.1 Web 部署

1. 提交代码到 Git
2. 推送到 GitHub
3. Vercel 自动部署
4. 验证功能正常

### 7.2 Android 部署

1. 运行 `eas build --platform android`
2. 等待构建完成
3. 下载 APK
4. 安装测试
5. 验证性能改进

---

## 8. 监控和维护

### 8.1 性能监控

- 监控平均响应时间
- 监控成功率
- 监控缓存命中率
- 监控错误率

### 8.2 日志记录

- 记录压缩日志
- 记录缓存日志
- 记录队列日志
- 记录错误日志

### 8.3 持续优化

- 根据监控数据调整参数
- 优化缓存策略
- 优化压缩算法
- 改进错误处理

---

**文档版本**: 1.0.0  
**创建日期**: 2026-01-19  
**负责人**: AI Assistant  
**状态**: 已完成
