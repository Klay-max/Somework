# DeepSeek API 测试指南

## 任务完成状态

✅ **任务 3.1**: 实现基础 API 调用 - 已完成
✅ **任务 3.2**: 实现错误分析功能 - 已完成
✅ **任务 3.3**: 实现学习路径生成功能 - 已完成

## 实现内容

### 1. DeepSeek API 客户端 (`api/lib/deepseek-client.ts`)

实现了完整的 DeepSeek Chat API 集成：

#### 基础 API 调用
- `callDeepSeekAPI()`: 主函数，调用 DeepSeek Chat API
  - 环境变量验证
  - 请求参数配置（model, temperature, max_tokens）
  - 强制 JSON 输出格式
  - 完整的错误处理（认证失败、频率限制、服务器错误）
  - 15 秒超时控制

#### 错误分析功能
- `analyzeErrors()`: 分析学生错题模式
  - 构造分析 Prompt（`buildAnalysisPrompt()`）
  - 调用 DeepSeek API
  - 解析 JSON 响应
  - 验证响应结构（`validateAnalysis()`）
  - 返回结构化分析结果

#### 学习路径生成功能
- `generateLearningPath()`: 生成个性化学习路径
  - 构造路径 Prompt（`buildPathPrompt()`）
  - 调用 DeepSeek API
  - 解析 JSON 响应
  - 验证响应结构（`validateLearningPath()`）
  - 返回 3-5 个学习阶段

### 2. API 端点集成

#### `api/analyze.ts` (更新)
- 集成 `analyzeErrors()` 函数
- 完整的请求参数验证
- 错误处理

#### `api/generate-path.ts` (更新)
- 集成 `generateLearningPath()` 函数
- 完整的请求参数验证
- 错误处理

### 3. 测试工具

#### `api/test-deepseek.js` (新建)
完整的 AI 功能测试脚本：
- 测试错误分析 API
- 测试学习路径生成 API
- 显示详细的分析结果
- 完整的错误处理

## 环境配置

### 1. 获取 DeepSeek API 密钥

1. 访问 [DeepSeek 官网](https://www.deepseek.com/)
2. 注册账号并登录
3. 进入 **API Keys** 页面
4. 创建新的 API Key
5. 复制 API Key

### 2. 配置环境变量

在 `.env` 文件中添加：

```bash
# DeepSeek API 配置
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
DEEPSEEK_API_ENDPOINT=https://api.deepseek.com/v1/chat/completions
```

### 3. Vercel 部署配置

在 Vercel Dashboard 中配置环境变量：

```
DEEPSEEK_API_KEY = sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
DEEPSEEK_API_ENDPOINT = https://api.deepseek.com/v1/chat/completions
```

## 测试方法

### 方法 1: 使用测试脚本

```bash
# 1. 启动测试服务器
node api/test-server.js

# 2. 在另一个终端运行测试
node api/test-deepseek.js
```

### 方法 2: 使用 curl 测试

#### 测试错误分析

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "gradeResult": {
      "totalScore": 75,
      "maxScore": 100,
      "accuracy": 75,
      "correctCount": 15,
      "wrongCount": 5,
      "wrongAnswers": [
        {
          "questionId": "3",
          "userAnswer": "B",
          "correctAnswer": "C",
          "knowledgePoints": ["虚拟语气", "条件句"]
        }
      ],
      "dimensionScores": [
        { "dimension": "听力", "score": 18, "maxScore": 20 },
        { "dimension": "语法", "score": 12, "maxScore": 20 }
      ]
    },
    "language": "zh"
  }'
```

#### 测试学习路径生成

```bash
curl -X POST http://localhost:3000/api/generate-path \
  -H "Content-Type: application/json" \
  -d '{
    "errorAnalysis": {
      "surfaceIssues": ["计算粗心", "审题不清"],
      "rootCauses": ["基础知识不牢固"],
      "aiComment": "本次测评显示...",
      "knowledgeGaps": [
        {
          "knowledgePoint": "虚拟语气",
          "difficulty": 4,
          "mastered": false,
          "detail": "需要加强理解"
        }
      ]
    },
    "language": "zh"
  }'
```

## 预期响应

### 错误分析响应

```json
{
  "success": true,
  "data": {
    "surfaceIssues": [
      "计算粗心",
      "审题不清",
      "时间管理不当"
    ],
    "rootCauses": [
      "基础知识不牢固",
      "逻辑推理能力弱"
    ],
    "aiComment": "本次测评显示你在语法方面表现良好，但在虚拟语气和时态运用上还需要加强。建议重点复习这两个知识点，并通过大量练习来巩固。同时，要注意审题，避免因粗心而失分。",
    "knowledgeGaps": [
      {
        "knowledgePoint": "虚拟语气",
        "difficulty": 4,
        "mastered": false,
        "detail": "虚拟语气是英语语法中的难点，需要理解不同时态下的虚拟语气形式，并通过练习掌握其用法"
      },
      {
        "knowledgePoint": "完成时态",
        "difficulty": 3,
        "mastered": false,
        "detail": "完成时态的使用场景需要进一步理解，特别是现在完成时和过去完成时的区别"
      }
    ]
  }
}
```

### 学习路径响应

```json
{
  "success": true,
  "data": {
    "stages": [
      {
        "id": "1",
        "title": "基础修复阶段",
        "content": [
          "复习虚拟语气的基本概念和用法",
          "完成虚拟语气专项练习 50 题",
          "观看虚拟语气讲解视频",
          "整理虚拟语气笔记和错题集"
        ],
        "videoLinks": [],
        "duration": "2周"
      },
      {
        "id": "2",
        "title": "强化训练阶段",
        "content": [
          "完成时态综合练习 100 题",
          "进行虚拟语气和时态混合练习",
          "参加在线模拟测试",
          "分析错题并总结规律"
        ],
        "videoLinks": [],
        "duration": "2周"
      },
      {
        "id": "3",
        "title": "冲刺提升阶段",
        "content": [
          "完成历年真题练习",
          "进行限时模拟考试",
          "查漏补缺，巩固薄弱环节",
          "制定考试策略和时间分配方案"
        ],
        "videoLinks": [],
        "duration": "1周"
      }
    ]
  }
}
```

## 功能特性

### 错误分析

**输入**:
- 评分结果（总分、正确率、错题详情、维度得分）

**输出**:
- 表层问题（3 个）
- 深层原因（2 个）
- AI 点评（200-500 字）
- 知识点缺口（包含难度、掌握情况、详细说明）

**Prompt 设计**:
- 结构化输入（总体情况 + 维度得分 + 错题详情）
- 强制 JSON 输出格式
- 明确的输出要求

### 学习路径生成

**输入**:
- 错误分析结果

**输出**:
- 3-5 个学习阶段
- 每个阶段包含 3-5 个学习内容
- 预计时长
- 视频资源链接（可选）

**Prompt 设计**:
- 基于错误分析的个性化路径
- 按照"基础修复 → 强化训练 → 冲刺提升"顺序
- 优先解决最薄弱的知识点

## 常见问题

### 1. 缺少 API 密钥

**错误**: `Missing DeepSeek API key`

**解决**: 确保 `.env` 文件存在且包含正确的 DeepSeek API 密钥

### 2. 认证失败

**错误**: `DeepSeek API authentication failed`

**原因**: API 密钥不正确或已过期

**解决**: 
- 检查 API 密钥是否正确
- 在 DeepSeek 官网重新生成 API 密钥

### 3. 频率限制

**错误**: `DeepSeek API rate limit exceeded`

**原因**: 请求过于频繁

**解决**: 
- 等待一段时间后重试
- 升级 DeepSeek API 套餐

### 4. 响应超时

**错误**: `DeepSeek API Timeout`

**原因**: 
- 网络连接问题
- DeepSeek 服务响应慢
- Prompt 过长

**解决**: 
- 检查网络连接
- 增加超时时间（当前 15 秒）
- 简化 Prompt

### 5. JSON 解析失败

**错误**: `Failed to parse AI response: Invalid JSON format`

**原因**: DeepSeek 返回的不是有效的 JSON

**解决**: 
- 检查 Prompt 是否明确要求 JSON 格式
- 使用 `response_format: { type: 'json_object' }` 强制 JSON 输出
- 重试请求

## 成本估算

### DeepSeek API 定价

- **输入**: ¥0.001/1K tokens
- **输出**: ¥0.002/1K tokens

### 预估成本

**单次分析**:
- 输入: ~2K tokens (评分结果 + Prompt)
- 输出: ~1K tokens (分析结果)
- 成本: ¥0.001 × 2 + ¥0.002 × 1 = ¥0.004

**单次路径生成**:
- 输入: ~1.5K tokens (错误分析 + Prompt)
- 输出: ~1K tokens (学习路径)
- 成本: ¥0.001 × 1.5 + ¥0.002 × 1 = ¥0.0035

**完整流程**: ¥0.004 + ¥0.0035 = ¥0.0075/次

**月度成本** (1000 次):
- 1000 次 × ¥0.0075 = ¥7.5/月

## 性能优化

### 1. Prompt 优化

- 使用简洁明确的 Prompt
- 避免冗余信息
- 使用结构化输入

### 2. 响应验证

- 严格验证响应结构
- 提供友好的错误消息
- 自动重试机制（待实现）

### 3. 缓存策略

- 缓存相同输入的结果（待实现）
- 设置合理的缓存过期时间
- 减少重复 API 调用

## 下一步

任务 3 已完成，接下来可以继续：

- **任务 4**: 实现后端 API 端点
  - 4.1 更新 POST /api/ocr（已完成）
  - 4.2 更新 POST /api/analyze（已完成）
  - 4.3 更新 POST /api/generate-path（已完成）
  - 4.4 编写 API 端点集成测试（可选）

- **任务 5**: 实现安全和性能优化
  - 5.1 实现频率限制中间件（已完成）
  - 5.2 实现缓存管理器
  - 5.3 实现请求超时控制

## 参考文档

- [DeepSeek API 文档](https://platform.deepseek.com/api-docs/)
- [DeepSeek Chat API](https://platform.deepseek.com/api-docs/chat/)
- [设计文档](../.kiro/specs/ai-integration/design.md)
- [任务列表](../.kiro/specs/ai-integration/tasks.md)

## 验证清单

- [x] TypeScript 编译通过
- [x] 基础 API 调用实现
- [x] 错误分析功能实现
- [x] 学习路径生成功能实现
- [x] Prompt 设计完成
- [x] 响应验证完成
- [x] 错误处理完善
- [x] API 端点集成
- [x] 测试脚本可用
- [x] 文档完善
