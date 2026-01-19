# 🎉 Mock 服务启动成功！

## ✅ 当前状态

所有服务已成功启动并运行：

- ✅ PostgreSQL 数据库 (端口 5432)
- ✅ Redis 缓存 (端口 6379)
- ✅ FastAPI 后端 (端口 8000)
- ✅ Celery Worker

## 🌐 访问地址

### API 文档
打开浏览器访问：**http://localhost:8000/docs**

这是 Swagger UI 界面，你可以在这里：
- 查看所有 API 端点
- 测试 API 功能
- 查看请求/响应格式

### 健康检查
```bash
curl http://localhost:8000/health
```

响应：
```json
{"status":"healthy","version":"1.0.0"}
```

## 🎭 Mock 模式特点

在 Mock 模式下：

1. **OCR 识别**：返回预设的模拟试卷文本
2. **AI 分析**：返回随机生成的分析结果
3. **图片存储**：文件保存在本地 Docker 卷中
4. **短信验证码**：所有手机号的验证码都是 `123456`

## 🧪 快速测试

### 1. 测试用户注册

```bash
curl -X POST http://localhost:8000/api/v1/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"phone\":\"13800138000\",\"password\":\"test123456\",\"verification_code\":\"123456\"}"
```

### 2. 测试用户登录

```bash
curl -X POST http://localhost:8000/api/v1/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"phone\":\"13800138000\",\"password\":\"test123456\"}"
```

### 3. 查看所有 API

访问：http://localhost:8000/docs

## 📱 Android 应用配置

如果要测试 Android 应用，需要修改 API 地址：

### Android 模拟器
```kotlin
const val BASE_URL = "http://10.0.2.2:8000/"
```

### 真机测试
```kotlin
const val BASE_URL = "http://你的电脑IP:8000/"
```

查看你的电脑 IP：
```bash
ipconfig
```
找到 "IPv4 地址"

## 🛠️ 常用命令

### 查看服务状态
```bash
docker-compose --env-file .env.mock -f docker-compose.mock.yml ps
```

### 查看日志
```bash
# 查看所有服务日志
docker-compose --env-file .env.mock -f docker-compose.mock.yml logs -f

# 只查看后端日志
docker-compose --env-file .env.mock -f docker-compose.mock.yml logs -f backend
```

### 停止服务
```bash
docker-compose --env-file .env.mock -f docker-compose.mock.yml down
```

### 重启服务
```bash
docker-compose --env-file .env.mock -f docker-compose.mock.yml restart
```

### 重新启动（包含环境变量）
```bash
docker-compose --env-file .env.mock -f docker-compose.mock.yml down
docker-compose --env-file .env.mock -f docker-compose.mock.yml up -d
```

## 🔧 问题排查

### 如果 API 无法访问

1. 检查服务状态：
```bash
docker-compose --env-file .env.mock -f docker-compose.mock.yml ps
```

2. 查看后端日志：
```bash
docker-compose --env-file .env.mock -f docker-compose.mock.yml logs backend
```

3. 重启后端：
```bash
docker-compose --env-file .env.mock -f docker-compose.mock.yml restart backend
```

### 如果端口被占用

修改 `docker-compose.mock.yml` 中的端口映射：
```yaml
ports:
  - "8001:8000"  # 改成其他端口
```

## 📝 解决的问题

在启动过程中，我们解决了以下问题：

1. ✅ Docker 镜像加速器配置
2. ✅ Python 包镜像源配置（使用清华源）
3. ✅ OpenCV 系统依赖安装（libgl1, libglib2.0-0）
4. ✅ 环境变量格式修正（ALLOWED_ORIGINS 使用 JSON 数组格式）
5. ✅ Docker Compose 命令修正（main:app 而不是 app.main:app）
6. ✅ Redis 客户端导出修正
7. ✅ 导入路径修正（get_current_user）

## 🎯 下一步

现在你可以：

1. **浏览 API 文档**：http://localhost:8000/docs
2. **测试 API 功能**：使用 Swagger UI 或 curl
3. **配置 Android 应用**：修改 BASE_URL 并运行
4. **开始开发**：所有后端服务已就绪

## 💡 提示

- Mock 模式完全免费，不需要任何外部 API
- 所有数据都存储在本地 Docker 卷中
- 验证码固定为 `123456`，方便测试
- 可以随时切换到真实 API（修改 `.env` 文件）

---

**祝你使用愉快！** 🚀
