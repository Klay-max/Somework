# 🚀 快速开始指南

欢迎使用 AI 试卷拍照测评工具！本指南帮助你选择合适的部署方式。

---

## 📊 部署方式对比

| 特性 | Mock 本地版 | AWS 云端版 |
|------|------------|-----------|
| **成本** | 完全免费 | ¥280/月起 |
| **部署时间** | 15-30分钟 | 30-60分钟 |
| **网络要求** | 不需要 | 需要 |
| **API 密钥** | 不需要 | 需要 |
| **功能完整性** | 模拟数据 | 真实数据 |
| **适用场景** | 学习测试 | 生产使用 |
| **手机访问** | 仅本地网络 | 全球访问 |

---

## 🎯 选择你的部署方式

### 方案 A：本地 Mock 版（推荐新手）

**适合你，如果：**
- ✅ 想先免费体验完整功能
- ✅ 正在学习和开发
- ✅ 不想花钱购买 API 服务
- ✅ 只需要在本地测试

**开始部署：**
👉 查看 [`LOCAL_MOCK_DEPLOYMENT_GUIDE.md`](LOCAL_MOCK_DEPLOYMENT_GUIDE.md)
👉 测试指南 [`MOCK_TESTING_GUIDE.md`](MOCK_TESTING_GUIDE.md)

**特点：**
- 💰 成本：¥0
- ⏱️ 时间：15-30分钟
- 🎮 功能：完整功能（模拟数据）
- 📱 访问：本地网络
- 🚀 一键启动：`start-mock.bat` (Windows) 或 `start-mock.sh` (Mac/Linux)

---

### 方案 B：AWS 云端版（生产环境）

**适合你，如果：**
- ✅ 需要真实的 OCR 和 AI 分析
- ✅ 想让手机随时随地访问
- ✅ 准备投入一定成本
- ✅ 需要稳定的生产环境

**开始部署：**
👉 查看 [`AWS_EC2_DEPLOYMENT_GUIDE.md`](AWS_EC2_DEPLOYMENT_GUIDE.md)

**特点：**
- 💰 成本：约 ¥280/月
- ⏱️ 时间：30-60分钟
- 🎮 功能：完整功能（真实数据）
- 📱 访问：全球访问

---

## 🛤️ 推荐路径

### 阶段 1：学习和测试（免费）
```
1. 使用本地 Mock 版
2. 熟悉所有功能
3. 测试 Android 应用
4. 验证业务流程
```

### 阶段 2：小规模试用（¥280/月）
```
1. 部署到 AWS EC2
2. 使用 API 免费额度
3. 邀请少量用户测试
4. 收集反馈优化
```

### 阶段 3：正式运营（按需扩展）
```
1. 根据用户量调整配置
2. 购买更多 API 额度
3. 优化成本和性能
4. 持续迭代改进
```

---

## 📚 文档导航

### 部署文档
- 📖 [本地 Mock 版部署指南](LOCAL_MOCK_DEPLOYMENT_GUIDE.md) - 完全免费
- 📖 [Mock 测试指南](MOCK_TESTING_GUIDE.md) - 详细测试步骤
- 📖 [AWS EC2 部署指南](AWS_EC2_DEPLOYMENT_GUIDE.md) - 云端部署
- 📖 [通用部署指南](DEPLOYMENT.md) - Docker/K8s 详细说明

### 项目文档
- 📋 [项目状态](PROJECT_STATUS.md) - 当前进度
- 📋 [项目完成总结](PROJECT_COMPLETION_SUMMARY.md) - 功能清单
- 📋 [最终验证](TASK_25_FINAL_VERIFICATION.md) - 测试结果

### 技术文档
- 🔧 [后端架构](backend/CHECKPOINT_4_BACKEND_COMPLETE.md)
- 🔧 [Android 架构](android/ANDROID_ARCHITECTURE.md)
- 🔧 [需求文档](.kiro/specs/ai-exam-assessment/requirements.md)
- 🔧 [设计文档](.kiro/specs/ai-exam-assessment/design.md)

---

## 🎬 快速开始步骤

### 如果选择本地 Mock 版：

#### 方式 1：一键启动（推荐）

**Windows**：
```cmd
start-mock.bat
```

**Mac/Linux**：
```bash
chmod +x start-mock.sh
./start-mock.sh
```

#### 方式 2：手动启动

```bash
# 1. 安装 Docker Desktop
# 下载：https://www.docker.com/products/docker-desktop

# 2. 进入项目目录
cd /path/to/your/project

# 3. 启动服务（配置文件已准备好）
docker-compose --env-file .env.mock -f docker-compose.mock.yml up -d

# 4. 运行数据库迁移
docker-compose -f docker-compose.mock.yml exec backend alembic upgrade head

# 5. 访问 API 文档
# 浏览器打开：http://localhost:8000/docs

# 6. 配置 Android 应用
# 修改 BASE_URL 为 http://10.0.2.2:8000/

# 7. 开始测试！（验证码：123456）
```

👉 **详细测试步骤**：查看 [MOCK_TESTING_GUIDE.md](MOCK_TESTING_GUIDE.md)

### 如果选择 AWS 云端版：

```bash
# 1. 注册 AWS 账号
# 访问：https://aws.amazon.com/

# 2. 获取 API 密钥
# - 百度 OCR：https://cloud.baidu.com/product/ocr
# - DeepSeek：https://platform.deepseek.com/
# - 阿里云 OSS：https://www.aliyun.com/product/oss

# 3. 创建 EC2 实例
# 按照 AWS_EC2_DEPLOYMENT_GUIDE.md 操作

# 4. 上传项目代码
scp -i your-key.pem exam-ai-backend.tar.gz ubuntu@your-ec2-ip:~

# 5. 配置环境变量
# 填写真实的 API 密钥

# 6. 启动服务
docker-compose -f docker-compose.prod.yml up -d

# 7. 配置 Android 应用
# 修改 BASE_URL 为 http://your-ec2-ip/

# 8. 开始使用！
```

---

## 💡 常见问题

### Q: 我应该选择哪个方案？
**A**: 如果是第一次使用，强烈推荐先用本地 Mock 版（完全免费）。熟悉功能后，再考虑部署到云端。

### Q: Mock 版和真实版有什么区别？
**A**: Mock 版返回模拟的 OCR 和 AI 分析结果，但所有功能流程都是真实的。真实版使用实际的 API 服务。

### Q: 可以先用 Mock 版，之后切换到真实版吗？
**A**: 可以！只需要修改配置文件，设置 `USE_MOCK_SERVICES=false`，并填写真实的 API 密钥即可。

### Q: Mock 版的验证码是多少？
**A**: 在 Mock 模式下，所有手机号的验证码都是 `123456`。

### Q: 如何在手机上访问本地服务？
**A**: 
- Android 模拟器：使用 `http://10.0.2.2:8000/`
- 真机：确保手机和电脑在同一网络，使用 `http://你的电脑IP:8000/`

### Q: AWS 部署的成本可以降低吗？
**A**: 可以！使用 t3.small 实例（约 ¥120/月），或者使用 AWS 免费额度（t2.micro，12个月免费）。

---

## 📞 需要帮助？

如果在部署过程中遇到任何问题：

1. 查看对应的部署指南
2. 检查常见问题部分
3. 查看项目文档
4. 联系技术支持

---

## 🎉 开始你的旅程

选择一个方案，开始部署吧！

- 🆓 [本地 Mock 版 →](LOCAL_MOCK_DEPLOYMENT_GUIDE.md)
- ☁️ [AWS 云端版 →](AWS_EC2_DEPLOYMENT_GUIDE.md)

祝你使用愉快！🚀
