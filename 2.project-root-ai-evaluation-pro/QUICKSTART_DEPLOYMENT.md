# 🚀 快速部署指南

5 分钟内将 VISION-CORE 部署到 Vercel！

## 📋 前置要求

- Node.js 18+ 已安装
- Git 已安装
- 有 Vercel 账号（免费）
- 有阿里云账号
- 有 DeepSeek 账号

## ⚡ 快速开始

### 步骤 1: 获取 API 密钥 (5 分钟)

#### 阿里云 OCR API
1. 访问 https://ram.console.aliyun.com/
2. 创建 AccessKey
3. 记录 `Access Key ID` 和 `Access Key Secret`
4. 开通 OCR 服务: https://www.aliyun.com/product/ocr

#### DeepSeek API
1. 访问 https://platform.deepseek.com/
2. 注册并登录
3. 创建 API Key
4. 记录 API Key

### 步骤 2: 安装 Vercel CLI (1 分钟)

```bash
npm install -g vercel
```

### 步骤 3: 登录 Vercel (1 分钟)

```bash
vercel login
```

按照提示完成登录。

### 步骤 4: 部署项目 (2 分钟)

#### 方式 A: 使用部署脚本（推荐）

**Windows**:
```bash
deploy.bat
```

**Linux/Mac**:
```bash
chmod +x deploy.sh
./deploy.sh
```

#### 方式 B: 手动部署

```bash
# 预览部署
vercel

# 生产部署
vercel --prod
```

### 步骤 5: 配置环境变量 (2 分钟)

部署完成后，在 Vercel Dashboard 中配置环境变量：

1. 访问 https://vercel.com/dashboard
2. 选择你的项目
3. 进入 Settings → Environment Variables
4. 添加以下变量：

```
ALICLOUD_ACCESS_KEY_ID=你的阿里云AccessKeyID
ALICLOUD_ACCESS_KEY_SECRET=你的阿里云AccessKeySecret
DEEPSEEK_API_KEY=你的DeepSeekAPIKey
```

5. 点击 Save
6. 重新部署：`vercel --prod`

### 步骤 6: 测试部署 (1 分钟)

访问你的部署 URL（Vercel 会提供），测试：

- ✅ 首页是否加载
- ✅ 扫描页面是否可用
- ✅ 上传图片测试 OCR

## 🎉 完成！

你的 VISION-CORE 应用已成功部署！

**部署 URL**: `https://your-project.vercel.app`

## 📝 常见问题

### Q: 部署失败怎么办？

**A**: 检查以下几点：
1. Node.js 版本是否 >= 18
2. 所有依赖是否已安装：`npm install`
3. 查看 Vercel 日志：`vercel logs`

### Q: API 不工作怎么办？

**A**: 确认：
1. 环境变量是否正确配置
2. API 密钥是否有效
3. 是否重新部署：`vercel --prod`

### Q: 如何查看日志？

**A**: 
```bash
vercel logs
```

或在 Vercel Dashboard 中查看。

### Q: 如何更新部署？

**A**: 
```bash
git add .
git commit -m "更新"
git push

# 或直接部署
vercel --prod
```

## 📚 更多信息

- 详细部署指南: `DEPLOYMENT_GUIDE.md`
- API 文档: `api/README.md`
- 项目文档: `README.md`

## 🆘 需要帮助？

- Vercel 文档: https://vercel.com/docs
- 项目 Issues: [GitHub Issues]
- 阿里云文档: https://help.aliyun.com/
- DeepSeek 文档: https://platform.deepseek.com/docs

---

**祝你部署顺利！** 🎊
