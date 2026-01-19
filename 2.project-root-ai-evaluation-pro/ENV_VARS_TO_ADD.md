# 🔑 需要添加的环境变量

## 手动添加步骤

### 1. ALICLOUD_ACCESS_KEY_ID

```powershell
vercel env add ALICLOUD_ACCESS_KEY_ID
```

**提示时输入**：
```
你的阿里云AccessKey ID
```

**选择环境**：用空格键选择所有三个（Production, Preview, Development），然后按 Enter

---

### 2. ALICLOUD_ACCESS_KEY_SECRET

```powershell
vercel env add ALICLOUD_ACCESS_KEY_SECRET
```

**提示时输入**：
```
你的阿里云AccessKey Secret
```

**选择环境**：用空格键选择所有三个（Production, Preview, Development），然后按 Enter

---

### 3. DEEPSEEK_API_KEY

```powershell
vercel env add DEEPSEEK_API_KEY
```

**提示时输入**：
```
你的DeepSeek API Key
```

**选择环境**：用空格键选择所有三个（Production, Preview, Development），然后按 Enter

---

## 快速复制

**ALICLOUD_ACCESS_KEY_ID**:
```
你的阿里云AccessKey ID
```

**ALICLOUD_ACCESS_KEY_SECRET**:
```
你的阿里云AccessKey Secret
```

**DEEPSEEK_API_KEY**:
```
你的DeepSeek API Key
```

---

## 验证

添加完成后，运行：
```powershell
vercel env ls
```

应该看到三个环境变量。

---

## 下一步

添加完环境变量后，运行：
```powershell
vercel --prod
```

开始部署！
