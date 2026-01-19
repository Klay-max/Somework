# 阿里云 OCR API 测试指南

## 任务完成状态

✅ **任务 2.1**: 实现签名算法 - 已完成
✅ **任务 2.2**: 实现 OCR API 调用 - 已完成

## 实现内容

### 1. 签名算法 (`api/lib/alicloud-ocr.ts`)

实现了阿里云 API 签名所需的核心函数：

- `generateSignature()`: 生成 HMAC-SHA1 签名
- `percentEncode()`: URL 编码（符合阿里云规范）
- `buildStringToSign()`: 构造待签名字符串
- `generateCommonParams()`: 生成公共参数

### 2. OCR API 调用 (`api/lib/alicloud-ocr.ts`)

实现了完整的 OCR API 调用流程：

- `callAliCloudOCR()`: 主函数，调用阿里云 OCR API
  - 验证环境变量
  - 构造请求参数
  - 生成签名
  - 发送 HTTP POST 请求
  - 解析响应
  - 错误处理（网络错误、超时、API 错误）

- `parseOCRResponse()`: 解析 OCR API 响应
  - 提取识别文本
  - 解析文本区域和边界框
  - 计算平均置信度

### 3. OCR 端点集成 (`api/ocr.ts`)

更新了 OCR API 端点：

- 集成 `callAliCloudOCR()` 函数
- 返回原始识别文本和文本区域（用于调试）
- 完整的错误处理

### 4. 类型定义更新 (`api/types.ts`)

添加了调试字段：

- `rawText`: 原始识别文本
- `regions`: 文本区域数组
- `TextRegion`: 文本区域接口

## 环境配置

在使用 OCR 功能前，需要配置阿里云凭证：

### 1. 创建 `.env` 文件

```bash
# 阿里云 OCR 配置
ALICLOUD_ACCESS_KEY_ID=your_access_key_id_here
ALICLOUD_ACCESS_KEY_SECRET=your_access_key_secret_here
ALICLOUD_OCR_ENDPOINT=https://ocr-api.cn-shanghai.aliyuncs.com

# DeepSeek API 配置（暂未使用）
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# 安全配置
ALLOWED_ORIGINS=http://localhost:19006,http://localhost:3000
RATE_LIMIT_MAX=10
```

### 2. 获取阿里云凭证

1. 登录 [阿里云控制台](https://www.aliyun.com/)
2. 进入 **访问控制 (RAM)** → **用户**
3. 创建新用户或使用现有用户
4. 为用户添加 **AliyunOCRFullAccess** 权限
5. 创建 AccessKey，获取 `AccessKeyId` 和 `AccessKeySecret`

### 3. Vercel 部署配置

在 Vercel Dashboard 中配置环境变量：

```
ALICLOUD_ACCESS_KEY_ID = your_access_key_id
ALICLOUD_ACCESS_KEY_SECRET = your_access_key_secret
ALICLOUD_OCR_ENDPOINT = https://ocr-api.cn-shanghai.aliyuncs.com
```

## 测试方法

### 方法 1: 使用测试服务器

```bash
# 1. 启动测试服务器
node api/test-server.js

# 2. 在另一个终端运行测试
node api/test-api.js
```

### 方法 2: 使用 curl 测试

```bash
# 准备一个图像的 Base64 编码
# 可以使用在线工具: https://www.base64-image.de/

curl -X POST http://localhost:3000/api/ocr \
  -H "Content-Type: application/json" \
  -d '{
    "imageBase64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
  }'
```

### 方法 3: 使用 Postman

1. 创建新的 POST 请求
2. URL: `http://localhost:3000/api/ocr`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
```json
{
  "imageBase64": "your_base64_encoded_image_here"
}
```

## 预期响应

### 成功响应

```json
{
  "success": true,
  "data": {
    "answers": [],
    "confidence": 0.92,
    "rawText": "识别出的完整文本内容",
    "regions": [
      {
        "text": "单个文字或词语",
        "boundingBox": {
          "x": 100,
          "y": 50,
          "width": 30,
          "height": 40
        },
        "confidence": 0.95
      }
    ]
  }
}
```

### 错误响应

```json
{
  "success": false,
  "error": "Missing Alibaba Cloud credentials. Please set ALICLOUD_ACCESS_KEY_ID and ALICLOUD_ACCESS_KEY_SECRET"
}
```

## 常见问题

### 1. 缺少环境变量

**错误**: `Missing Alibaba Cloud credentials`

**解决**: 确保 `.env` 文件存在且包含正确的阿里云凭证

### 2. 签名错误

**错误**: `OCR API Error: SignatureDoesNotMatch`

**原因**: 
- AccessKeySecret 不正确
- 时间戳格式错误
- 参数编码问题

**解决**: 
- 检查 AccessKeySecret 是否正确
- 确保系统时间准确
- 检查 `percentEncode()` 函数实现

### 3. 请求超时

**错误**: `OCR API Timeout: No response received`

**原因**: 
- 网络连接问题
- 图像过大
- 阿里云服务响应慢

**解决**: 
- 检查网络连接
- 压缩图像到 4MB 以下
- 增加超时时间（当前 10 秒）

### 4. 图像格式错误

**错误**: `OCR API Error: InvalidParameter.ImageFormat`

**原因**: 图像 Base64 编码格式不正确

**解决**: 
- 确保 Base64 字符串不包含 `data:image/...;base64,` 前缀
- 使用标准的 Base64 编码

## 下一步

任务 2 已完成，接下来可以继续：

- **任务 3**: 实现 DeepSeek API 客户端
  - 3.1 实现基础 API 调用
  - 3.2 实现错误分析功能
  - 3.3 实现学习路径生成功能

- **任务 4**: 实现后端 API 端点
  - 4.1 更新 POST /api/ocr（已部分完成）
  - 4.2 实现 POST /api/analyze
  - 4.3 实现 POST /api/generate-path

## 成本估算

- **阿里云 OCR**: ¥0.01/次
- **免费额度**: 500 次/月
- **预估成本**: 1000 次/月 = ¥5/月

## 参考文档

- [阿里云 OCR API 文档](https://help.aliyun.com/document_detail/442275.html)
- [阿里云 API 签名机制](https://help.aliyun.com/document_detail/315526.html)
- [通用文字识别 API](https://help.aliyun.com/document_detail/442277.html)
