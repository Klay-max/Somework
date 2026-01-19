# 🔄 重新关联 Vercel 项目

## 当前状态

你的项目现在关联到了错误的 Vercel 项目：`somework`

我们需要清理并重新关联。

---

## 方法 1：完全重置（推荐）⭐

### 步骤 1：删除错误的关联

```cmd
# 删除 .vercel 文件夹
rmdir /s /q .vercel
```

### 步骤 2：重新 link

```cmd
# 重新关联（会提示你选择项目）
vercel link
```

**交互提示**：
1. `Set up and deploy "~\path\to\project"?` → 输入 `Y`
2. `Which scope do you want to deploy to?` → 选择你的账号
3. `Link to existing project?` → 输入 `N`（创建新项目）
4. `What's your project's name?` → 输入 `vision-core-app`（或你喜欢的名字）
5. `In which directory is your code located?` → 直接按 Enter（使用当前目录）

### 步骤 3：配置环境变量

```cmd
# 添加阿里云 OCR AccessKey ID
vercel env add ALICLOUD_ACCESS_KEY_ID
# 粘贴：LTAI5tAQPefJFx33c4BfiHK7

# 添加阿里云 OCR AccessKey Secret
vercel env add ALICLOUD_ACCESS_KEY_SECRET
# 粘贴：v8FbXKxmNjioUq2QgGP727Gjaz7PV9

# 添加 DeepSeek API Key
vercel env add DEEPSEEK_API_KEY
# 粘贴：sk-03fe6c3cfcb84ceeb959124252f2204b
```

**重要**：每个环境变量添加时，会问你要添加到哪些环境：
- 选择 `Production`, `Preview`, `Development` 全部勾选
- 按空格键勾选，Enter 确认

### 步骤 4：部署

```cmd
vercel --prod
```

---

## 方法 2：关联到现有项目

如果你想关联到 Vercel 上已经存在的项目：

### 步骤 1：删除错误的关联

```cmd
rmdir /s /q .vercel
```

### 步骤 2：重新 link 到现有项目

```cmd
vercel link
```

**交互提示**：
1. `Set up and deploy "~\path\to\project"?` → 输入 `Y`
2. `Which scope do you want to deploy to?` → 选择你的账号
3. `Link to existing project?` → 输入 `Y`（关联现有项目）
4. `What's the name of your existing project?` → 输入项目名称

### 步骤 3：配置环境变量

同方法 1 的步骤 3。

### 步骤 4：部署

```cmd
vercel --prod
```

---

## 方法 3：使用 Vercel Dashboard（最安全）

如果命令行还是有问题，直接用网页：

### 步骤 1：清理本地关联

```cmd
rmdir /s /q .vercel
```

### 步骤 2：在 Vercel Dashboard 创建项目

1. 访问 [Vercel Dashboard](https://vercel.com/new)
2. 选择 "Import Git Repository" 或 "Deploy from CLI"
3. 如果选择 CLI：
   - 点击 "Continue with CLI"
   - 会显示一个命令，类似：`vercel --token=xxx`
   - 复制并运行

### 步骤 3：配置环境变量

在 Vercel Dashboard：
1. 进入你的项目
2. 点击 "Settings" → "Environment Variables"
3. 添加三个变量：
   - `ALICLOUD_ACCESS_KEY_ID` = `LTAI5tAQPefJFx33c4BfiHK7`
   - `ALICLOUD_ACCESS_KEY_SECRET` = `v8FbXKxmNjioUq2QgGP727Gjaz7PV9`
   - `DEEPSEEK_API_KEY` = `sk-03fe6c3cfcb84ceeb959124252f2204b`

### 步骤 4：部署

```cmd
vercel --prod
```

---

## 🎯 推荐流程

**最简单的方式**：

```cmd
# 1. 删除错误关联
rmdir /s /q .vercel

# 2. 重新 link（创建新项目）
vercel link

# 3. 添加环境变量
vercel env add ALICLOUD_ACCESS_KEY_ID
vercel env add ALICLOUD_ACCESS_KEY_SECRET
vercel env add DEEPSEEK_API_KEY

# 4. 部署
vercel --prod
```

---

## ⚠️ 注意事项

1. **删除 .vercel 文件夹是安全的**
   - 只是删除本地关联配置
   - 不会删除 Vercel 上的项目

2. **创建新项目 vs 关联现有项目**
   - 如果你在 Vercel 上还没有这个项目 → 选择创建新项目（`N`）
   - 如果你在 Vercel 上已经有了 → 选择关联现有项目（`Y`）

3. **环境变量必须添加**
   - 没有环境变量，API 调用会失败
   - 记得选择所有环境（Production, Preview, Development）

---

## 🚀 准备好了吗？

运行这些命令：

```cmd
rmdir /s /q .vercel
vercel link
```

然后告诉我你看到了什么提示，我会指导你下一步！

---

**更新时间**：2026-01-14  
**当前关联**：somework（错误）  
**目标**：重新关联到正确的项目
