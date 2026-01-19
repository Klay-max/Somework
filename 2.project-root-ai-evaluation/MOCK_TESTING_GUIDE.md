# 🧪 Mock 版本测试指南

## 快速开始

### Windows 用户

双击运行 `start-mock.bat` 或在命令行执行：
```cmd
start-mock.bat
```

### Mac/Linux 用户

在终端执行：
```bash
chmod +x start-mock.sh
./start-mock.sh
```

---

## 📋 测试清单

### 1. 验证服务启动 ✅

```bash
# 检查所有服务是否运行
docker-compose -f docker-compose.mock.yml ps

# 应该看到以下服务：
# - exam_assessment_db_mock (postgres)
# - exam_assessment_redis_mock (redis)
# - exam_assessment_backend_mock (backend)
# - exam_assessment_celery_mock (celery_worker)
```

### 2. 运行数据库迁移 ✅

```bash
# 进入后端容器
docker-compose -f docker-compose.mock.yml exec backend bash

# 运行迁移
alembic upgrade head

# 退出容器
exit
```

### 3. 测试 API 端点 ✅

#### 3.1 健康检查

```bash
curl http://localhost:8000/health
```

预期响应：
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

#### 3.2 发送验证码（Mock）

```bash
curl -X POST http://localhost:8000/api/v1/auth/send-code \
  -H "Content-Type: application/json" \
  -d '{"phone": "13800138000"}'
```

预期响应：
```json
{
  "message": "验证码已发送",
  "code": "123456"
}
```

💡 **提示**：在 Mock 模式下，所有手机号的验证码都是 `123456`

#### 3.3 用户注册

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "13800138000",
    "password": "test123456",
    "verification_code": "123456"
  }'
```

预期响应：
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "phone": "13800138000"
  }
}
```

#### 3.4 用户登录

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "13800138000",
    "password": "test123456"
  }'
```

#### 3.5 上传试卷图片

```bash
# 替换 YOUR_TOKEN 为登录后获得的 token
curl -X POST http://localhost:8000/api/v1/exams/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test_exam.jpg"
```

预期响应：
```json
{
  "exam_id": "uuid",
  "status": "processing",
  "message": "试卷上传成功，正在处理"
}
```

#### 3.6 查询试卷状态

```bash
curl -X GET http://localhost:8000/api/v1/exams/{exam_id} \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 3.7 获取分析报告

```bash
curl -X GET http://localhost:8000/api/v1/reports/{exam_id} \
  -H "Authorization: Bearer YOUR_TOKEN"
```

预期响应包含：
- OCR 识别的文本（Mock 数据）
- 题目解析
- 知识点标注（随机生成）
- 难度评估（随机生成）
- 诊断分析（模拟数据）

---

## 🎯 Mock 数据说明

### OCR 识别结果

Mock OCR 返回固定的数学试卷内容：
- 选择题（3道）
- 填空题（3道）
- 解答题（3道）

### AI 分析结果

Mock DeepSeek 返回随机生成的分析：
- **知识点**：从预设列表中随机选择 2-4 个
- **难度系数**：0.3-0.8 之间的随机值
- **五维能力**：0.5-0.9 之间的随机值
- **问题诊断**：预设的表层和深层问题

### 验证码

所有手机号的验证码固定为：`123456`

### 文件存储

文件存储在容器的 `/app/uploads` 目录，返回本地 URL：
```
http://localhost:8000/uploads/exams/2024/01/01/filename.jpg
```

---

## 🔍 查看日志

### 查看所有服务日志

```bash
docker-compose -f docker-compose.mock.yml logs -f
```

### 查看特定服务日志

```bash
# 后端日志
docker-compose -f docker-compose.mock.yml logs -f backend

# Celery 日志
docker-compose -f docker-compose.mock.yml logs -f celery_worker

# 数据库日志
docker-compose -f docker-compose.mock.yml logs -f postgres
```

### 查看 Mock 服务输出

在日志中查找以下标记：
- `🎭 Using Mock OCR Service`
- `🎭 Using Mock DeepSeek Service`
- `🎭 Using Mock SMS Service`
- `📱 Mock SMS: 发送验证码 123456 到 ...`

---

## 📱 Android 应用测试

### 1. 配置 Android 应用

编辑 `android/app/src/main/java/com/examai/data/remote/api/ApiConfig.kt`：

```kotlin
object ApiConfig {
    // Android 模拟器
    const val BASE_URL = "http://10.0.2.2:8000/"
    
    // 真机（确保在同一网络）
    // const val BASE_URL = "http://YOUR_COMPUTER_IP:8000/"
}
```

### 2. 编译运行

1. 打开 Android Studio
2. 打开项目：`android/`
3. 同步 Gradle
4. 运行应用（Shift + F10）

### 3. 测试流程

1. **注册账号**
   - 输入手机号：13800138000
   - 点击"发送验证码"
   - 输入验证码：123456
   - 设置密码：test123456
   - 点击"注册"

2. **登录**
   - 输入手机号和密码
   - 点击"登录"

3. **拍照上传**
   - 点击"拍照"或"从相册选择"
   - 选择试卷图片
   - 点击"上传"

4. **查看报告**
   - 等待处理完成
   - 查看 OCR 识别结果（Mock 数据）
   - 查看分析报告（随机生成）
   - 查看诊断报告（模拟数据）

---

## 🛠️ 常见问题

### Q1: 服务启动失败？

```bash
# 查看详细日志
docker-compose -f docker-compose.mock.yml logs

# 重新启动
docker-compose -f docker-compose.mock.yml down
docker-compose -f docker-compose.mock.yml up -d
```

### Q2: 端口被占用？

编辑 `docker-compose.mock.yml`，修改端口映射：
```yaml
ports:
  - "8001:8000"  # 改成其他端口
```

### Q3: Android 连接不上后端？

- **模拟器**：使用 `http://10.0.2.2:8000/`
- **真机**：
  1. 确保手机和电脑在同一网络
  2. 查看电脑 IP：`ipconfig`（Windows）或 `ifconfig`（Mac/Linux）
  3. 使用 `http://YOUR_IP:8000/`
  4. 确保防火墙允许 8000 端口

### Q4: 数据库迁移失败？

```bash
# 进入容器
docker-compose -f docker-compose.mock.yml exec backend bash

# 检查数据库连接
python -c "from app.core.database import engine; print('Connected')"

# 重新运行迁移
alembic upgrade head
```

### Q5: 想要自定义 Mock 数据？

编辑以下文件：
- `backend/app/services/ocr/mock_provider.py` - 修改 OCR 识别文本
- `backend/app/services/mock_deepseek_service.py` - 修改 AI 分析结果
- `backend/app/services/mock_sms_service.py` - 修改验证码

---

## 🧹 清理环境

### 停止服务

```bash
docker-compose -f docker-compose.mock.yml down
```

### 删除数据卷（清空数据库）

```bash
docker-compose -f docker-compose.mock.yml down -v
```

### 删除镜像

```bash
docker-compose -f docker-compose.mock.yml down --rmi all
```

---

## 📊 性能测试

### 并发测试

使用 Apache Bench 测试：
```bash
# 安装 ab
# Windows: 下载 Apache
# Mac: brew install httpd
# Linux: apt-get install apache2-utils

# 测试注册接口
ab -n 100 -c 10 -p register.json -T application/json \
  http://localhost:8000/api/v1/auth/register
```

### 压力测试

使用 Locust 测试：
```bash
pip install locust

# 创建 locustfile.py
# 运行测试
locust -f locustfile.py --host=http://localhost:8000
```

---

## 🎉 测试完成

恭喜！你已经完成了 Mock 版本的测试。

### 下一步

1. **熟悉功能**：多次测试各个功能，了解系统流程
2. **自定义数据**：修改 Mock 服务，添加更多测试场景
3. **准备部署**：当准备好后，切换到真实 API

### 切换到真实 API

1. 获取真实的 API 密钥
2. 修改 `.env` 文件，设置 `USE_MOCK_SERVICES=false`
3. 填写真实的 API 密钥
4. 重启服务：
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

---

**祝测试愉快！** 🚀

如有问题，随时告诉我！
