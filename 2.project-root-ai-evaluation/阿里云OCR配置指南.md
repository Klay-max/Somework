# 🔑 阿里云OCR配置指南

**更新时间**: 2026年1月7日

---

## ✅ 好消息！

系统现在已经支持阿里云OCR了！你可以使用阿里云OCR代替百度OCR或腾讯云OCR。

---

## 📋 阿里云OCR vs 其他OCR服务

| 特性 | 阿里云OCR | 百度OCR | 腾讯云OCR |
|------|----------|---------|-----------|
| **免费额度** | 500次/月（前3个月） | 500次/天 | 1000次/月 |
| **识别准确率** | ⭐⭐⭐⭐⭐ 很高 | ⭐⭐⭐⭐ 高 | ⭐⭐⭐⭐ 高 |
| **响应速度** | ⭐⭐⭐⭐⭐ 很快 | ⭐⭐⭐⭐ 快 | ⭐⭐⭐⭐ 快 |
| **价格（超额）** | ¥0.005/次 | ¥0.003/次 | ¥0.005/次 |
| **文档质量** | ⭐⭐⭐⭐⭐ 优秀 | ⭐⭐⭐⭐ 良好 | ⭐⭐⭐⭐ 良好 |
| **支持场景** | 多种 | 多种 | 多种 |

**推荐选择**:
- 如果你已有阿里云账号 → 选择阿里云OCR
- 如果需要最多免费额度 → 选择百度OCR（500次/天）
- 如果追求性能和准确率 → 选择阿里云OCR

---

## 🚀 快速开始：获取阿里云OCR密钥

### 第1步：注册阿里云账号（5分钟）

1. **访问阿里云官网**
   ```
   https://www.aliyun.com/
   ```

2. **点击"免费注册"**
   - 使用手机号或邮箱注册
   - 完成手机验证

3. **实名认证**
   - 登录后，系统会提示进行实名认证
   - 个人用户：需要身份证
   - 企业用户：需要营业执照
   - **注意**: 必须完成实名认证才能使用OCR服务

---

### 第2步：开通OCR服务（3分钟）

1. **进入OCR产品页**
   - 登录阿里云控制台
   - 搜索"文字识别OCR"或访问：
   ```
   https://www.aliyun.com/product/ocr
   ```

2. **点击"立即开通"**
   - 选择"按量付费"模式（推荐）
   - 阅读并同意服务协议
   - 点击"立即开通"

3. **确认开通成功**
   - 看到"开通成功"提示
   - 进入OCR控制台

---

### 第3步：获取AccessKey（5分钟）

**⚠️ 重要提示**: 
- AccessKey非常重要，相当于你的账号密码
- 建议使用RAM子账号，而不是主账号
- 子账号更安全，可以限制权限

#### 方法A：使用主账号（快速但不推荐）

1. **进入AccessKey管理**
   - 点击控制台右上角头像
   - 选择"AccessKey管理"
   - 或访问：https://ram.console.aliyun.com/manage/ak

2. **创建AccessKey**
   - 点击"创建AccessKey"
   - 完成安全验证（手机验证码）
   - **立即复制并保存**：
     - AccessKey ID（类似：LTAI5tXXXXXXXXXX）
     - AccessKey Secret（类似：xxxxxxxxxxxxxxxxxxxxxx）
   - ⚠️ Secret只显示一次，务必保存！

#### 方法B：使用RAM子账号（推荐，更安全）

1. **创建RAM用户**
   - 进入RAM控制台：https://ram.console.aliyun.com/
   - 点击"用户" → "创建用户"
   - 填写登录名称（如：ocr-service）
   - 勾选"编程访问"
   - 点击"确定"

2. **授予OCR权限**
   - 找到刚创建的用户
   - 点击"添加权限"
   - 搜索并添加"AliyunOCRFullAccess"权限
   - 点击"确定"

3. **获取AccessKey**
   - 在用户列表中找到刚创建的用户
   - 点击用户名进入详情
   - 点击"创建AccessKey"
   - **立即复制并保存** AccessKey ID 和 Secret

---

### 第4步：配置到项目（2分钟）

1. **打开.env文件**
   ```bash
   notepad .env
   ```

2. **找到阿里云OCR配置部分**
   ```bash
   # OCR API Keys (需要配置)
   ALIYUN_OCR_ACCESS_KEY_ID=your_aliyun_access_key_id
   ALIYUN_OCR_ACCESS_KEY_SECRET=your_aliyun_access_key_secret
   ```

3. **替换为你的真实密钥**
   ```bash
   # 修改前
   ALIYUN_OCR_ACCESS_KEY_ID=your_aliyun_access_key_id
   ALIYUN_OCR_ACCESS_KEY_SECRET=your_aliyun_access_key_secret
   
   # 修改后（示例，请用你自己的）
   ALIYUN_OCR_ACCESS_KEY_ID=LTAI5tAbCdEf1234567
   ALIYUN_OCR_ACCESS_KEY_SECRET=xYz9876543210aBcDeFgHiJkLmN
   ```

4. **设置默认OCR提供商（可选）**
   
   如果你想使用阿里云OCR作为默认提供商，在`.env`文件中添加：
   ```bash
   OCR_DEFAULT_PROVIDER=aliyun
   ```
   
   如果不设置，系统默认使用百度OCR。

5. **保存文件**
   - 按 `Ctrl + S` 保存
   - 关闭编辑器

---

## 🎯 启动生产环境

配置完成后，启动生产环境：

```bash
# 如果Mock版本正在运行，先停止
docker-compose -f docker-compose.mock.yml down

# 启动生产环境
.\start-production.bat
```

系统会自动检测并初始化阿里云OCR服务。

---

## ✅ 验证配置

### 方法1：查看日志

启动后查看日志，应该看到：

```
INFO: 阿里云 OCR 提供商初始化成功
```

查看日志命令：
```bash
docker-compose -f docker-compose.prod.yml logs backend | findstr "阿里云"
```

### 方法2：测试API

1. 访问 http://localhost/docs
2. 找到 `POST /api/v1/exams/upload` 接口
3. 上传一张试卷图片
4. 查看OCR识别结果

---

## 💰 费用说明

### 免费额度

**新用户福利**（前3个月）:
- 通用文字识别: 500次/月
- 高精度识别: 50次/月

**之后**:
- 通用文字识别: 50次/月
- 高精度识别: 0次/月

### 按量付费价格

| 服务类型 | 价格 | 说明 |
|---------|------|------|
| 通用文字识别 | ¥0.005/次 | 适合大多数场景 |
| 高精度识别 | ¥0.01/次 | 复杂场景使用 |
| 手写文字识别 | ¥0.01/次 | 识别手写内容 |

### 成本估算

**小规模使用（50张/天）**:
- 月调用量: 1,500次
- 免费额度: 500次
- 需付费: 1,000次
- 月费用: 1,000 × ¥0.005 = **¥5**

**中等规模使用（200张/天）**:
- 月调用量: 6,000次
- 免费额度: 500次
- 需付费: 5,500次
- 月费用: 5,500 × ¥0.005 = **¥27.5**

---

## 🔧 高级配置

### 多OCR提供商故障转移

系统支持配置多个OCR提供商，自动故障转移：

```bash
# .env 文件配置多个提供商
BAIDU_OCR_API_KEY=你的百度密钥
BAIDU_OCR_SECRET_KEY=你的百度密钥
ALIYUN_OCR_ACCESS_KEY_ID=你的阿里云密钥
ALIYUN_OCR_ACCESS_KEY_SECRET=你的阿里云密钥

# 设置默认提供商
OCR_DEFAULT_PROVIDER=aliyun
```

**工作原理**:
1. 优先使用默认提供商（aliyun）
2. 如果失败，自动切换到备用提供商（baidu）
3. 确保服务高可用

### 指定OCR提供商

在API调用时可以指定使用哪个提供商：

```python
# 使用阿里云OCR
result = await ocr_service.recognize(image_bytes, provider_name="aliyun")

# 使用百度OCR
result = await ocr_service.recognize(image_bytes, provider_name="baidu")
```

---

## 🆘 常见问题

### Q1: 提示"AccessKey ID不存在"

**原因**: AccessKey ID输入错误或已删除

**解决方法**:
1. 检查`.env`文件中的AccessKey ID是否正确
2. 登录阿里云控制台，确认AccessKey是否存在
3. 如果已删除，重新创建一个

### Q2: 提示"签名验证失败"

**原因**: AccessKey Secret错误

**解决方法**:
1. 检查`.env`文件中的Secret是否正确
2. 确保Secret前后没有空格
3. 如果忘记Secret，需要删除旧的AccessKey，创建新的

### Q3: 提示"权限不足"

**原因**: RAM用户没有OCR权限

**解决方法**:
1. 登录RAM控制台
2. 找到对应的用户
3. 添加"AliyunOCRFullAccess"权限

### Q4: OCR识别失败

**可能原因**:
1. 免费额度用完
2. 账户欠费
3. 网络连接问题
4. 图片格式不支持

**解决方法**:
```bash
# 查看详细错误日志
docker-compose -f docker-compose.prod.yml logs backend

# 检查账户余额
# 登录阿里云控制台 → 费用中心 → 账户总览
```

### Q5: 如何查看使用量？

1. 登录阿里云控制台
2. 进入"费用中心" → "用量明细"
3. 选择"文字识别OCR"产品
4. 查看详细调用记录

---

## 🔒 安全建议

### 1. 使用RAM子账号

✅ **推荐做法**:
```
创建专门的RAM子账号用于OCR服务
只授予OCR相关权限
定期轮换AccessKey
```

❌ **不推荐做法**:
```
使用主账号AccessKey
授予过多权限
长期不更换密钥
```

### 2. 保护AccessKey

- ✅ 将`.env`文件加入`.gitignore`
- ✅ 使用密码管理器保存密钥
- ✅ 不要在代码中硬编码密钥
- ❌ 不要提交密钥到Git仓库
- ❌ 不要在公开场合分享密钥

### 3. 监控使用量

- 设置费用告警（推荐设置¥50/月）
- 定期检查调用量
- 发现异常立即停用AccessKey

### 4. 定期轮换密钥

建议每3-6个月更换一次AccessKey：

1. 创建新的AccessKey
2. 更新`.env`文件
3. 重启服务
4. 删除旧的AccessKey

---

## 📚 相关文档

- [阿里云OCR官方文档](https://help.aliyun.com/product/442365.html)
- [阿里云OCR API参考](https://help.aliyun.com/document_detail/442365.html)
- [RAM访问控制文档](https://help.aliyun.com/product/28625.html)
- [阿里云定价说明](https://www.aliyun.com/price/product)

---

## 📞 获取帮助

如果遇到问题：

1. 查看本文档的"常见问题"章节
2. 查看阿里云官方文档
3. 联系阿里云客服（95187）
4. 在项目GitHub提交Issue

---

## ✅ 配置完成检查清单

- [ ] 已注册阿里云账号
- [ ] 已完成实名认证
- [ ] 已开通OCR服务
- [ ] 已创建AccessKey（建议使用RAM子账号）
- [ ] 已保存AccessKey ID和Secret
- [ ] 已配置到`.env`文件
- [ ] 已设置默认OCR提供商（可选）
- [ ] 已启动生产环境
- [ ] 已验证OCR功能正常
- [ ] 已设置费用告警

---

**祝你配置顺利！** 🎉

现在你可以使用阿里云OCR来识别试卷了！
