# 🔑 更新 API Keys 安全指南

## ⚠️ 重要安全提示

**永远不要**在以下地方暴露你的 API Keys：
- ❌ 聊天对话中
- ❌ 代码文件中
- ❌ 文档文件中
- ❌ Git 提交中
- ❌ GitHub 仓库中

**只能**在以下地方存储 API Keys：
- ✅ 本地 `.env.local` 文件（被 .gitignore 忽略）
- ✅ Vercel Dashboard 环境变量
- ✅ 你的密码管理器

---

## 📝 更新步骤

### 1. 更新本地开发环境

打开 `.env.local` 文件：
```cmd
notepad .env.local
```

更新为你的新 Keys：
```env
# API Keys
ALICLOUD_ACCESS_KEY_ID=你从阿里云控制台复制的新AccessKey ID
ALICLOUD_ACCESS_KEY_SECRET=你从阿里云控制台复制的新AccessKey Secret
DEEPSEEK_API_KEY=你的DeepSeek API Key
```

**注意**：
- AccessKey ID 通常是 24 个字符，格式类似：`LTAI5tXXXXXXXXXXXXXX`
- AccessKey Secret 通常是 30 个字符
- 直接从阿里云控制台复制，不要手动输入

保存文件后，重启开发服务器。

---

### 2. 更新 Vercel 生产环境

#### 方法 A：使用 Vercel Dashboard（推荐）

1. 访问环境变量页面：
   ```
   https://vercel.com/klays-projects-3394eafa/somegood/settings/environment-variables
   ```

2. 找到每个变量，点击右边的 "Edit" 按钮

3. 更新值：
   - `ALICLOUD_ACCESS_KEY_ID` → 粘贴新的 AccessKey ID
   - `ALICLOUD_ACCESS_KEY_SECRET` → 粘贴新的 AccessKey Secret
   - `DEEPSEEK_API_KEY` → 粘贴你的 DeepSeek Key

4. 确保每个变量都勾选了所有环境：
   - ✅ Production
   - ✅ Preview
   - ✅ Development

5. 点击 "Save"

#### 方法 B：使用命令行

```cmd
# 更新 AccessKey ID
vercel env rm ALICLOUD_ACCESS_KEY_ID production preview development
vercel env add ALICLOUD_ACCESS_KEY_ID production preview development
# 粘贴新的值

# 更新 AccessKey Secret
vercel env rm ALICLOUD_ACCESS_KEY_SECRET production preview development
vercel env add ALICLOUD_ACCESS_KEY_SECRET production preview development
# 粘贴新的值

# 更新 DeepSeek Key
vercel env rm DEEPSEEK_API_KEY production preview development
vercel env add DEEPSEEK_API_KEY production preview development
# 粘贴新的值
```

---

### 3. 重新部署

更新环境变量后，需要重新部署：

```cmd
vercel --prod
```

或者在 Vercel Dashboard 点击 "Redeploy"。

---

### 4. 验证

部署完成后，测试 API 是否正常工作：

```cmd
# 测试 OCR API
node api/test-ocr-simple.js

# 或访问
https://somegood.vercel.app
```

---

## 🔍 如何获取新的 AccessKey

### 阿里云 AccessKey

1. 登录阿里云控制台：https://ram.console.aliyun.com/manage/ak
2. 点击 "创建 AccessKey"
3. **立即复制并保存**：
   - AccessKey ID
   - AccessKey Secret（只显示一次！）
4. 将旧的 AccessKey 禁用或删除

### DeepSeek API Key

1. 登录 DeepSeek 控制台：https://platform.deepseek.com/api_keys
2. 创建新的 API Key
3. 复制并保存

---

## ✅ 安全检查清单

更新完成后，确认：

- [ ] `.env.local` 文件已更新（本地开发）
- [ ] Vercel 环境变量已更新（生产环境）
- [ ] 旧的 AccessKey 已在阿里云控制台禁用
- [ ] 重新部署成功
- [ ] API 测试通过
- [ ] `.env.local` 在 `.gitignore` 中（不会被提交）
- [ ] 没有在任何文档或代码中硬编码 Keys

---

## 🚨 如果 Key 再次泄露

1. **立即**在阿里云控制台禁用该 Key
2. 生成新的 Key
3. 按照本指南重新更新
4. 检查 Git 历史，确保没有提交敏感信息

---

**更新时间**：2026-01-19  
**状态**：等待用户手动更新 Keys
