# 🔑 API密钥获取指南

本文档帮助你获取所有必需的API密钥。

---

## 📋 必需的API密钥

### 1. OCR服务（三选一）

系统支持三种OCR服务，你可以选择其中任意一种：

#### 选项A：百度OCR（推荐 - 免费额度最多）

**用途**: 图像文字识别（OCR）

**获取步骤**:

1. **注册百度智能云账号**
   - 访问: https://cloud.baidu.com/
   - 点击"注册"，完成账号注册

2. **实名认证**
   - 登录后进入控制台
   - 完成个人或企业实名认证

3. **创建OCR应用**
   - 进入产品服务 → 人工智能 → 文字识别OCR
   - 点击"立即使用"
   - 创建应用，选择"通用文字识别"
   - 记录 **API Key** 和 **Secret Key**

4. **配置到.env**
   ```bash
   BAIDU_OCR_API_KEY=你的API_Key
   BAIDU_OCR_SECRET_KEY=你的Secret_Key
   ```

**免费额度**:
- 通用文字识别: 500次/天
- 高精度版: 50次/天

**定价** (超出免费额度):
- 通用版: ¥0.003/次
- 高精度版: ¥0.008/次

**文档**: https://cloud.baidu.com/doc/OCR/index.html

---

#### 选项B：阿里云OCR（推荐 - 性能优秀）

**用途**: 图像文字识别（OCR）

**获取步骤**:

1. **注册阿里云账号**
   - 访问: https://www.aliyun.com/
   - 点击"免费注册"，完成账号注册

2. **实名认证**
   - 登录后进入控制台
   - 完成个人或企业实名认证

3. **开通OCR服务**
   - 进入产品 → 人工智能 → 文字识别OCR
   - 点击"立即开通"
   - 选择"按量付费"模式

4. **获取AccessKey**
   - 进入控制台右上角头像 → AccessKey管理
   - 创建AccessKey（建议使用子账号）
   - 记录 **AccessKey ID** 和 **AccessKey Secret**

5. **配置到.env**
   ```bash
   ALIYUN_OCR_ACCESS_KEY_ID=你的AccessKey_ID
   ALIYUN_OCR_ACCESS_KEY_SECRET=你的AccessKey_Secret
   ```

**免费额度**:
- 通用文字识别: 500次/月（新用户前3个月）
- 高精度版: 50次/月

**定价** (超出免费额度):
- 通用版: ¥0.005/次
- 高精度版: ¥0.01/次

**优势**:
- 识别准确率高
- 响应速度快
- 支持多种场景

**文档**: https://help.aliyun.com/product/442365.html

---

#### 选项C：腾讯云OCR（备选方案）

**用途**: AI智能分析和诊断

**获取步骤**:

1. **注册DeepSeek账号**
   - 访问: https://platform.deepseek.com/
   - 点击"Sign Up"注册账号

2. **获取API Key**
   - 登录后进入Dashboard
   - 点击"API Keys"
   - 创建新的API Key
   - 复制并保存API Key（只显示一次！）

3. **配置到.env**
   ```bash
   DEEPSEEK_API_KEY=sk-你的API密钥
   ```

**免费额度**:
- 新用户赠送 $5 额度
- 约可处理 500-1000 次诊断

**定价**:
- DeepSeek-Chat: $0.14/百万tokens (输入)
- DeepSeek-Chat: $0.28/百万tokens (输出)

**文档**: https://platform.deepseek.com/docs

---

## 🔄 备选方案

### 腾讯云OCR（百度OCR的替代）

**获取步骤**:

1. **注册腾讯云账号**
   - 访问: https://cloud.tencent.com/
   - 完成注册和实名认证

2. **开通OCR服务**
   - 进入产品 → 人工智能 → 文字识别OCR
   - 点击"立即使用"

3. **获取密钥**
   - 进入访问管理 → 访问密钥 → API密钥管理
   - 创建密钥，记录 **SecretId** 和 **SecretKey**

4. **配置到.env**
   ```bash
   TENCENT_OCR_SECRET_ID=你的SecretId
   TENCENT_OCR_SECRET_KEY=你的SecretKey
   ```

**免费额度**:
- 通用印刷体识别: 1000次/月
- 通用手写体识别: 100次/月

**文档**: https://cloud.tencent.com/document/product/866

---

## 📦 可选的API密钥

### 3. 阿里云OSS（对象存储）

**用途**: 存储图片和报告文件

**获取步骤**:

1. **注册阿里云账号**
   - 访问: https://www.aliyun.com/
   - 完成注册和实名认证

2. **开通OSS服务**
   - 进入产品 → 存储 → 对象存储OSS
   - 点击"立即开通"

3. **创建Bucket**
   - 进入OSS控制台
   - 创建Bucket，选择地域和访问权限
   - 记录Bucket名称和Endpoint

4. **获取AccessKey**
   - 进入AccessKey管理
   - 创建AccessKey
   - 记录 **AccessKey ID** 和 **AccessKey Secret**

5. **配置到.env**
   ```bash
   ALIYUN_OSS_ACCESS_KEY=你的AccessKey_ID
   ALIYUN_OSS_SECRET_KEY=你的AccessKey_Secret
   ALIYUN_OSS_BUCKET=你的Bucket名称
   ALIYUN_OSS_ENDPOINT=oss-cn-hangzhou.aliyuncs.com
   ```

**免费额度**:
- 标准存储: 5GB/6个月（新用户）
- 外网流出流量: 5GB/6个月

**定价**:
- 标准存储: ¥0.12/GB/月
- 外网流出流量: ¥0.50/GB

**文档**: https://help.aliyun.com/product/31815.html

---

### 4. 短信服务（可选）

**用途**: 发送验证码短信

#### 阿里云短信服务

1. **开通短信服务**
   - 进入产品 → 云通信 → 短信服务
   - 完成开通和签名审核

2. **创建模板**
   - 创建验证码短信模板
   - 等待审核通过

3. **配置到.env**
   ```bash
   SMS_API_KEY=你的AccessKey_ID
   SMS_API_SECRET=你的AccessKey_Secret
   ```

**定价**:
- 验证码短信: ¥0.045/条

#### 腾讯云短信服务

类似流程，访问: https://cloud.tencent.com/product/sms

---

## 💰 成本估算

### 小规模使用（50-100张试卷/天）

| 服务 | 月使用量 | 月费用 |
|------|---------|--------|
| 百度OCR | 3,000次 | ¥0（免费额度内） |
| DeepSeek | 3,000次 | ¥20 |
| 阿里云OSS | 10GB存储 + 50GB流量 | ¥20 |
| 短信服务 | 500条 | ¥23 |
| **总计** | - | **约¥63/月** |

### 中等规模使用（200-500张试卷/天）

| 服务 | 月使用量 | 月费用 |
|------|---------|--------|
| 百度OCR | 12,000次 | ¥30 |
| DeepSeek | 12,000次 | ¥80 |
| 阿里云OSS | 50GB存储 + 200GB流量 | ¥100 |
| 短信服务 | 2,000条 | ¥90 |
| **总计** | - | **约¥300/月** |

---

## ✅ 配置检查清单

配置完成后，请检查：

- [ ] 百度OCR API Key 已配置
- [ ] 百度OCR Secret Key 已配置
- [ ] DeepSeek API Key 已配置
- [ ] 阿里云OSS配置（可选）
- [ ] 短信服务配置（可选）
- [ ] 所有密钥已正确填入 `.env` 文件
- [ ] 没有包含 "your_" 或默认值

**验证配置**:
```bash
# Linux/Mac
cat .env | grep -E "BAIDU|DEEPSEEK|ALIYUN" | grep -v "^#"

# Windows
findstr /C:"BAIDU" /C:"DEEPSEEK" /C:"ALIYUN" .env
```

---

## 🔒 安全建议

1. **不要提交密钥到Git**
   - `.env` 文件已在 `.gitignore` 中
   - 确保不要提交包含密钥的文件

2. **定期轮换密钥**
   - 建议每3-6个月更换一次API密钥

3. **限制密钥权限**
   - 只授予必需的权限
   - 使用子账号而非主账号密钥

4. **监控使用量**
   - 定期检查API调用量
   - 设置用量告警

5. **备份密钥**
   - 将密钥安全保存在密码管理器中
   - 不要明文存储在云端

---

## 🆘 常见问题

### Q1: 百度OCR免费额度用完了怎么办？

**方案1**: 购买资源包（更便宜）
- 10万次: ¥200（¥0.002/次）

**方案2**: 切换到腾讯云OCR
- 配置 `TENCENT_OCR_SECRET_ID` 和 `TENCENT_OCR_SECRET_KEY`
- 系统会自动故障转移

### Q2: DeepSeek API调用失败？

检查：
1. API Key是否正确
2. 账户余额是否充足
3. 网络是否能访问DeepSeek服务
4. 查看后端日志: `docker-compose -f docker-compose.prod.yml logs backend`

### Q3: 如何测试API密钥是否有效？

```bash
# 测试百度OCR
curl -X POST "https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=你的API_Key&client_secret=你的Secret_Key"

# 测试DeepSeek
curl -X POST "https://api.deepseek.com/v1/chat/completions" \
  -H "Authorization: Bearer 你的API_Key" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-chat","messages":[{"role":"user","content":"Hello"}]}'
```

---

## 📞 获取帮助

如果在获取API密钥过程中遇到问题：

1. 查看各服务商的官方文档
2. 联系服务商客服
3. 在项目GitHub提交Issue

---

**文档更新日期**: 2026年1月7日

