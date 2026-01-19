# 设计文档 - AI 功能集成

## 概述

本文档描述 VISION-CORE 项目 AI 功能集成的技术设计，包括系统架构、API 集成方案、数据流程和核心算法。系统将集成阿里云 OCR API 用于答题卡识别，DeepSeek API 用于智能分析和学习路径生成。

## 技术栈

### 前端
- React Native + Expo (现有)
- TypeScript
- Expo Camera (图像采集)
- Expo Image Picker (图像选择)
- React Native Reanimated (动画)
- Axios (HTTP 客户端)

### 后端
- **方案 A**: Node.js + Express (传统服务器)
- **方案 B**: Vercel Serverless Functions (推荐，无需维护服务器)
- TypeScript
- 环境变量管理 (dotenv)

### 第三方服务
- **阿里云 OCR API**: 通用文字识别 (General OCR)
- **DeepSeek API**: deepseek-chat 模型

### 数据存储
- **本地存储**: AsyncStorage (用户配置、缓存)
- **云端存储**: Supabase 或 Firebase (可选，用于历史记录同步)

## 系统架构


```
┌─────────────────────────────────────────────────────────────────┐
│                         用户设备 (前端)                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  React Native App (Expo)                                 │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────────┐ │  │
│  │  │ Camera     │  │ Image      │  │ Report Display     │ │  │
│  │  │ Component  │  │ Upload     │  │ Component          │ │  │
│  │  └────────────┘  └────────────┘  └────────────────────┘ │  │
│  │         │               │                    ▲            │  │
│  │         └───────────────┴────────────────────┘            │  │
│  │                         │                                 │  │
│  │                    API Client                             │  │
│  │                    (Axios)                                │  │
│  └──────────────────────────│──────────────────────────────┘  │
└────────────────────────────│────────────────────────────────┘
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    后端 API 服务 (Serverless)                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Vercel Functions / Express Server                       │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────────┐ │  │
│  │  │ /api/ocr   │  │ /api/      │  │ /api/generate-     │ │  │
│  │  │            │  │ analyze    │  │ path               │ │  │
│  │  └────────────┘  └────────────┘  └────────────────────┘ │  │
│  │         │               │                    │            │  │
│  └─────────│───────────────│────────────────────│───────────┘  │
│            │               │                    │               │
│     ┌──────▼──────┐ ┌─────▼──────┐      ┌─────▼──────┐       │
│     │ OCR Service │ │ AI Service │      │ AI Service │       │
│     │ Client      │ │ Client     │      │ Client     │       │
│     └──────┬──────┘ └─────┬──────┘      └─────┬──────┘       │
└────────────│──────────────│────────────────────│──────────────┘
             │              │                    │
             │ API Key      │ API Key            │ API Key
             ▼              ▼                    ▼
┌─────────────────────┐ ┌──────────────────────────────────────┐
│  阿里云 OCR API      │ │      DeepSeek API                    │
│  ┌────────────────┐ │ │  ┌────────────┐  ┌────────────────┐ │
│  │ 通用文字识别    │ │ │  │ 错误分析   │  │ 学习路径生成   │ │
│  │ (General OCR)  │ │ │  │ (Chat API) │  │ (Chat API)     │ │
│  └────────────────┘ │ │  └────────────┘  └────────────────┘ │
└─────────────────────┘ └──────────────────────────────────────┘
```

### 架构说明

1. **前端层**: React Native 应用，负责图像采集、用户交互和结果展示
2. **后端层**: Serverless 函数或 Express 服务器，负责 API 密钥管理和请求转发
3. **服务层**: 阿里云 OCR 和 DeepSeek API，提供核心 AI 能力

## 组件设计

### 1. 图像处理模块 (ImageProcessor)


**职责**: 图像预处理、压缩、格式转换

**接口**:
```typescript
interface ImageProcessor {
  // 压缩图像到指定大小
  compressImage(uri: string, maxSizeMB: number): Promise<string>;
  
  // 转换图像为 Base64
  convertToBase64(uri: string): Promise<string>;
  
  // 图像质量检测
  checkImageQuality(uri: string): Promise<QualityResult>;
}

interface QualityResult {
  isValid: boolean;
  brightness: number;  // 0-100
  sharpness: number;   // 0-100
  warnings: string[];
}
```

**实现要点**:
- 使用 `expo-image-manipulator` 进行图像压缩
- 目标大小: 最大 4MB (阿里云 OCR 限制)
- 支持 JPEG/PNG 格式
- 图像质量检测: 检查亮度、清晰度

### 2. OCR 服务客户端 (OCRClient)

**职责**: 调用阿里云 OCR API 识别答题卡

**接口**:
```typescript
interface OCRClient {
  // 识别答题卡
  recognizeAnswerSheet(imageBase64: string): Promise<OCRResult>;
}

interface OCRResult {
  success: boolean;
  text: string;           // 原始识别文本
  regions: TextRegion[];  // 文本区域
  confidence: number;     // 置信度 0-1
  error?: string;
}

interface TextRegion {
  text: string;
  boundingBox: BoundingBox;
  confidence: number;
}

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}
```

**阿里云 OCR API 调用流程**:
1. 构造请求参数 (AccessKeyId, Signature, ImageURL/ImageBase64)
2. 发送 POST 请求到 `https://ocr-api.cn-shanghai.aliyuncs.com`
3. 解析响应 JSON
4. 提取文本和位置信息

### 3. 答案提取器 (AnswerExtractor)


**职责**: 从 OCR 结果中提取结构化答案

**接口**:
```typescript
interface AnswerExtractor {
  // 提取选择题答案
  extractMultipleChoice(ocrResult: OCRResult, template: AnswerSheetTemplate): Answer[];
  
  // 提取填空题答案
  extractFillInBlank(ocrResult: OCRResult, template: AnswerSheetTemplate): Answer[];
}

interface Answer {
  questionId: string;
  userAnswer: string;    // "A", "B", "C", "D" 或文本
  confidence: number;
  position: BoundingBox;
}

interface AnswerSheetTemplate {
  type: 'standard' | 'custom';
  questionCount: number;
  questionRegions: QuestionRegion[];
}

interface QuestionRegion {
  questionId: string;
  boundingBox: BoundingBox;
  answerType: 'single' | 'multiple' | 'text';
}
```

**提取算法**:
1. 根据答题卡模板定位题号区域
2. 在每个题号区域内查找选项标记 (A/B/C/D)
3. 使用正则表达式匹配答案模式
4. 计算置信度 (基于 OCR 置信度和模式匹配度)

### 4. 答案评分器 (AnswerGrader)

**职责**: 对比用户答案和标准答案，计算得分

**接口**:
```typescript
interface AnswerGrader {
  // 评分
  grade(userAnswers: Answer[], standardAnswers: StandardAnswer[]): GradeResult;
}

interface StandardAnswer {
  questionId: string;
  correctAnswer: string;
  points: number;
  knowledgePoints: string[];  // 关联的知识点
}

interface GradeResult {
  totalScore: number;
  maxScore: number;
  accuracy: number;           // 正确率
  correctCount: number;
  wrongCount: number;
  wrongAnswers: WrongAnswer[];
  dimensionScores: DimensionScore[];
}

interface WrongAnswer {
  questionId: string;
  userAnswer: string;
  correctAnswer: string;
  knowledgePoints: string[];
}

interface DimensionScore {
  dimension: string;  // "听力", "语法", "阅读", "完形", "逻辑"
  score: number;
  maxScore: number;
}
```

### 5. AI 分析服务 (AIAnalysisService)


**职责**: 调用 DeepSeek API 进行错误分析和学习路径生成

**接口**:
```typescript
interface AIAnalysisService {
  // 分析错题模式
  analyzeErrors(gradeResult: GradeResult): Promise<ErrorAnalysis>;
  
  // 生成学习路径
  generateLearningPath(errorAnalysis: ErrorAnalysis): Promise<LearningPath>;
}

interface ErrorAnalysis {
  surfaceIssues: string[];      // 表层问题
  rootCauses: string[];         // 深层原因
  aiComment: string;            // AI 点评
  knowledgeGaps: KnowledgeGap[];
}

interface KnowledgeGap {
  knowledgePoint: string;
  difficulty: number;  // 1-5
  mastered: boolean;
  detail: string;
}

interface LearningPath {
  stages: LearningStage[];
  totalDuration: string;
}

interface LearningStage {
  id: string;
  title: string;
  content: string[];
  videoLinks: string[];
  duration: string;
}
```

**DeepSeek API 调用流程**:

1. **错误分析 Prompt**:
```typescript
const analysisPrompt = `
你是一位专业的教育分析师。请分析以下学生的答题情况：

错题信息：
${wrongAnswers.map(w => `题目${w.questionId}: 学生答案${w.userAnswer}, 正确答案${w.correctAnswer}, 知识点${w.knowledgePoints.join(',')}`).join('\n')}

总体情况：
- 总分: ${gradeResult.totalScore}/${gradeResult.maxScore}
- 正确率: ${gradeResult.accuracy}%
- 各维度得分: ${JSON.stringify(gradeResult.dimensionScores)}

请以 JSON 格式返回分析结果：
{
  "surfaceIssues": ["表层问题1", "表层问题2"],
  "rootCauses": ["深层原因1", "深层原因2"],
  "aiComment": "综合点评（200-500字）",
  "knowledgeGaps": [
    {
      "knowledgePoint": "知识点名称",
      "difficulty": 3,
      "mastered": false,
      "detail": "详细说明"
    }
  ]
}
`;
```

2. **学习路径生成 Prompt**:
```typescript
const pathPrompt = `
基于以下错误分析，生成个性化学习路径：

${JSON.stringify(errorAnalysis, null, 2)}

要求：
1. 生成 3-5 个学习阶段
2. 每个阶段包含具体学习内容和预计时长
3. 按照"基础修复 → 强化训练 → 冲刺提升"的顺序
4. 优先解决最薄弱的知识点

请以 JSON 格式返回：
{
  "stages": [
    {
      "id": "1",
      "title": "阶段标题",
      "content": ["学习内容1", "学习内容2"],
      "videoLinks": [],
      "duration": "2周"
    }
  ]
}
`;
```

### 6. 后端 API 端点设计


#### POST /api/ocr

**请求**:
```typescript
{
  imageBase64: string;
  templateId?: string;  // 答题卡模板 ID
}
```

**响应**:
```typescript
{
  success: boolean;
  data: {
    answers: Answer[];
    confidence: number;
  };
  error?: string;
}
```

**实现** (Vercel Serverless Function):
```typescript
import { VercelRequest, VercelResponse } from '@vercel/node';
import { callAliCloudOCR } from '../lib/alicloud';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { imageBase64, templateId } = req.body;
  
  try {
    // 调用阿里云 OCR
    const ocrResult = await callAliCloudOCR(imageBase64);
    
    // 提取答案
    const answers = extractAnswers(ocrResult, templateId);
    
    return res.status(200).json({
      success: true,
      data: { answers, confidence: ocrResult.confidence }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
```

#### POST /api/analyze

**请求**:
```typescript
{
  gradeResult: GradeResult;
  language?: 'zh' | 'en';
}
```

**响应**:
```typescript
{
  success: boolean;
  data: ErrorAnalysis;
  error?: string;
}
```

#### POST /api/generate-path

**请求**:
```typescript
{
  errorAnalysis: ErrorAnalysis;
  language?: 'zh' | 'en';
}
```

**响应**:
```typescript
{
  success: boolean;
  data: LearningPath;
  error?: string;
}
```

## 数据流程


### 完整流程

```
1. 用户拍摄/上传答题卡
   ↓
2. 前端: 图像预处理 (压缩、质量检测)
   ↓
3. 前端 → 后端: POST /api/ocr (imageBase64)
   ↓
4. 后端 → 阿里云: 调用 OCR API
   ↓
5. 后端: 解析 OCR 结果，提取答案
   ↓
6. 后端 → 前端: 返回答案列表
   ↓
7. 前端: 对比标准答案，计算得分
   ↓
8. 前端 → 后端: POST /api/analyze (gradeResult)
   ↓
9. 后端 → DeepSeek: 调用 Chat API (错误分析)
   ↓
10. 后端 → 前端: 返回错误分析
    ↓
11. 前端 → 后端: POST /api/generate-path (errorAnalysis)
    ↓
12. 后端 → DeepSeek: 调用 Chat API (学习路径生成)
    ↓
13. 后端 → 前端: 返回学习路径
    ↓
14. 前端: 显示完整报告
```

### 状态管理

使用 React Context + Hooks 管理应用状态:

```typescript
interface AppState {
  // 当前扫描状态
  scanState: {
    isScanning: boolean;
    progress: number;  // 0-100
    stage: 'idle' | 'uploading' | 'ocr' | 'grading' | 'analyzing' | 'complete';
  };
  
  // 当前报告
  currentReport: ReportData | null;
  
  // 历史报告
  historyReports: ReportData[];
  
  // 用户配置
  userConfig: {
    language: 'zh' | 'en';
    defaultTemplateId: string;
  };
  
  // 缓存
  cache: {
    ocrResults: Map<string, OCRResult>;  // 图像哈希 → OCR 结果
    analysisResults: Map<string, ErrorAnalysis>;
  };
}
```

## 安全方案


### 1. API 密钥管理

**环境变量配置** (`.env`):
```bash
# 阿里云 OCR
ALICLOUD_ACCESS_KEY_ID=your_access_key_id
ALICLOUD_ACCESS_KEY_SECRET=your_access_key_secret
ALICLOUD_OCR_ENDPOINT=https://ocr-api.cn-shanghai.aliyuncs.com

# DeepSeek API
DEEPSEEK_API_KEY=your_deepseek_api_key
DEEPSEEK_API_ENDPOINT=https://api.deepseek.com/v1/chat/completions

# 安全配置
ALLOWED_ORIGINS=https://yourdomain.com,http://localhost:19006
RATE_LIMIT_MAX=10  # 每分钟最多 10 次请求
```

**密钥保护规则**:
1. ❌ 绝不在前端代码中硬编码 API 密钥
2. ✅ 所有 API 调用必须通过后端转发
3. ✅ 使用环境变量存储密钥
4. ✅ 在 `.gitignore` 中排除 `.env` 文件
5. ✅ 生产环境使用 Vercel 环境变量管理

### 2. 请求验证

**CORS 配置**:
```typescript
// api/middleware/cors.ts
export function corsMiddleware(req: VercelRequest, res: VercelResponse) {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
  const origin = req.headers.origin;
  
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}
```

**频率限制**:
```typescript
// api/middleware/rateLimit.ts
import { RateLimiter } from 'limiter';

const limiters = new Map<string, RateLimiter>();

export function rateLimitMiddleware(req: VercelRequest, res: VercelResponse) {
  const clientId = req.headers['x-client-id'] || req.socket.remoteAddress;
  
  if (!limiters.has(clientId)) {
    limiters.set(clientId, new RateLimiter({
      tokensPerInterval: 10,
      interval: 'minute'
    }));
  }
  
  const limiter = limiters.get(clientId)!;
  
  if (!limiter.tryRemoveTokens(1)) {
    return res.status(429).json({ error: 'Too many requests' });
  }
}
```

### 3. 数据加密

**传输加密**:
- 所有 API 请求使用 HTTPS
- 图像数据使用 Base64 编码传输

**存储加密** (可选):
```typescript
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!;

export function encryptData(data: string): string {
  return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
}

export function decryptData(encrypted: string): string {
  const bytes = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}
```

## 错误处理策略


### 错误分类

```typescript
enum ErrorType {
  // 网络错误
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  
  // OCR 错误
  OCR_FAILED = 'OCR_FAILED',
  IMAGE_QUALITY_LOW = 'IMAGE_QUALITY_LOW',
  IMAGE_TOO_LARGE = 'IMAGE_TOO_LARGE',
  
  // AI 错误
  AI_ANALYSIS_FAILED = 'AI_ANALYSIS_FAILED',
  AI_TIMEOUT = 'AI_TIMEOUT',
  
  // 业务错误
  INVALID_TEMPLATE = 'INVALID_TEMPLATE',
  NO_ANSWERS_FOUND = 'NO_ANSWERS_FOUND',
  
  // 系统错误
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  API_QUOTA_EXCEEDED = 'API_QUOTA_EXCEEDED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}
```

### 错误处理流程

```typescript
class ErrorHandler {
  static handle(error: Error, context: string): UserFriendlyError {
    // 记录错误日志
    console.error(`[${context}]`, error);
    
    // 转换为用户友好的错误信息
    if (error.message.includes('timeout')) {
      return {
        type: ErrorType.TIMEOUT,
        message: '请求超时，请检查网络连接后重试',
        retryable: true,
      };
    }
    
    if (error.message.includes('rate limit')) {
      return {
        type: ErrorType.RATE_LIMIT_EXCEEDED,
        message: '请求过于频繁，请稍后再试',
        retryable: true,
        retryAfter: 60,  // 秒
      };
    }
    
    // 默认错误
    return {
      type: ErrorType.INTERNAL_ERROR,
      message: '系统错误，请稍后重试',
      retryable: true,
    };
  }
}

interface UserFriendlyError {
  type: ErrorType;
  message: string;
  retryable: boolean;
  retryAfter?: number;
}
```

### 重试机制

```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // 指数退避
      const delay = baseDelay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
}
```

## 性能优化方案


### 1. 图像优化

```typescript
// 图像压缩配置
const IMAGE_COMPRESSION_CONFIG = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.8,
  format: 'jpeg',
};

// 自适应压缩
async function adaptiveCompress(uri: string): Promise<string> {
  let quality = 0.9;
  let compressed = await compressImage(uri, quality);
  
  // 如果超过 4MB，继续压缩
  while (getFileSize(compressed) > 4 * 1024 * 1024 && quality > 0.5) {
    quality -= 0.1;
    compressed = await compressImage(uri, quality);
  }
  
  return compressed;
}
```

### 2. 缓存策略

```typescript
// 缓存管理器
class CacheManager {
  private cache = new Map<string, CacheEntry>();
  
  // 设置缓存 (带过期时间)
  set(key: string, value: any, ttl: number = 3600000) {
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttl,
    });
  }
  
  // 获取缓存
  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    // 检查是否过期
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.value;
  }
  
  // 生成图像哈希 (用于缓存 OCR 结果)
  async hashImage(uri: string): Promise<string> {
    const base64 = await convertToBase64(uri);
    return CryptoJS.SHA256(base64).toString();
  }
}

interface CacheEntry {
  value: any;
  expiry: number;
}
```

### 3. 并发控制

```typescript
// 批量处理时的并发限制
class ConcurrencyController {
  private queue: (() => Promise<any>)[] = [];
  private running = 0;
  
  constructor(private maxConcurrency: number = 3) {}
  
  async add<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await task();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      this.process();
    });
  }
  
  private async process() {
    if (this.running >= this.maxConcurrency || this.queue.length === 0) {
      return;
    }
    
    this.running++;
    const task = this.queue.shift()!;
    
    await task();
    this.running--;
    
    this.process();
  }
}
```

### 4. 请求优化

```typescript
// 请求超时配置
const API_TIMEOUT_CONFIG = {
  ocr: 10000,      // 10 秒
  analyze: 15000,  // 15 秒
  path: 12000,     // 12 秒
};

// 带超时的请求
async function requestWithTimeout<T>(
  promise: Promise<T>,
  timeout: number
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    ),
  ]);
}
```

## 阿里云 OCR API 集成详解


### API 文档

- **服务**: 通用文字识别 (RecognizeGeneral)
- **端点**: `https://ocr-api.cn-shanghai.aliyuncs.com`
- **方法**: POST
- **认证**: AccessKey + Signature

### 请求签名算法

```typescript
import crypto from 'crypto';

function generateSignature(
  accessKeySecret: string,
  stringToSign: string
): string {
  const hmac = crypto.createHmac('sha1', accessKeySecret);
  hmac.update(stringToSign);
  return hmac.digest('base64');
}

function buildStringToSign(params: Record<string, string>): string {
  // 1. 按参数名排序
  const sortedKeys = Object.keys(params).sort();
  
  // 2. 构造规范化查询字符串
  const canonicalizedQueryString = sortedKeys
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
  
  // 3. 构造待签名字符串
  return `POST&${encodeURIComponent('/')}&${encodeURIComponent(canonicalizedQueryString)}`;
}
```

### 完整调用示例

```typescript
async function callAliCloudOCR(imageBase64: string): Promise<OCRResult> {
  const accessKeyId = process.env.ALICLOUD_ACCESS_KEY_ID!;
  const accessKeySecret = process.env.ALICLOUD_ACCESS_KEY_SECRET!;
  
  // 公共参数
  const commonParams = {
    Format: 'JSON',
    Version: '2021-07-07',
    AccessKeyId: accessKeyId,
    SignatureMethod: 'HMAC-SHA1',
    Timestamp: new Date().toISOString(),
    SignatureVersion: '1.0',
    SignatureNonce: Math.random().toString(36).substring(2),
  };
  
  // 业务参数
  const businessParams = {
    Action: 'RecognizeGeneral',
    body: imageBase64,
  };
  
  // 合并参数
  const allParams = { ...commonParams, ...businessParams };
  
  // 生成签名
  const stringToSign = buildStringToSign(allParams);
  const signature = generateSignature(accessKeySecret, stringToSign);
  
  // 发送请求
  const response = await axios.post(
    'https://ocr-api.cn-shanghai.aliyuncs.com',
    allParams,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      params: {
        Signature: signature,
      },
    }
  );
  
  // 解析响应
  return parseOCRResponse(response.data);
}

function parseOCRResponse(data: any): OCRResult {
  if (data.Code !== 'Success') {
    throw new Error(`OCR failed: ${data.Message}`);
  }
  
  const result = data.Data;
  
  return {
    success: true,
    text: result.content,
    regions: result.prism_wordsInfo?.map((word: any) => ({
      text: word.word,
      boundingBox: {
        x: word.pos[0].x,
        y: word.pos[0].y,
        width: word.pos[2].x - word.pos[0].x,
        height: word.pos[2].y - word.pos[0].y,
      },
      confidence: word.prob,
    })) || [],
    confidence: result.prism_wordsInfo?.[0]?.prob || 0,
  };
}
```

## DeepSeek API 集成详解


### API 文档

- **服务**: Chat Completions API
- **端点**: `https://api.deepseek.com/v1/chat/completions`
- **方法**: POST
- **认证**: Bearer Token
- **模型**: `deepseek-chat`

### 完整调用示例

```typescript
async function callDeepSeekAPI(
  prompt: string,
  systemPrompt: string = '你是一位专业的教育分析师'
): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY!;
  
  const response = await axios.post(
    'https://api.deepseek.com/v1/chat/completions',
    {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' },  // 强制 JSON 输出
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      timeout: 15000,
    }
  );
  
  return response.data.choices[0].message.content;
}
```

### 错误分析实现

```typescript
async function analyzeErrors(gradeResult: GradeResult): Promise<ErrorAnalysis> {
  const prompt = buildAnalysisPrompt(gradeResult);
  const systemPrompt = `
你是一位专业的教育分析师，擅长分析学生的答题情况并提供个性化建议。
请严格按照 JSON 格式返回分析结果，不要包含任何额外的文本。
  `.trim();
  
  const responseText = await callDeepSeekAPI(prompt, systemPrompt);
  
  try {
    const analysis = JSON.parse(responseText);
    return validateAnalysis(analysis);
  } catch (error) {
    throw new Error('Failed to parse AI response');
  }
}

function buildAnalysisPrompt(gradeResult: GradeResult): string {
  return `
请分析以下学生的答题情况：

## 总体情况
- 总分: ${gradeResult.totalScore}/${gradeResult.maxScore}
- 正确率: ${gradeResult.accuracy}%
- 正确题数: ${gradeResult.correctCount}
- 错误题数: ${gradeResult.wrongCount}

## 各维度得分
${gradeResult.dimensionScores.map(d => 
  `- ${d.dimension}: ${d.score}/${d.maxScore} (${Math.round(d.score/d.maxScore*100)}%)`
).join('\n')}

## 错题详情
${gradeResult.wrongAnswers.map((w, i) => `
${i + 1}. 题目 ${w.questionId}
   - 学生答案: ${w.userAnswer}
   - 正确答案: ${w.correctAnswer}
   - 涉及知识点: ${w.knowledgePoints.join(', ')}
`).join('\n')}

请以 JSON 格式返回分析结果：
\`\`\`json
{
  "surfaceIssues": ["表层问题1", "表层问题2", "表层问题3"],
  "rootCauses": ["深层原因1", "深层原因2"],
  "aiComment": "综合点评（200-500字，包含优势分析和改进建议）",
  "knowledgeGaps": [
    {
      "knowledgePoint": "知识点名称",
      "difficulty": 3,
      "mastered": false,
      "detail": "详细说明该知识点的重要性和学习建议"
    }
  ]
}
\`\`\`
  `.trim();
}
```

### 学习路径生成实现

```typescript
async function generateLearningPath(
  errorAnalysis: ErrorAnalysis
): Promise<LearningPath> {
  const prompt = buildPathPrompt(errorAnalysis);
  const systemPrompt = `
你是一位专业的学习规划师，擅长根据学生的薄弱环节制定个性化学习路径。
请严格按照 JSON 格式返回学习路径，不要包含任何额外的文本。
  `.trim();
  
  const responseText = await callDeepSeekAPI(prompt, systemPrompt);
  
  try {
    const path = JSON.parse(responseText);
    return validateLearningPath(path);
  } catch (error) {
    throw new Error('Failed to parse AI response');
  }
}

function buildPathPrompt(errorAnalysis: ErrorAnalysis): string {
  return `
基于以下错误分析，生成个性化学习路径：

## 表层问题
${errorAnalysis.surfaceIssues.map((issue, i) => `${i + 1}. ${issue}`).join('\n')}

## 深层原因
${errorAnalysis.rootCauses.map((cause, i) => `${i + 1}. ${cause}`).join('\n')}

## 知识点缺口
${errorAnalysis.knowledgeGaps.map((gap, i) => `
${i + 1}. ${gap.knowledgePoint} (难度: ${gap.difficulty}/5, 掌握: ${gap.mastered ? '是' : '否'})
   ${gap.detail}
`).join('\n')}

要求：
1. 生成 3-5 个学习阶段
2. 每个阶段包含 3-5 个具体学习内容
3. 按照"基础修复 → 强化训练 → 冲刺提升"的顺序
4. 优先解决最薄弱的知识点
5. 每个阶段提供合理的预计时长

请以 JSON 格式返回：
\`\`\`json
{
  "stages": [
    {
      "id": "1",
      "title": "阶段标题",
      "content": [
        "具体学习内容1",
        "具体学习内容2",
        "具体学习内容3"
      ],
      "videoLinks": [],
      "duration": "2周"
    }
  ]
}
\`\`\`
  `.trim();
}
```

## 测试策略


### 单元测试

```typescript
// 测试图像处理
describe('ImageProcessor', () => {
  it('should compress image to under 4MB', async () => {
    const largeImage = 'path/to/large/image.jpg';
    const compressed = await imageProcessor.compressImage(largeImage, 4);
    const size = await getFileSize(compressed);
    expect(size).toBeLessThan(4 * 1024 * 1024);
  });
  
  it('should detect low quality images', async () => {
    const blurryImage = 'path/to/blurry/image.jpg';
    const quality = await imageProcessor.checkImageQuality(blurryImage);
    expect(quality.isValid).toBe(false);
    expect(quality.warnings).toContain('图像模糊');
  });
});

// 测试答案提取
describe('AnswerExtractor', () => {
  it('should extract multiple choice answers', () => {
    const ocrResult = mockOCRResult();
    const template = standardTemplate();
    const answers = answerExtractor.extractMultipleChoice(ocrResult, template);
    
    expect(answers).toHaveLength(50);
    expect(answers[0].userAnswer).toMatch(/^[A-D]$/);
  });
});

// 测试评分
describe('AnswerGrader', () => {
  it('should calculate correct score', () => {
    const userAnswers = mockUserAnswers();
    const standardAnswers = mockStandardAnswers();
    const result = answerGrader.grade(userAnswers, standardAnswers);
    
    expect(result.totalScore).toBe(85);
    expect(result.accuracy).toBe(85);
    expect(result.wrongCount).toBe(15);
  });
});
```

### 集成测试

```typescript
// 端到端测试
describe('E2E: Complete Flow', () => {
  it('should process answer sheet and generate report', async () => {
    // 1. 上传图像
    const imageUri = 'path/to/answer/sheet.jpg';
    const compressed = await imageProcessor.compressImage(imageUri, 4);
    
    // 2. OCR 识别
    const ocrResult = await ocrClient.recognizeAnswerSheet(compressed);
    expect(ocrResult.success).toBe(true);
    
    // 3. 提取答案
    const answers = answerExtractor.extractMultipleChoice(
      ocrResult,
      standardTemplate()
    );
    expect(answers.length).toBeGreaterThan(0);
    
    // 4. 评分
    const gradeResult = answerGrader.grade(answers, mockStandardAnswers());
    expect(gradeResult.totalScore).toBeGreaterThan(0);
    
    // 5. AI 分析
    const analysis = await aiService.analyzeErrors(gradeResult);
    expect(analysis.surfaceIssues.length).toBeGreaterThan(0);
    
    // 6. 生成学习路径
    const path = await aiService.generateLearningPath(analysis);
    expect(path.stages.length).toBeGreaterThanOrEqual(3);
  }, 30000);  // 30 秒超时
});
```

### Mock 数据

```typescript
// Mock OCR 响应
function mockOCRResult(): OCRResult {
  return {
    success: true,
    text: '1.A 2.B 3.C 4.D ...',
    regions: [
      {
        text: 'A',
        boundingBox: { x: 100, y: 100, width: 20, height: 20 },
        confidence: 0.95,
      },
      // ...
    ],
    confidence: 0.92,
  };
}

// Mock DeepSeek 响应
function mockAIAnalysis(): ErrorAnalysis {
  return {
    surfaceIssues: ['计算粗心', '审题不清'],
    rootCauses: ['基础知识不牢固', '逻辑推理能力弱'],
    aiComment: '本次测评显示...',
    knowledgeGaps: [
      {
        knowledgePoint: '虚拟语气',
        difficulty: 4,
        mastered: false,
        detail: '需要加强虚拟语气的理解和应用',
      },
    ],
  };
}
```

## 部署方案

### Vercel 部署 (推荐)

**优势**:
- 零配置部署
- 自动 HTTPS
- 全球 CDN
- 环境变量管理
- 免费额度充足

**步骤**:
1. 安装 Vercel CLI: `npm i -g vercel`
2. 在项目根目录创建 `vercel.json`:

```json
{
  "functions": {
    "api/**/*.ts": {
      "runtime": "@vercel/node@latest"
    }
  },
  "env": {
    "ALICLOUD_ACCESS_KEY_ID": "@alicloud-access-key-id",
    "ALICLOUD_ACCESS_KEY_SECRET": "@alicloud-access-key-secret",
    "DEEPSEEK_API_KEY": "@deepseek-api-key"
  }
}
```

3. 部署: `vercel --prod`

### 传统服务器部署

**使用 PM2 管理 Node.js 进程**:

```bash
# 安装 PM2
npm install -g pm2

# 启动服务
pm2 start server.js --name vision-core-api

# 设置开机自启
pm2 startup
pm2 save
```

## 成本估算

### 阿里云 OCR

- **定价**: ¥0.01/次 (通用文字识别)
- **免费额度**: 500 次/月
- **预估**: 1000 次/月 = ¥5/月

### DeepSeek API

- **定价**: ¥0.001/1K tokens (输入), ¥0.002/1K tokens (输出)
- **预估**: 每次分析约 2K tokens 输入 + 1K tokens 输出 = ¥0.004/次
- **预估**: 1000 次/月 = ¥4/月

### 总成本

- **开发阶段**: ¥10-20/月
- **生产阶段** (1000 用户): ¥50-100/月

## 正确性属性

*属性是一个特征或行为，应该在系统的所有有效执行中保持为真——本质上是关于系统应该做什么的形式化陈述。属性作为人类可读规范和机器可验证正确性保证之间的桥梁。*

### 属性 1: OCR 识别一致性
*对于任何*相同的答题卡图像，多次调用 OCR API 应该返回相同的识别结果（在置信度阈值内）
**验证: 需求 1.1, 1.5**

### 属性 2: 答案提取完整性
*对于任何*包含 N 道题的答题卡，答案提取器应该返回恰好 N 个答案（或明确标记缺失）
**验证: 需求 1.2**

### 属性 3: 评分准确性
*对于任何*用户答案集合和标准答案集合，评分结果应该满足：正确题数 + 错误题数 = 总题数
**验证: 需求 2.3**

### 属性 4: 得分范围约束
*对于任何*评分结果，总分应该在 [0, 最大分数] 范围内，正确率应该在 [0, 100] 范围内
**验证: 需求 2.3**

### 属性 5: AI 分析结构完整性
*对于任何*错误分析请求，返回的分析结果应该包含所有必需字段（surfaceIssues, rootCauses, aiComment, knowledgeGaps）
**验证: 需求 3.3, 3.4**

### 属性 6: 学习路径阶段顺序
*对于任何*学习路径，阶段应该按照难度递增排序（基础 → 进阶 → 冲刺）
**验证: 需求 5.5**

### 属性 7: API 密钥保护
*对于任何*前端请求，响应中不应该包含任何 API 密钥或敏感凭证
**验证: 需求 6.5, 7.5, 12.2**

### 属性 8: 请求频率限制
*对于任何*客户端，在 1 分钟内的请求次数不应该超过配置的限制（默认 10 次）
**验证: 需求 8.6**

### 属性 9: 错误重试幂等性
*对于任何*可重试的请求，多次重试应该产生相同的结果（不应该重复扣费或产生副作用）
**验证: 需求 10.2, 11.4**

### 属性 10: 缓存一致性
*对于任何*相同的输入（图像哈希），缓存返回的结果应该与直接调用 API 返回的结果一致
**验证: 需求 19.1, 19.2, 19.3**

### 属性 11: 图像大小约束
*对于任何*上传的图像，压缩后的大小应该不超过 4MB（阿里云 OCR 限制）
**验证: 需求 6.3**

### 属性 12: 响应时间约束
*对于任何* OCR 请求，响应时间应该在 5 秒内；对于任何 AI 分析请求，响应时间应该在 10 秒内
**验证: 需求 11.1, 11.2**

### 属性 13: 数据加密传输
*对于任何*包含敏感数据的请求，应该使用 HTTPS 协议传输
**验证: 需求 12.1**

### 属性 14: 错误消息用户友好性
*对于任何*错误情况，返回给用户的错误消息应该是中文且易于理解（不包含技术细节）
**验证: 需求 10.1, 10.2, 10.3, 10.4**

### 属性 15: 批量处理进度准确性
*对于任何*批量处理请求，显示的进度（已完成/总数）应该与实际处理进度一致
**验证: 需求 17.2**

## 错误处理

### 网络错误
- 超时重试（最多 3 次）
- 显示用户友好的错误提示
- 保存已识别的数据，避免重复调用

### OCR 错误
- 图像质量检测前置
- 识别失败时提示用户重新拍摄
- 提供手动输入答案的备选方案

### AI 错误
- 分析超时时使用默认模板
- 解析失败时重试或降级到规则引擎
- 记录错误日志用于优化 prompt

## 测试策略

### 单元测试
- 测试图像处理、答案提取、评分逻辑
- 使用 Jest + React Native Testing Library
- 目标覆盖率: 80%

### 集成测试
- 测试完整的 OCR → 评分 → AI 分析流程
- 使用真实的 API（测试环境）
- 验证数据流转正确性

### 属性测试
- 使用 fast-check 库进行属性测试
- 每个属性运行 100+ 次随机测试
- 验证边界条件和异常情况


## 跨平台部署方案（方案 A）

### 部署策略

```
优先级 1: Web 版本 (立即上线)
  ├─ 平台: Vercel
  ├─ 域名: 自定义域名
  ├─ 时间: 1 天
  └─ 成本: 免费

优先级 2: Android 版本 (1-2 周后)
  ├─ 平台: Google Play Store
  ├─ 备选: APK 直接下载
  ├─ 时间: 3-5 天（审核）
  └─ 成本: $25 (一次性)

优先级 3: iOS 版本 (可选)
  ├─ 平台: App Store
  ├─ 要求: Mac + Apple Developer 账号
  ├─ 时间: 5-7 天（审核）
  └─ 成本: $99/年
```

### 平台特定配置

#### Web 平台配置

**app.json 配置**:
```json
{
  "expo": {
    "web": {
      "favicon": "./assets/favicon.png",
      "bundler": "metro",
      "output": "static",
      "build": {
        "babel": {
          "include": ["@expo/vector-icons"]
        }
      }
    }
  }
}
```

**Vercel 部署配置** (`vercel.json`):
```json
{
  "buildCommand": "expo export:web",
  "outputDirectory": "dist",
  "framework": null,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "functions": {
    "api/**/*.ts": {
      "runtime": "@vercel/node@latest",
      "maxDuration": 30
    }
  },
  "env": {
    "ALICLOUD_ACCESS_KEY_ID": "@alicloud-access-key-id",
    "ALICLOUD_ACCESS_KEY_SECRET": "@alicloud-access-key-secret",
    "DEEPSEEK_API_KEY": "@deepseek-api-key"
  }
}
```

**部署命令**:
```bash
# 1. 构建 Web 版本
npx expo export:web

# 2. 部署到 Vercel
vercel --prod

# 3. 配置自定义域名（在 Vercel Dashboard）
```

#### Android 平台配置

**app.json 配置**:
```json
{
  "expo": {
    "android": {
      "package": "com.visioncore.app",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#000000"
      },
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    }
  }
}
```

**EAS Build 配置** (`eas.json`):
```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleRelease"
      }
    },
    "preview": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

**构建命令**:
```bash
# 1. 安装 EAS CLI
npm install -g eas-cli

# 2. 登录 Expo 账号
eas login

# 3. 配置项目
eas build:configure

# 4. 构建 APK
eas build --platform android --profile production

# 5. 下载 APK
# 构建完成后会提供下载链接
```

**发布到 Google Play**:
```bash
# 1. 构建 AAB (Android App Bundle)
eas build --platform android --profile production

# 2. 在 Google Play Console 创建应用
# 3. 上传 AAB 文件
# 4. 填写应用信息
# 5. 提交审核
```

#### iOS 平台配置

**app.json 配置**:
```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.visioncore.app",
      "buildNumber": "1.0.0",
      "supportsTablet": true,
      "infoPlist": {
        "NSCameraUsageDescription": "需要使用相机扫描答题卡",
        "NSPhotoLibraryUsageDescription": "需要访问相册选择答题卡图片"
      }
    }
  }
}
```

**构建命令** (需要 Mac):
```bash
# 1. 构建 IPA
eas build --platform ios --profile production

# 2. 下载 IPA
# 构建完成后会提供下载链接

# 3. 使用 Transporter 上传到 App Store Connect
```

### 平台差异处理

#### 相机功能

```typescript
// lib/camera/CameraService.ts
import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';

export class CameraService {
  static async captureImage(): Promise<string> {
    if (Platform.OS === 'web') {
      // Web: 使用文件上传
      return this.uploadFromWeb();
    } else {
      // Mobile: 使用相机
      return this.captureFromCamera();
    }
  }
  
  private static async uploadFromWeb(): Promise<string> {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    
    if (!result.canceled) {
      return result.assets[0].uri;
    }
    throw new Error('User cancelled');
  }
  
  private static async captureFromCamera(): Promise<string> {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Camera permission denied');
    }
    
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });
    
    if (!result.canceled) {
      return result.assets[0].uri;
    }
    throw new Error('User cancelled');
  }
}
```

#### 存储功能

```typescript
// lib/storage/StorageService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export class StorageService {
  static async save(key: string, value: any): Promise<void> {
    if (Platform.OS === 'web') {
      // Web: 使用 localStorage
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      // Mobile: 使用 AsyncStorage
      await AsyncStorage.setItem(key, JSON.stringify(value));
    }
  }
  
  static async load(key: string): Promise<any> {
    if (Platform.OS === 'web') {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } else {
      const item = await AsyncStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    }
  }
}
```

### 性能优化（按平台）

#### Web 优化

```typescript
// 代码分割
import { lazy, Suspense } from 'react';

const ReportPage = lazy(() => import('./app/report/[id]'));

// 使用时
<Suspense fallback={<LoadingSpinner />}>
  <ReportPage />
</Suspense>
```

```typescript
// 图片懒加载
import { Image } from 'react-native';

<Image
  source={{ uri: imageUrl }}
  resizeMode="contain"
  // Web 特定优化
  {...(Platform.OS === 'web' && {
    loading: 'lazy',
  })}
/>
```

#### Mobile 优化

```typescript
// 使用 Hermes 引擎（Android）
// app.json
{
  "expo": {
    "android": {
      "jsEngine": "hermes"
    }
  }
}
```

```typescript
// 图片缓存
import { Image } from 'expo-image';

<Image
  source={{ uri: imageUrl }}
  cachePolicy="memory-disk"  // 缓存策略
  transition={200}           // 过渡动画
/>
```

### 测试策略（跨平台）

```typescript
// 平台特定测试
describe('CameraService', () => {
  it('should use file upload on web', () => {
    Platform.OS = 'web';
    // 测试 Web 文件上传逻辑
  });
  
  it('should use camera on mobile', () => {
    Platform.OS = 'ios';
    // 测试移动端相机逻辑
  });
});
```

### 发布检查清单

#### Web 发布前检查
- [ ] 所有 API 端点配置正确
- [ ] 环境变量已设置（Vercel）
- [ ] HTTPS 证书配置
- [ ] 自定义域名配置
- [ ] SEO 元标签设置
- [ ] 性能测试（Lighthouse > 90）
- [ ] 浏览器兼容性测试（Chrome, Safari, Firefox）

#### Android 发布前检查
- [ ] 应用图标和启动画面
- [ ] 权限声明（相机、存储）
- [ ] 签名密钥生成
- [ ] 版本号和版本代码
- [ ] Google Play 开发者账号
- [ ] 应用截图和描述
- [ ] 隐私政策链接

#### iOS 发布前检查
- [ ] Apple Developer 账号（$99/年）
- [ ] 应用图标（所有尺寸）
- [ ] 启动画面
- [ ] 权限描述文本
- [ ] 证书和配置文件
- [ ] App Store 截图（多尺寸）
- [ ] 应用描述和关键词

### 持续集成/持续部署 (CI/CD)

**GitHub Actions 配置** (`.github/workflows/deploy.yml`):
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npx expo export:web
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  build-android:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/release'
    steps:
      - uses: actions/checkout@v3
      - uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: eas build --platform android --non-interactive
```

### 监控和分析

```typescript
// 集成 Google Analytics（跨平台）
import * as Analytics from 'expo-firebase-analytics';

// 记录事件
Analytics.logEvent('scan_complete', {
  platform: Platform.OS,
  score: reportData.score.score,
});

// 记录屏幕浏览
Analytics.setCurrentScreen('report_page');
```

### 成本估算（全平台）

| 项目 | Web | Android | iOS | 总计 |
|------|-----|---------|-----|------|
| 开发者账号 | 免费 | $25 (一次性) | $99/年 | $124 首年 |
| 托管服务 | 免费 (Vercel) | - | - | 免费 |
| API 调用 | $10-20/月 | $10-20/月 | $10-20/月 | $10-20/月 |
| 域名 | $10-15/年 | - | - | $10-15/年 |
| **首年总成本** | - | - | - | **$244 + $120-240** |
| **后续年成本** | - | - | - | **$109 + $120-240** |

### 用户获取策略

1. **Web 版本**（立即）
   - SEO 优化
   - 社交媒体推广
   - 教育论坛分享

2. **Android 版本**（1-2 周后）
   - Google Play 商店优化（ASO）
   - 应用内引导用户评分
   - 社区推广

3. **iOS 版本**（可选）
   - App Store 优化（ASO）
   - 教育类应用推荐
   - 口碑传播
