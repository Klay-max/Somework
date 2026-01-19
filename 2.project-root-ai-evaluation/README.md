# 🎓 AI 试卷拍照测评工具

一个完整的端到端解决方案，包括 Python FastAPI 后端和 Kotlin Android 客户端。系统实现了从试卷拍照、OCR 识别、智能分析到诊断报告生成的完整功能链路。

---

## ✨ 核心功能

- 📸 **试卷拍照**：实时拍照指导，智能图像质量检测
- 🔍 **OCR 识别**：支持印刷体和手写识别，双提供商故障转移
- 🤖 **AI 分析**：智能题目解析、作答分析、错误诊断
- 📊 **诊断报告**：五维能力评估、知识漏洞分析、学习建议
- 📱 **移动应用**：Material 3 设计，离线队列，本地缓存

---

## 🚀 快速开始

### 方案 A：本地 Mock 版（完全免费）

适合学习和测试，不需要任何 API 密钥。

#### 一键启动（推荐）

**Windows**：
```cmd
start-mock.bat
```

**Mac/Linux**：
```bash
chmod +x start-mock.sh
./start-mock.sh
```

#### 手动启动

```bash
# 1. 安装 Docker Desktop
# 2. 克隆项目
git clone <repository-url>
cd exam-assessment

# 3. 启动 Mock 服务
docker-compose --env-file .env.mock -f docker-compose.mock.yml up -d

# 4. 运行数据库迁移
docker-compose -f docker-compose.mock.yml exec backend alembic upgrade head

# 5. 访问 API 文档
open http://localhost:8000/docs
```

👉 **详细指南**：
- [本地 Mock 部署指南](LOCAL_MOCK_DEPLOYMENT_GUIDE.md)
- [Mock 测试指南](MOCK_TESTING_GUIDE.md)

### 方案 B：AWS 云端版（生产环境）

适合正式使用，需要 AWS 账号和 API 密钥：

```bash
# 1. 创建 AWS EC2 实例
# 2. 获取 API 密钥（百度 OCR、DeepSeek、阿里云 OSS）
# 3. 上传项目并配置
# 4. 启动服务
```

👉 **详细指南**：[AWS_EC2_DEPLOYMENT_GUIDE.md](AWS_EC2_DEPLOYMENT_GUIDE.md)

---

## 📚 文档导航

### 🎯 开始使用
- [快速开始指南](QUICK_START_GUIDE.md) - 选择合适的部署方式
- [本地 Mock 版部署](LOCAL_MOCK_DEPLOYMENT_GUIDE.md) - 完全免费
- [Mock 测试指南](MOCK_TESTING_GUIDE.md) - 详细测试步骤
- [AWS EC2 部署](AWS_EC2_DEPLOYMENT_GUIDE.md) - 云端部署

### 📋 项目信息
- [项目状态](PROJECT_STATUS.md) - 当前进度（92% 完成）
- [项目完成总结](PROJECT_COMPLETION_SUMMARY.md) - 功能清单
- [最终验证](TASK_25_FINAL_VERIFICATION.md) - 测试结果

### 🔧 技术文档
- [部署指南](DEPLOYMENT.md) - Docker/Kubernetes 详细说明
- [后端架构](backend/CHECKPOINT_4_BACKEND_COMPLETE.md)
- [Android 架构](android/ANDROID_ARCHITECTURE.md)

---

## 📊 项目统计

```
项目完成度:      92% (23/25 任务)
核心功能:        100% ✅
代码行数:        ~21,660 行
测试数量:        452 个 (100% 通过)
API 端点:        17 个
系统状态:        🟢 生产就绪
```

---

## 🏗️ 技术架构

### 后端技术栈
- **框架**: FastAPI
- **数据库**: PostgreSQL
- **缓存**: Redis
- **任务队列**: Celery
- **OCR**: 百度 OCR + 腾讯 OCR
- **AI**: DeepSeek API
- **测试**: Pytest + Hypothesis

### Android 技术栈
- **语言**: Kotlin
- **UI**: Jetpack Compose + Material 3
- **架构**: MVVM + Clean Architecture
- **网络**: Retrofit + OkHttp
- **数据库**: Room
- **依赖注入**: Hilt
- **测试**: JUnit + MockK + Turbine

---

## 💰 成本估算

### 本地 Mock 版
```
成本: ¥0/月
功能: 完整功能（模拟数据）
适用: 学习和测试
```

### AWS 云端版（小规模）
```
AWS EC2:        ¥240/月
API 服务:       ¥40/月（免费额度内）
总计:           约 ¥280/月
适用:           50-100 张试卷/天
```

### AWS 云端版（中等规模）
```
AWS EC2:        ¥240/月
API 服务:       ¥100/月
总计:           约 ¥340/月
适用:           200-500 张试卷/天
```

---

## 🎯 功能特性

### ✅ 用户认证
- 手机号注册/登录
- JWT Token 管理
- Android Keystore 加密存储

### ✅ 图像处理
- 图像质量检测（分辨率、模糊度、亮度）
- 图像预处理（去噪、增强）
- 支持 JPG/PNG/HEIC 格式

### ✅ OCR 识别
- 双提供商（百度 + 腾讯）
- 自动故障转移
- 印刷体和手写识别

### ✅ 智能分析
- 试卷元数据提取
- 题目分割和分类
- 学生答案提取
- 客观题自动评分
- 主观题 AI 评分

### ✅ AI 诊断
- 五维能力评估
- 表层问题识别（30%）
- 深层问题识别（70%）
- 证据支撑的结论
- 目标学校差距预测

### ✅ 报告生成
- 4 页 HTML 报告
- 学业综合能力画像
- 知识漏洞分析
- AI 托管 vs 真人名师分流
- 10 课时靶向突击方案

### ✅ Android 应用
- Material 3 设计
- 实时拍照指导
- 离线上传队列
- 本地缓存（7天）
- 报告分享

---

## 🧪 测试覆盖

```
后端测试:        63 个 (100% 通过)
  - 属性测试:    29 个
  - 单元测试:    34 个

Android 测试:    389 个 (100% 通过)
  - 单元测试:    278 个
  - UI 测试:     111 个
  - E2E 测试:    33 个

总计:            452 个测试 (100% 通过)
```

---

## 🔒 安全特性

- JWT Token 认证（7天有效期）
- Android Keystore 加密存储
- HTTPS 强制
- 速率限制
- SQL 注入防护
- XSS 防护

---

## 📦 部署选项

### Docker Compose
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Kubernetes
```bash
kubectl apply -f k8s/
```

### 监控
- Prometheus + Grafana
- 完整的监控仪表板
- 自动告警

---

## 🤝 贡献

欢迎贡献代码、报告问题或提出建议！

---

## 📄 许可证

[MIT License](LICENSE)

---

## 📞 联系方式

如有问题或需要帮助，请查看文档或联系技术支持。

---

**开始使用** → [快速开始指南](QUICK_START_GUIDE.md)

🎉 祝你使用愉快！
