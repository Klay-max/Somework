# 📝 在 Vercel Dashboard 添加环境变量

## 步骤 1：打开项目设置

1. 访问你的项目页面：
   ```
   https://vercel.com/klays-projects-3394eafa/somegood
   ```

2. 点击顶部的 **"Settings"** 标签

## 步骤 2：进入环境变量页面

在左侧菜单找到并点击：
- **"Environment Variables"**（环境变量）

## 步骤 3：添加第一个变量

1. 你会看到一个表单，有三个输入框：
   - **Key**（键）
   - **Value**（值）
   - **Environments**（环境）

2. 填写第一个变量：
   - **Key**: `ALICLOUD_ACCESS_KEY_ID`
   - **Value**: `你的阿里云AccessKey ID`
   - **Environments**: 勾选所有三个
     - ✅ Production
     - ✅ Preview
     - ✅ Development

3. 点击 **"Save"** 或 **"Add"** 按钮

## 步骤 4：添加第二个变量

1. 点击 **"Add Another"** 或 **"+"** 按钮

2. 填写：
   - **Key**: `ALICLOUD_ACCESS_KEY_SECRET`
   - **Value**: `你的阿里云AccessKey Secret`
   - **Environments**: 勾选所有三个
     - ✅ Production
     - ✅ Preview
     - ✅ Development

3. 点击 **"Save"**

## 步骤 5：添加第三个变量

1. 再次点击 **"Add Another"**

2. 填写：
   - **Key**: `DEEPSEEK_API_KEY`
   - **Value**: `你的DeepSeek API Key`
   - **Environments**: 勾选所有三个
     - ✅ Production
     - ✅ Preview
     - ✅ Development

3. 点击 **"Save"**

## 步骤 6：重新部署

添加完环境变量后，需要重新部署才能生效：

### 方法 1：在 Dashboard 重新部署
1. 回到项目首页
2. 找到最新的部署
3. 点击右边的 **"..."** 菜单
4. 选择 **"Redeploy"**

### 方法 2：用命令行重新部署
```powershell
vercel --prod
```

## 完成！

重新部署完成后，你的 API 就可以正常工作了！

访问：https://somegood.vercel.app

---

## 快速链接

**直接跳转到环境变量页面**：
```
https://vercel.com/klays-projects-3394eafa/somegood/settings/environment-variables
```

---

## 需要添加的三个变量（复制用）

```
Key: ALICLOUD_ACCESS_KEY_ID
Value: 你的阿里云AccessKey ID

Key: ALICLOUD_ACCESS_KEY_SECRET
Value: 你的阿里云AccessKey Secret

Key: DEEPSEEK_API_KEY
Value: 你的DeepSeek API Key
```

每个都要勾选：Production, Preview, Development
