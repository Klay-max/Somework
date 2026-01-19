# 快速开始 - OCR 测试指南

## 5 分钟快速测试 OCR 功能

### 前置准备

1. **获取阿里云 OCR API 密钥**
   - 访问 [阿里云 RAM 控制台](https://ram.console.aliyun.com/)
   - 创建 AccessKey（AccessKeyId + AccessKeySecret）
   - 开通 OCR 服务

2. **配置环境变量**
   ```bash
   # 复制环境变量模板
   cp .env.example .env.local
   
   # 编辑 .env.local，填入你的密钥
   ALICLOUD_ACCESS_KEY_ID=your_access_key_id
   ALICLOUD_ACCESS_KEY_SECRET=your_access_key_secret
   ```

### 测试步骤

#### 方法 1: 使用测试脚本（推荐）

```bash
# 安装依赖
npm install --legacy-peer-deps

# 运行 OCR 测试
node api/test-ocr-with-image.js
```

#### 方法 2: 启动开发服务器

```bash
# 启动后端 API 服务
node api/test-server.js

# 在另一个终端运行测试
node api/test-api.js
```

#### 方法 3: 测试完整流程

```bash
# 启动 Web 开发服务器
npm run web

# 访问 http://localhost:8081
# 点击"启动视觉诊断"
# 上传答题卡图片
# 查看识别结果
```

### 预期结果

**成功响应示例**：
```json
{
  "success": true,
  "data": {
    "text": "1. A\n2. B\n3. C\n...",
    "confidence": 0.95,
    "processingTime": 2500
  }
}
```

**错误响应示例**：
```json
{
  "success": false,
  "error": {
    "code": "OCR_FAILED",
    "message": "OCR 识别失败",
    "details": "..."
  }
}
```

### 常见问题

#### 1. 签名错误
```
Error: SignatureDoesNotMatch
```
**解决方案**：
- 检查 AccessKeyId 和 AccessKeySecret 是否正确
- 确保没有多余的空格或换行符
- 检查系统时间是否正确

#### 2. 权限错误
```
Error: Forbidden.RAM
```
**解决方案**：
- 确保 RAM 用户有 OCR 服务权限
- 在 RAM 控制台添加 `AliyunOCRFullAccess` 权限

#### 3. 图片格式错误
```
Error: InvalidImage
```
**解决方案**：
- 支持格式：JPEG, PNG
- 图片大小：< 4MB
- 图片尺寸：建议 < 1920px

#### 4. 网络超时
```
Error: RequestTimeout
```
**解决方案**：
- 检查网络连接
- 增加超时时间（默认 10 秒）
- 使用更小的图片

### 测试图片要求

**答题卡格式**：
- 清晰的选择题答案（A/B/C/D）
- 标准格式：`1. A`, `2. B`, `3. C`
- 避免模糊、倾斜、反光

**示例答题卡内容**：
```
1. A
2. B
3. C
4. D
5. A
...
```

### 下一步

测试成功后，可以：
1. 测试 DeepSeek AI 分析功能（参考 `api/DEEPSEEK_TESTING.md`）
2. 测试完整扫描流程
3. 部署到 Vercel（参考 `QUICKSTART_DEPLOYMENT.md`）

### 相关文档

- [OCR 详细测试指南](./api/OCR_TESTING.md)
- [API 文档](./api/README.md)
- [部署指南](./DEPLOYMENT_GUIDE.md)

---

**更新时间**: 2026-01-14  
**状态**: 可用 ✅
