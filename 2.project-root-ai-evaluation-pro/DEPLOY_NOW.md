# 🚀 立即部署到 Vercel

## ✅ 构建测试成功！

你的项目已经成功构建，现在可以部署到 Vercel 了！

## 📋 部署步骤

### 第 1 步：获取 API 密钥（30 分钟）

在部署之前，你需要获取两个 API 密钥：

#### 1. 阿里云 OCR API 密钥

**步骤**：
1. 访问 [阿里云官网](https://www.aliyun.com/) 并登录（如果没有账号，需要注册）
2. 完成实名认证
3. 访问 [OCR 产品页](https://www.aliyun.com/product/ocr) 并开通服务
4. 访问 [RAM 控制台](https://ram.console.aliyun.com/)
5. 创建 RAM 用户
6. 授予该用户 `AliyunOCRFullAccess` 权限
7. 为该用户创建 AccessKey
8. **保存以下信息**：
   - `AccessKeyId`（类似：LTAI5tXXXXXXXXXXXXXX）
   - `AccessKeySecret`（类似：xxxxxxxxxxxxxxxxxxxxxxxx）

#### 2. DeepSeek API 密钥

**步骤**：
1. 访问 [DeepSeek 平台](https://platform.deepseek.com/) 并注册
2. 登录后，进入 API Keys 页面
3. 点击"创建新密钥"
4. **保存以下信息**：
   - `API Key`（类似：sk-xxxxxxxxxxxxxxxxxxxxxxxx）

### 第 2 步：部署到 Vercel（15 分钟）

你有三种部署方法，选择最适合你的：

#### 方法 1：使用部署脚本（最简单）⭐

**Windows**：
```cmd
deploy.bat
```

**Linux/Mac**：
```bash
chmod +x deploy.sh
./deploy.sh
```

脚本会自动：
- 检查 Vercel CLI 是否安装
- 引导你登录 Vercel
- 提示你配置环境变量
- 执行部署

#### 方法 2：手动部署（推荐）

```bash
# 1. 安装 Vercel CLI（如果还没安装）
npm install -g vercel

# 2. 登录 Vercel
vercel login
# 会打开浏览器，使用 GitHub/GitLab/Bitbucket 账号登录

# 3. 配置环境变量
vercel env add ALICLOUD_ACCESS_KEY_ID
# 粘贴你的阿里云 AccessKeyId

vercel env add ALICLOUD_ACCESS_KEY_SECRET
# 粘贴你的阿里云 AccessKeySecret

vercel env add DEEPSEEK_API_KEY
# 粘贴你的 DeepSeek API Key

# 4. 部署到生产环境
vercel --prod
```

#### 方法 3：通过 Git 自动部署

1. **推送代码到 Git 仓库**：
   ```bash
   git add .
   git commit -m "准备部署"
   git push origin main
   ```

2. **连接 Vercel**：
   - 访问 [Vercel Dashboard](https://vercel.com/new)
   - 点击"Import Project"
   - 选择你的 Git 仓库
   - 点击"Import"

3. **配置环境变量**：
   - 在项目设置中，找到"Environment Variables"
   - 添加以下三个变量：
     - `ALICLOUD_ACCESS_KEY_ID`
     - `ALICLOUD_ACCESS_KEY_SECRET`
     - `DEEPSEEK_API_KEY`

4. **部署**：
   - 点击"Deploy"
   - 等待构建完成（约 2-3 分钟）

### 第 3 步：测试生产环境（30 分钟）

部署完成后，Vercel 会给你一个域名（类似：`your-project.vercel.app`）

#### 基础验证

1. **访问首页**：
   ```
   https://your-project.vercel.app
   ```
   应该看到 VISION-CORE 首页

2. **检查 API 端点**：
   ```bash
   # 检查 OCR 端点
   curl https://your-project.vercel.app/api/ocr
   
   # 检查分析端点
   curl https://your-project.vercel.app/api/analyze
   
   # 检查路径生成端点
   curl https://your-project.vercel.app/api/generate-path
   ```
   
   应该返回类似：
   ```json
   {
     "success": false,
     "error": {
       "code": "MISSING_IMAGE",
       "message": "..."
     }
   }
   ```

#### 功能测试清单

在浏览器中测试以下功能：

- [ ] **首页加载**
  - 访问首页
  - 检查是否显示"SYSTEM ONLINE"
  - 检查统计数据

- [ ] **扫描功能**
  - 点击"启动视觉诊断"
  - 上传一张答题卡图片
  - 等待处理（可能需要 30-45 秒）

- [ ] **OCR 识别**
  - 检查是否显示进度提示
  - 检查是否成功识别答案

- [ ] **AI 分析**
  - 检查是否生成错误分析
  - 检查是否生成学习路径

- [ ] **报告显示**
  - 检查报告页面是否正常显示
  - 检查五维雷达图
  - 检查知识点矩阵
  - 检查提分路径

- [ ] **历史记录**
  - 返回首页
  - 点击"历史记录"
  - 检查是否显示刚才的扫描记录

#### 性能测试

- [ ] 首页加载时间 < 3 秒
- [ ] OCR 识别时间 < 10 秒
- [ ] AI 分析时间 < 15 秒
- [ ] 总流程时间 < 45 秒

### 第 4 步：查看日志和监控

如果遇到问题，可以查看 Vercel 日志：

```bash
# 查看实时日志
vercel logs

# 或在 Vercel Dashboard 查看
# https://vercel.com/your-username/your-project/logs
```

## 🎯 成功标准

部署成功的标志：

✅ 首页可以正常访问  
✅ API 端点返回正确的错误消息（而不是 404）  
✅ 可以上传图片并开始处理  
✅ OCR 识别功能正常  
✅ AI 分析功能正常  
✅ 报告页面正常显示  
✅ 历史记录功能正常  

## ⚠️ 常见问题

### 1. 构建失败

**错误**：`expo export:web can only be used with Webpack`

**解决方案**：
已修复！我已经更新了 `package.json` 和 `vercel.json`。

### 2. API 端点 404

**错误**：访问 `/api/ocr` 返回 404

**解决方案**：
- 检查 `vercel.json` 中的 functions 配置
- 确保 `api/` 目录存在
- 重新部署

### 3. 环境变量未生效

**错误**：API 调用失败，提示缺少密钥

**解决方案**：
```bash
# 检查环境变量
vercel env ls

# 重新添加环境变量
vercel env add ALICLOUD_ACCESS_KEY_ID
vercel env add ALICLOUD_ACCESS_KEY_SECRET
vercel env add DEEPSEEK_API_KEY

# 重新部署
vercel --prod
```

### 4. CORS 错误

**错误**：浏览器控制台显示 CORS 错误

**解决方案**：
- 检查 `api/middleware/cors.ts` 配置
- 确保允许你的域名
- 重新部署

### 5. 函数超时

**错误**：API 调用超时

**解决方案**：
- OCR 和 AI 分析可能需要较长时间
- 检查 `vercel.json` 中的 `maxDuration` 设置（当前为 30 秒）
- 如果需要更长时间，升级到 Vercel Pro 计划

## 📊 部署后检查清单

- [ ] 已获取阿里云 OCR API 密钥
- [ ] 已获取 DeepSeek API 密钥
- [ ] 已安装 Vercel CLI
- [ ] 已登录 Vercel 账号
- [ ] 已配置环境变量
- [ ] 已成功部署
- [ ] 首页可访问
- [ ] API 端点正常
- [ ] 功能测试通过
- [ ] 性能达标

## 🎉 部署成功后

恭喜！你的应用已经上线了！

### 下一步可以做什么？

1. **分享你的应用**
   - 复制 Vercel 域名
   - 分享给朋友测试
   - 收集反馈

2. **配置自定义域名**（可选）
   - 在 Vercel Dashboard 中添加域名
   - 配置 DNS 记录
   - 启用 HTTPS

3. **监控应用性能**
   - 查看 Vercel Analytics
   - 监控 API 调用次数
   - 检查错误日志

4. **继续开发**
   - 修复发现的 Bug
   - 添加新功能
   - 优化性能

5. **构建 Android 版本**
   - 参考 `ANDROID_BUILD_GUIDE.md`
   - 使用 EAS Build 构建 APK
   - 在真实设备上测试

## 📞 需要帮助？

如果遇到问题：

1. **查看文档**：
   - [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - 完整部署指南
   - [QUICKSTART_DEPLOYMENT.md](./QUICKSTART_DEPLOYMENT.md) - 快速部署
   - [api/OCR_TESTING.md](./api/OCR_TESTING.md) - OCR 测试指南

2. **查看日志**：
   ```bash
   vercel logs
   ```

3. **联系支持**：
   - Vercel 支持：[vercel.com/support](https://vercel.com/support)
   - Vercel 文档：[vercel.com/docs](https://vercel.com/docs)

## 🚀 准备好了吗？

现在你可以开始部署了！

**推荐流程**：
1. 获取 API 密钥（30 分钟）
2. 运行 `deploy.bat`（Windows）或 `./deploy.sh`（Linux/Mac）
3. 按照提示操作
4. 等待部署完成
5. 测试你的应用

**预计总时间**：1-2 小时

祝你部署顺利！🎉

---

**更新时间**：2026-01-14  
**构建状态**：✅ 成功  
**准备就绪**：可以立即部署
