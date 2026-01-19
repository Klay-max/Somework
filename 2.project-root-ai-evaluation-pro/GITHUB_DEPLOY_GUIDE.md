# 🚀 通过 GitHub 部署到 Vercel

## 问题说明

如果你遇到了 Vercel 把代码上传到错误的 GitHub 文件夹，这里有两个解决方案。

---

## 方案 A：创建新的独立 GitHub 仓库（推荐）⭐

这是最干净、最简单的方式。

### 步骤 1：初始化 Git 仓库

在你的项目根目录（当前文件夹）运行：

```bash
# 初始化 Git（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: VISION-CORE app ready for deployment"
```

### 步骤 2：在 GitHub 创建新仓库

1. 访问 [GitHub](https://github.com/new)
2. 填写仓库信息：
   - **Repository name**: `vision-core-app`（或你喜欢的名字）
   - **Description**: `AI-powered answer sheet scanning app`
   - **Visibility**: Private（推荐）或 Public
   - ⚠️ **不要**勾选 "Add a README file"
   - ⚠️ **不要**勾选 "Add .gitignore"
   - ⚠️ **不要**勾选 "Choose a license"
3. 点击 "Create repository"

### 步骤 3：推送代码到 GitHub

GitHub 会显示一些命令，复制并运行：

```bash
# 添加远程仓库（替换成你的 GitHub 用户名和仓库名）
git remote add origin https://github.com/YOUR_USERNAME/vision-core-app.git

# 推送代码
git branch -M main
git push -u origin main
```

**示例**（假设你的 GitHub 用户名是 `zhangsan`）：
```bash
git remote add origin https://github.com/zhangsan/vision-core-app.git
git branch -M main
git push -u origin main
```

### 步骤 4：在 Vercel 导入项目

1. 访问 [Vercel Dashboard](https://vercel.com/new)
2. 点击 "Add New..." → "Project"
3. 选择 "Import Git Repository"
4. 找到你刚创建的 `vision-core-app` 仓库
5. 点击 "Import"

### 步骤 5：配置项目设置

在导入页面：

1. **Project Name**: 保持默认或修改
2. **Framework Preset**: 选择 "Other"
3. **Root Directory**: 保持默认 `./`（不需要修改）
4. **Build Command**: 
   ```
   npm run build
   ```
5. **Output Directory**: 
   ```
   dist
   ```
6. **Install Command**: 
   ```
   npm install
   ```

### 步骤 6：添加环境变量

在同一页面，展开 "Environment Variables" 部分，添加：

| Name | Value |
|------|-------|
| `ALICLOUD_ACCESS_KEY_ID` | `LTAI5tAQPefJFx33c4BfiHK7` |
| `ALICLOUD_ACCESS_KEY_SECRET` | `v8FbXKxmNjioUq2QgGP727Gjaz7PV9` |
| `DEEPSEEK_API_KEY` | `sk-03fe6c3cfcb84ceeb959124252f2204b` |

⚠️ **重要**：确保选择 "Production", "Preview", "Development" 三个环境都勾选。

### 步骤 7：部署

1. 点击 "Deploy"
2. 等待构建完成（约 2-3 分钟）
3. 部署成功后，Vercel 会给你一个域名

### 步骤 8：测试

访问你的域名（类似 `https://vision-core-app.vercel.app`），测试功能。

---

## 方案 B：使用现有仓库的子文件夹

如果你想把这个项目放在现有 GitHub 仓库的某个文件夹里。

### 步骤 1：确认项目位置

假设你的 GitHub 仓库结构是：
```
my-projects/
├── project-a/
├── project-b/
└── vision-core-app/  ← 你的项目在这里
```

### 步骤 2：推送代码

```bash
# 在你的项目根目录
cd /path/to/vision-core-app

# 如果还没有 git
git init
git add .
git commit -m "Add VISION-CORE app"

# 添加远程仓库（替换成你的仓库地址）
git remote add origin https://github.com/YOUR_USERNAME/my-projects.git

# 推送到特定分支（可选）
git push origin main
```

### 步骤 3：在 Vercel 导入项目

1. 访问 [Vercel Dashboard](https://vercel.com/new)
2. 选择你的 GitHub 仓库 `my-projects`
3. 点击 "Import"

### 步骤 4：配置 Root Directory

⚠️ **关键步骤**：

在项目设置页面：

1. 找到 "Root Directory" 设置
2. 点击 "Edit"
3. 输入你的项目文件夹路径：`vision-core-app`
4. 点击 "Continue"

### 步骤 5：配置构建设置

同方案 A 的步骤 5。

### 步骤 6：添加环境变量

同方案 A 的步骤 6。

### 步骤 7：部署

同方案 A 的步骤 7-8。

---

## 🎯 推荐方案

**如果你是第一次部署这个项目**：
- 选择 **方案 A**（创建新仓库）
- 更简单、更清晰、不会混乱

**如果你有特殊需求**（比如需要统一管理多个项目）：
- 选择 **方案 B**（使用子文件夹）
- 需要注意配置 Root Directory

---

## ⚠️ 避免之前的错误

之前出现问题的原因：
1. 使用 `vercel link` 时，Vercel 自动关联了错误的 GitHub 仓库
2. 没有正确配置 Root Directory

**解决方法**：
- 不要使用 `vercel link` 命令
- 直接在 Vercel Dashboard 导入项目
- 手动选择正确的仓库和文件夹

---

## 📋 快速决策

**回答以下问题**：

1. **你想创建新的 GitHub 仓库吗？**
   - 是 → 使用方案 A
   - 否 → 继续下一个问题

2. **你想把项目放在现有仓库的某个文件夹里吗？**
   - 是 → 使用方案 B
   - 否 → 建议使用方案 A

3. **你的现有仓库叫什么名字？**（如果选择方案 B）
   - 仓库名：`___________`
   - 项目文件夹路径：`___________`

---

## 🚀 准备好了吗？

告诉我你选择哪个方案，我会提供详细的命令。

**方案 A**：创建新仓库（推荐）  
**方案 B**：使用现有仓库的子文件夹

---

**更新时间**：2026-01-14  
**状态**：等待用户选择方案
