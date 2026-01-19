# AI 试卷拍照测评工具 - 后端服务

## 项目结构

```
backend/
├── app/
│   ├── api/          # API 路由
│   ├── core/         # 核心配置
│   ├── models/       # 数据模型
│   ├── schemas/      # Pydantic 模式
│   ├── services/     # 业务逻辑
│   └── tasks/        # Celery 任务
├── tests/            # 测试文件
├── main.py           # 应用入口
├── requirements.txt  # 依赖列表
└── Dockerfile        # Docker 配置
```

## 快速开始

### 1. 安装依赖

```bash
pip install -r requirements.txt
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并填写配置：

```bash
cp .env.example .env
```

### 3. 启动数据库和 Redis

```bash
docker-compose up -d postgres redis
```

### 4. 运行数据库迁移

```bash
alembic upgrade head
```

### 5. 启动应用

```bash
python main.py
```

或使用 uvicorn：

```bash
uvicorn main:app --reload
```

## 使用 Docker Compose

启动所有服务：

```bash
docker-compose up -d
```

查看日志：

```bash
docker-compose logs -f backend
```

停止服务：

```bash
docker-compose down
```

## API 文档

启动应用后访问：

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 监控

- Prometheus: http://localhost:9090

## 测试

运行所有测试：

```bash
pytest
```

运行带覆盖率的测试：

```bash
pytest --cov=app --cov-report=html
```

## 开发指南

### 添加新的 API 端点

1. 在 `app/api/v1/` 创建路由文件
2. 在 `app/schemas/` 定义请求/响应模式
3. 在 `app/services/` 实现业务逻辑
4. 在 `app/api/v1/__init__.py` 注册路由

### 数据库迁移

创建新迁移：

```bash
alembic revision --autogenerate -m "描述"
```

应用迁移：

```bash
alembic upgrade head
```

回滚迁移：

```bash
alembic downgrade -1
```
