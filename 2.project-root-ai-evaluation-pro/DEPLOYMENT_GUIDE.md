# VISION-CORE 部署指南

## 📋 部署前准备

### 1. 必需的 API 密钥

在部署之前，你需要准备以下 API 密钥：

#### 阿里云 OCR API
- **Access Key ID**: 你的阿里云 Access Key ID
- **Access Key Secret**: 你的阿里云 Access Key Secret
- **获取方式**: 
  1. 登录阿里云控制台
  2. 访问 RAM 访问控制
  3. 创建 AccessKey
  4. 开通 OCR 服务

#### DeepSeek API
- **API Key**: 你的 DeepSeek API 密钥
- **获取方式**:
  1. 访问 https://platform.deepseek.com/
  2. 注册账号
  3. 在 API Keys 页面创建新密钥

### 2. 环境变量配置

需要在 Vercel 中配置以下环境变量：

```bash
# 阿里云 OCR
ALICLOUD_ACCESS_KEY_ID=your_access_key_id
ALICLOUD_ACCESS_KEY_SECRET=your_access_key_secret

# DeepSeek API
DEEPSEEK_API_KEY=your_deepseek_api_key
```

## 🚀 部署到 Vercel

### 方法 1: 通过 Vercel CLI（推荐）

#### 步骤 1: 安装 Vercel CLI
```bash
npm install -g vercel
```

#### 步骤 2: 登录 Vercel
```bash
vercel login
```

#### 步骤 3: 部署项目
```bash
# 首次部署
vercel

# 生产环境部署
vercel --prod
```

#### 步骤 4: 配置环境变量
```bash
# 方式 1: 通过 CLI
vercel env add ALICLOUD_ACCESS_KEY_ID
vercel env add ALICLOUD_ACCESS_KEY_SECRET
vercel env add DEEPSEEK_API_KEY

# 方式 2: 通过 Vercel Dashboard
# 访问 https://vercel.com/dashboard
# 选择项目 -> Settings -> Environment Variables
```

### 方法 2: 通过 Vercel Dashboard

#### 步骤 1: 连接 Git 仓库
1. 访问 https://vercel.com/new
2. 导入你的 Git 仓库（GitHub/GitLab/Bitbucket）
3. 选择项目根目录

#### 步骤 2: 配置项目
- **Framework Preset**: Other
- **Build Command**: `expo export:web`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

#### 步骤 3: 配置环境变量
在 "Environment Variables" 部分添加：
- `ALICLOUD_ACCESS_KEY_ID`
- `ALICLOUD_ACCESS_KEY_SECRET`
- `DEEPSEEK_API_KEY`

#### 步骤 4: 部署
点击 "Deploy" 按钮开始部署

## 📝 部署后配置

### 1. 验证 API 端点

部署完成后，验证以下端点是否正常工作：

```bash
# 健康检查（如果有）
curl https://your-domain.vercel.app/api/health

# 测试 OCR 端点（需要 Base64 图像）
curl -X POST https://your-domain.vercel.app/api/ocr \
  -H "Content-Type: application/json" \
  -d '{"image": "base64_image_data"}'
```

### 2. 配置自定义域名（可选）

1. 在 Vercel Dashboard 中选择项目
2. 进入 Settings -> Domains
3. 添加自定义域名
4. 按照提示配置 DNS 记录

### 3. 配置 CORS（如果需要）

如果需要从其他域名访问 API，确保 CORS 配置正确：

文件：`api/middleware/cors.ts`
```typescript
const allowedOrigins = [
  'https://your-domain.vercel.app',
  'https://your-custom-domain.com',
  // 开发环境
  'http://localhost:8081',
];
```

## 🧪 测试部署

### 1. 功能测试清单

- [ ] 首页加载正常
- [ ] 扫描页面可以上传图片
- [ ] OCR 识别功能正常
- [ ] AI 分析功能正常
- [ ] 学习路径生成正常
- [ ] 报告页面显示正常
- [ ] 历史记录功能正常
- [ ] 统计数据显示正常

### 2. API 测试

使用提供的测试脚本：

```bash
# 测试 OCR API
node api/test-ocr-with-image.js

# 测试 DeepSeek API
node api/test-deepseek.js

# 测试完整 API
node api/test-api.js
```

### 3. 性能测试

```bash
# 测试性能
node api/test-performance.js
```

## 🔧 常见问题

### 问题 1: 构建失败

**错误**: `expo export:web` 命令失败

**解决方案**:
1. 确保所有依赖已安装：`npm install`
2. 检查 TypeScript 错误：`npx tsc --noEmit`
3. 本地测试构建：`npx expo export:web`

### 问题 2: API 端点 404

**错误**: API 端点返回 404

**解决方案**:
1. 检查 `vercel.json` 配置
2. 确保 API 文件在 `api/` 目录下
3. 检查函数配置：
```json
{
  "functions": {
    "api/**/*.ts": {
      "runtime": "@vercel/node@latest"
    }
  }
}
```

### 问题 3: 环境变量未生效

**错误**: API 密钥未定义

**解决方案**:
1. 在 Vercel Dashboard 中检查环境变量
2. 确保变量名称正确
3. 重新部署项目：`vercel --prod`

### 问题 4: CORS 错误

**错误**: 跨域请求被阻止

**解决方案**:
1. 检查 `api/middleware/cors.ts`
2. 添加你的域名到 `allowedOrigins`
3. 重新部署

### 问题 5: 函数超时

**错误**: Function execution timed out

**解决方案**:
1. 增加超时时间（vercel.json）:
```json
{
  "functions": {
    "api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```
2. 优化 API 调用逻辑
3. 考虑使用缓存

## 📊 监控和日志

### 1. Vercel 日志

查看实时日志：
```bash
vercel logs
```

或在 Vercel Dashboard 中查看：
- 访问项目页面
- 点击 "Deployments"
- 选择部署记录
- 查看 "Functions" 日志

### 2. 错误追踪

建议集成错误追踪服务（可选）：
- Sentry
- LogRocket
- Datadog

### 3. 性能监控

Vercel 提供内置的性能监控：
- 访问项目 Dashboard
- 查看 "Analytics" 标签
- 监控响应时间、错误率等

## 🔐 安全建议

### 1. API 密钥管理
- ✅ 使用环境变量存储密钥
- ✅ 不要在代码中硬编码密钥
- ✅ 定期轮换 API 密钥
- ✅ 限制 API 密钥权限

### 2. 频率限制
- ✅ 已实现：10 次/分钟
- 可根据需要调整：`api/middleware/rateLimit.ts`

### 3. CORS 配置
- ✅ 限制允许的域名
- ✅ 不要使用 `*` 通配符

### 4. 输入验证
- ✅ 验证图像大小（4MB 限制）
- ✅ 验证请求格式
- ✅ 防止注入攻击

## 📈 扩展建议

### 1. CDN 配置
Vercel 自动提供全球 CDN，无需额外配置

### 2. 缓存策略
- 静态资源：自动缓存
- API 响应：已实现缓存（`api/lib/cache-manager.ts`）

### 3. 数据库（如果需要）
考虑集成：
- Vercel Postgres
- MongoDB Atlas
- Supabase

### 4. 认证（如果需要）
考虑集成：
- NextAuth.js
- Auth0
- Firebase Auth

## 🎯 部署检查清单

部署前确认：

- [ ] 所有 API 密钥已准备
- [ ] 环境变量已配置
- [ ] 本地测试通过
- [ ] TypeScript 编译无错误
- [ ] 所有依赖已安装
- [ ] vercel.json 配置正确

部署后确认：

- [ ] 网站可以访问
- [ ] API 端点正常工作
- [ ] OCR 识别功能正常
- [ ] AI 分析功能正常
- [ ] 历史记录功能正常
- [ ] 错误处理正常
- [ ] 性能符合预期

## 📞 获取帮助

如果遇到问题：

1. **查看文档**:
   - `api/README.md` - API 文档
   - `api/OCR_TESTING.md` - OCR 测试指南
   - `api/DEEPSEEK_TESTING.md` - DeepSeek 测试指南

2. **查看日志**:
   ```bash
   vercel logs
   ```

3. **Vercel 支持**:
   - 文档: https://vercel.com/docs
   - 社区: https://github.com/vercel/vercel/discussions

## 🎉 部署成功！

部署成功后，你的应用将在以下地址可用：
- **生产环境**: `https://your-project.vercel.app`
- **预览环境**: 每次 Git 推送都会创建预览部署

享受你的 VISION-CORE 应用！

---

**最后更新**: 2026-01-14  
**版本**: 1.0.0
