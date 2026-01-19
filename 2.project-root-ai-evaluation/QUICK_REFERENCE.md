# 🚀 快速参考卡片

生产部署常用命令速查表

---

## 📦 部署命令

### 快速部署
```bash
# Windows
start-production.bat

# Linux/Mac
chmod +x start-production.sh
./start-production.sh
```

### 手动部署
```bash
# 1. 检查环境
./scripts/pre-deployment-check.sh

# 2. 构建镜像
docker-compose -f docker-compose.prod.yml build

# 3. 启动服务
docker-compose -f docker-compose.prod.yml up -d

# 4. 运行迁移
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head

# 5. 验证部署
./scripts/verify-deployment.sh
```

---

## 🔍 监控命令

### 查看服务状态
```bash
docker-compose -f docker-compose.prod.yml ps
```

### 查看日志
```bash
# 所有服务
docker-compose -f docker-compose.prod.yml logs -f

# 特定服务
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f celery_worker
docker-compose -f docker-compose.prod.yml logs -f postgres
```

### 查看资源使用
```bash
docker stats
```

---

## 🔄 服务控制

### 重启服务
```bash
# 重启所有服务
docker-compose -f docker-compose.prod.yml restart

# 重启特定服务
docker-compose -f docker-compose.prod.yml restart backend
```

### 停止服务
```bash
# 停止所有服务
docker-compose -f docker-compose.prod.yml stop

# 停止特定服务
docker-compose -f docker-compose.prod.yml stop backend
```

### 启动服务
```bash
# 启动所有服务
docker-compose -f docker-compose.prod.yml start

# 启动特定服务
docker-compose -f docker-compose.prod.yml start backend
```

---

## 💾 备份与恢复

### 备份
```bash
# 自动备份
./scripts/backup.sh

# 手动备份数据库
docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U postgres exam_assessment > backup.sql
```

### 恢复
```bash
# 恢复数据库
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U postgres exam_assessment < backup.sql
```

---

## 🗄️ 数据库操作

### 连接数据库
```bash
docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres exam_assessment
```

### 常用SQL
```sql
-- 查看所有表
\dt

-- 查看用户数
SELECT COUNT(*) FROM users;

-- 查看试卷数
SELECT COUNT(*) FROM exams;

-- 查看最近的试卷
SELECT exam_id, status, created_at FROM exams ORDER BY created_at DESC LIMIT 10;

-- 退出
\q
```

---

## 📊 Redis操作

### 连接Redis
```bash
docker-compose -f docker-compose.prod.yml exec redis redis-cli -a $REDIS_PASSWORD
```

### 常用命令
```bash
# 查看所有键
KEYS *

# 查看队列长度
LLEN celery

# 查看内存使用
INFO memory

# 退出
exit
```

---

## 🔧 故障排查

### 检查健康状态
```bash
curl http://localhost/health
```

### 检查API文档
```bash
curl http://localhost/docs
```

### 查看容器日志
```bash
# 最近100行
docker-compose -f docker-compose.prod.yml logs --tail=100 backend

# 实时跟踪
docker-compose -f docker-compose.prod.yml logs -f backend
```

### 进入容器
```bash
# 进入后端容器
docker-compose -f docker-compose.prod.yml exec backend bash

# 进入数据库容器
docker-compose -f docker-compose.prod.yml exec postgres bash
```

---

## 🔄 更新部署

### 更新代码
```bash
# 1. 拉取最新代码
git pull origin main

# 2. 重新构建
docker-compose -f docker-compose.prod.yml build backend

# 3. 滚动更新
docker-compose -f docker-compose.prod.yml up -d --no-deps backend

# 4. 运行迁移
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head
```

---

## 📈 扩展服务

### 水平扩展
```bash
# 扩展后端
docker-compose -f docker-compose.prod.yml up -d --scale backend=3

# 扩展Celery worker
docker-compose -f docker-compose.prod.yml up -d --scale celery_worker=4
```

---

## 🧹 清理命令

### 清理未使用的资源
```bash
# 清理停止的容器
docker container prune

# 清理未使用的镜像
docker image prune

# 清理未使用的卷
docker volume prune

# 清理所有未使用的资源
docker system prune -a
```

### 完全重置（危险！）
```bash
# 停止并删除所有容器和卷
docker-compose -f docker-compose.prod.yml down -v

# 删除所有镜像
docker-compose -f docker-compose.prod.yml down --rmi all
```

---

## 🌐 访问地址

| 服务 | 地址 | 说明 |
|------|------|------|
| API | http://localhost | 主API服务 |
| API文档 | http://localhost/docs | Swagger文档 |
| Prometheus | http://localhost:9090 | 监控指标 |
| Grafana | http://localhost:3000 | 可视化监控 |

---

## 🔑 默认凭证

| 服务 | 用户名 | 密码 |
|------|--------|------|
| PostgreSQL | postgres | 在.env中配置 |
| Redis | - | 在.env中配置 |
| Grafana | admin | 在.env中配置 |

---

## 📞 获取帮助

- 查看完整文档: [PRODUCTION_DEPLOYMENT_GUIDE.md](PRODUCTION_DEPLOYMENT_GUIDE.md)
- API密钥指南: [API_KEYS_GUIDE.md](API_KEYS_GUIDE.md)
- 部署指南: [DEPLOYMENT.md](DEPLOYMENT.md)
- 项目状态: [PROJECT_STATUS.md](PROJECT_STATUS.md)

---

**提示**: 将此文件保存为书签，方便快速查找命令！

