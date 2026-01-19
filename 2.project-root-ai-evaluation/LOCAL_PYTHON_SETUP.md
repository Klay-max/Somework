# 🐍 本地 Python 运行指南（无需 Docker）

如果你不想安装 Docker，可以直接在本地运行 Python 后端。

## 📋 准备工作

### 需要的软件

- Python 3.10 或更高版本
- PostgreSQL 15
- Redis 7

---

## 🚀 快速开始

### 1. 安装 Python 依赖

```cmd
cd backend
pip install -r requirements.txt
```

### 2. 安装并启动 PostgreSQL

**下载安装**：
- 访问：https://www.postgresql.org/download/windows/
- 下载并安装 PostgreSQL 15

**创建数据库**：
```cmd
psql -U postgres
CREATE DATABASE examai;
\q
```

### 3. 安装并启动 Redis

**使用 WSL（推荐）**：
```cmd
wsl --install
wsl
sudo apt-get update
sudo apt-get install redis-server
redis-server
```

**或使用 Windows 版本**：
- 下载：https://github.com/microsoftarchive/redis/releases
- 解压并运行 `redis-server.exe`

### 4. 配置环境变量

创建 `backend/.env` 文件：

```bash
# 数据库配置
DATABASE_URL=postgresql+asyncpg://postgres:your_password@localhost:5432/examai

# Redis 配置
REDIS_URL=redis://localhost:6379/0

# 应用配置
SECRET_KEY=mock_secret_key_for_development_only_12345678
JWT_SECRET_KEY=mock_jwt_secret_key_for_development_only_12345678
ENVIRONMENT=development
LOG_LEVEL=debug

# Mock 模式
USE_MOCK_SERVICES=true

# Celery 配置
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2
```

### 5. 运行数据库迁移

```cmd
cd backend
alembic upgrade head
```

### 6. 启动后端服务

```cmd
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 7. 启动 Celery Worker（新终端）

```cmd
cd backend
celery -A app.tasks.celery_app worker --loglevel=info
```

### 8. 访问 API 文档

打开浏览器访问：http://localhost:8000/docs

---

## ✅ 验证

测试健康检查：
```cmd
curl http://localhost:8000/health
```

测试注册（验证码：123456）：
```cmd
curl -X POST http://localhost:8000/api/v1/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"phone\":\"13800138000\",\"password\":\"test123\",\"verification_code\":\"123456\"}"
```

---

## 🛑 停止服务

按 `Ctrl+C` 停止 uvicorn 和 celery

---

## 💡 提示

- 这种方式需要手动管理多个服务
- Docker 方式更简单，推荐安装 Docker Desktop
- 如果遇到问题，建议使用 Docker 方式
