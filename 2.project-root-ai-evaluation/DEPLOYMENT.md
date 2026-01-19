# 部署指南

本文档提供 AI 试卷拍照测评工具的完整部署指南。

---

## 目录

1. [环境要求](#环境要求)
2. [Docker Compose 部署](#docker-compose-部署)
3. [Kubernetes 部署](#kubernetes-部署)
4. [监控配置](#监控配置)
5. [SSL 证书配置](#ssl-证书配置)
6. [备份和恢复](#备份和恢复)
7. [故障排查](#故障排查)

---

## 环境要求

### 硬件要求

**最小配置**:
- CPU: 4 核
- 内存: 8GB
- 存储: 50GB SSD

**推荐配置**:
- CPU: 8 核
- 内存: 16GB
- 存储: 100GB SSD

### 软件要求

- Docker 20.10+
- Docker Compose 2.0+
- Kubernetes 1.24+ (可选)
- kubectl (可选)

---

## Docker Compose 部署

### 1. 准备环境

```bash
# 克隆代码
git clone <repository-url>
cd exam-assessment

# 复制环境变量文件
cp .env.example .env

# 编辑环境变量
nano .env
```

### 2. 配置环境变量

编辑 `.env` 文件，设置以下关键变量：

```bash
# 数据库密码（必须修改）
POSTGRES_PASSWORD=your_secure_password

# Redis 密码（必须修改）
REDIS_PASSWORD=your_redis_password

# 应用密钥（必须修改，至少32字符）
SECRET_KEY=your_secret_key_min_32_characters

# API 密钥
BAIDU_OCR_API_KEY=your_baidu_api_key
BAIDU_OCR_SECRET_KEY=your_baidu_secret_key
DEEPSEEK_API_KEY=your_deepseek_api_key

# Grafana 密码
GRAFANA_PASSWORD=your_grafana_password
```

### 3. 启动服务

```bash
# 使用生产配置启动
docker-compose -f docker-compose.prod.yml up -d

# 查看日志
docker-compose -f docker-compose.prod.yml logs -f

# 查看服务状态
docker-compose -f docker-compose.prod.yml ps
```

### 4. 初始化数据库

```bash
# 运行数据库迁移
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head

# 创建初始管理员用户（可选）
docker-compose -f docker-compose.prod.yml exec backend python scripts/create_admin.py
```

### 5. 验证部署

```bash
# 检查后端健康状态
curl http://localhost/health

# 检查 API 文档
curl http://localhost/docs

# 检查 Prometheus
curl http://localhost:9090

# 检查 Grafana
curl http://localhost:3000
```

---

## Kubernetes 部署

### 1. 准备 Kubernetes 集群

确保你有一个运行中的 Kubernetes 集群，并且 kubectl 已配置。

```bash
# 验证集群连接
kubectl cluster-info
kubectl get nodes
```

### 2. 创建命名空间

```bash
kubectl apply -f k8s/namespace.yaml
```

### 3. 配置 Secrets

**重要**: 不要直接使用 `k8s/secrets.yaml`，而是使用 kubectl 创建：

```bash
# 创建 secrets
kubectl create secret generic exam-assessment-secrets \
  --from-literal=POSTGRES_PASSWORD=your_password \
  --from-literal=REDIS_PASSWORD=your_redis_password \
  --from-literal=SECRET_KEY=your_secret_key \
  --from-literal=JWT_SECRET_KEY=your_jwt_key \
  --from-literal=BAIDU_OCR_API_KEY=your_baidu_key \
  --from-literal=BAIDU_OCR_SECRET_KEY=your_baidu_secret \
  --from-literal=DEEPSEEK_API_KEY=your_deepseek_key \
  --from-literal=GRAFANA_PASSWORD=your_grafana_password \
  -n exam-assessment
```

### 4. 应用配置

```bash
# 应用 ConfigMap
kubectl apply -f k8s/configmap.yaml

# 部署数据库
kubectl apply -f k8s/postgres-deployment.yaml

# 部署 Redis
kubectl apply -f k8s/redis-deployment.yaml

# 等待数据库和 Redis 就绪
kubectl wait --for=condition=ready pod -l app=postgres -n exam-assessment --timeout=300s
kubectl wait --for=condition=ready pod -l app=redis -n exam-assessment --timeout=300s

# 部署后端
kubectl apply -f k8s/backend-deployment.yaml

# 部署 Celery
kubectl apply -f k8s/celery-deployment.yaml

# 配置 Ingress
kubectl apply -f k8s/ingress.yaml
```

### 5. 验证部署

```bash
# 查看所有资源
kubectl get all -n exam-assessment

# 查看 Pod 状态
kubectl get pods -n exam-assessment

# 查看服务
kubectl get services -n exam-assessment

# 查看日志
kubectl logs -f deployment/backend -n exam-assessment
```

### 6. 数据库迁移

```bash
# 运行迁移
kubectl exec -it deployment/backend -n exam-assessment -- alembic upgrade head
```

---

## 监控配置

### Prometheus

访问 Prometheus: `http://your-domain:9090`

**主要指标**:
- `http_requests_total`: HTTP 请求总数
- `http_request_duration_seconds`: 请求延迟
- `celery_task_total`: Celery 任务总数
- `postgres_up`: PostgreSQL 状态
- `redis_up`: Redis 状态

### Grafana

访问 Grafana: `http://your-domain:3000`

**默认登录**:
- 用户名: admin
- 密码: 在 `.env` 中设置的 `GRAFANA_PASSWORD`

**推荐仪表板**:
1. FastAPI 应用监控
2. PostgreSQL 数据库监控
3. Redis 缓存监控
4. Celery 任务队列监控
5. 系统资源监控

---

## SSL 证书配置

### 使用 Let's Encrypt

```bash
# 安装 certbot
sudo apt-get install certbot

# 获取证书
sudo certbot certonly --standalone -d your-domain.com

# 复制证书到 nginx 目录
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/key.pem

# 重启 nginx
docker-compose -f docker-compose.prod.yml restart nginx
```

### 自动续期

```bash
# 添加 cron 任务
sudo crontab -e

# 添加以下行（每天凌晨2点检查续期）
0 2 * * * certbot renew --quiet && docker-compose -f /path/to/docker-compose.prod.yml restart nginx
```

---

## 备份和恢复

### 数据库备份

```bash
# 创建备份
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres exam_assessment > backup_$(date +%Y%m%d).sql

# 或使用 Kubernetes
kubectl exec -it deployment/postgres -n exam-assessment -- pg_dump -U postgres exam_assessment > backup_$(date +%Y%m%d).sql
```

### 数据库恢复

```bash
# Docker Compose
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U postgres exam_assessment < backup.sql

# Kubernetes
kubectl exec -i deployment/postgres -n exam-assessment -- psql -U postgres exam_assessment < backup.sql
```

### Redis 备份

```bash
# Redis 自动持久化到 /data
# 复制 RDB 文件
docker cp exam_assessment_redis:/data/dump.rdb ./redis_backup_$(date +%Y%m%d).rdb
```

---

## 故障排查

### 常见问题

#### 1. 容器无法启动

```bash
# 查看日志
docker-compose -f docker-compose.prod.yml logs backend

# 检查配置
docker-compose -f docker-compose.prod.yml config
```

#### 2. 数据库连接失败

```bash
# 检查数据库状态
docker-compose -f docker-compose.prod.yml exec postgres pg_isready

# 检查连接字符串
docker-compose -f docker-compose.prod.yml exec backend env | grep DATABASE_URL
```

#### 3. Celery 任务不执行

```bash
# 检查 Celery worker 状态
docker-compose -f docker-compose.prod.yml logs celery_worker

# 检查 Redis 连接
docker-compose -f docker-compose.prod.yml exec redis redis-cli ping
```

#### 4. 内存不足

```bash
# 查看资源使用
docker stats

# 增加资源限制
# 编辑 docker-compose.prod.yml 中的 deploy.resources
```

### 日志查看

```bash
# 查看所有服务日志
docker-compose -f docker-compose.prod.yml logs -f

# 查看特定服务日志
docker-compose -f docker-compose.prod.yml logs -f backend

# Kubernetes 日志
kubectl logs -f deployment/backend -n exam-assessment
```

### 性能调优

#### 1. 数据库优化

```sql
-- 创建索引
CREATE INDEX idx_exams_user_id ON exams(user_id);
CREATE INDEX idx_exams_created_at ON exams(created_at);

-- 分析查询性能
EXPLAIN ANALYZE SELECT * FROM exams WHERE user_id = 1;
```

#### 2. Redis 优化

```bash
# 增加最大内存
# 编辑 docker-compose.prod.yml
command: redis-server --maxmemory 2gb --maxmemory-policy allkeys-lru
```

#### 3. Nginx 优化

```nginx
# 增加 worker 进程
worker_processes auto;

# 增加连接数
worker_connections 2048;
```

---

## 安全建议

1. **定期更新密码**: 定期更换数据库和 Redis 密码
2. **使用 HTTPS**: 始终使用 SSL/TLS 加密
3. **限制访问**: 使用防火墙限制端口访问
4. **定期备份**: 每天自动备份数据库
5. **监控日志**: 定期检查异常日志
6. **更新依赖**: 定期更新 Docker 镜像和依赖包

---

## 扩展性

### 水平扩展

```bash
# Docker Compose 扩展
docker-compose -f docker-compose.prod.yml up -d --scale backend=3 --scale celery_worker=4

# Kubernetes 扩展
kubectl scale deployment backend --replicas=5 -n exam-assessment
kubectl scale deployment celery-worker --replicas=6 -n exam-assessment
```

### 垂直扩展

编辑资源限制：

```yaml
# docker-compose.prod.yml
deploy:
  resources:
    limits:
      cpus: '4'
      memory: 4G
```

---

## 联系支持

如有问题，请联系技术支持团队或查看项目文档。

**文档更新日期**: 2024年12月25日
