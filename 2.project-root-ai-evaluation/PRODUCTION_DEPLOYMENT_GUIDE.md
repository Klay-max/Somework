# 🚀 生产环境部署完整指南

**更新日期**: 2026年1月7日  
**项目**: AI 试卷拍照测评工具  
**状态**: 生产就绪（90%）

---

## 📋 目录

1. [部署前检查清单](#部署前检查清单)
2. [环境配置](#环境配置)
3. [快速部署](#快速部署)
4. [详细部署步骤](#详细部署步骤)
5. [验证与测试](#验证与测试)
6. [监控配置](#监控配置)
7. [备份策略](#备份策略)
8. [故障排查](#故障排查)

---

## ✅ 部署前检查清单

### 硬件要求

**最小配置** (测试环境):
- [ ] CPU: 4核
- [ ] 内存: 8GB
- [ ] 存储: 50GB SSD
- [ ] 网络: 100Mbps

**推荐配置** (生产环境):
- [ ] CPU: 8核
- [ ] 内存: 16GB
- [ ] 存储: 100GB SSD
- [ ] 网络: 1Gbps

### 软件要求

- [ ] Docker 20.10+ 已安装
- [ ] Docker Compose 2.0+ 已安装
- [ ] Git 已安装
- [ ] 域名已配置（可选）
- [ ] SSL证书已准备（可选）

### API密钥准备

**必需的API密钥**:

- [ ] **百度OCR** 或 **腾讯云OCR**
  - 百度OCR: https://cloud.baidu.com/product/ocr
  - 腾讯云OCR: https://cloud.tencent.com/product/ocr
  - 需要: API Key + Secret Key

- [ ] **DeepSeek API**
  - 官网: https://www.deepseek.com/
  - 需要: API Key
  - 用途: AI诊断和分析

**可选的API密钥**:
- [ ] **阿里云OSS** (对象存储)
  - 官网: https://www.aliyun.com/product/oss
  - 需要: Access Key + Secret Key
  - 用途: 图片和报告存储

- [ ] **短信服务** (阿里云/腾讯云)
  - 用途: 发送验证码
  - 需要: API Key + Secret

### 安全检查

- [ ] 所有密码已更改（不使用默认密码）
- [ ] SECRET_KEY 已生成（至少32字符）
- [ ] JWT_SECRET_KEY 已生成
- [ ] 数据库密码强度足够（建议16+字符）
- [ ] Redis密码已设置
- [ ] Grafana管理员密码已更改

---

## 🔧 环境配置

### 步骤1: 克隆项目

```bash
# 克隆代码
git clone <your-repository-url>
cd exam-assessment

# 检查项目结构
ls -la
```

### 步骤2: 创建环境配置文件

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量
nano .env  # 或使用 vim、code 等编辑器
```

### 步骤3: 配置关键环境变量

打开 `.env` 文件，配置以下关键变量：


#### 数据库配置
```bash
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_strong_password_here_16chars
POSTGRES_DB=exam_assessment
```

#### Redis配置
```bash
REDIS_PASSWORD=your_redis_password_16chars
```

#### 应用密钥（重要！）
```bash
# 生成32字符以上的随机字符串
SECRET_KEY=your_secret_key_min_32_characters_random_string
JWT_SECRET_KEY=your_jwt_secret_key_32_characters_random
```

**生成随机密钥的方法**:
```bash
# Linux/Mac
openssl rand -hex 32

# Python
python -c "import secrets; print(secrets.token_hex(32))"

# PowerShell (Windows)
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

#### OCR API配置
```bash
# 百度OCR（推荐）
BAIDU_OCR_API_KEY=your_baidu_api_key
BAIDU_OCR_SECRET_KEY=your_baidu_secret_key

# 或腾讯云OCR
TENCENT_OCR_SECRET_ID=your_tencent_secret_id
TENCENT_OCR_SECRET_KEY=your_tencent_secret_key
```

#### DeepSeek API配置
```bash
DEEPSEEK_API_KEY=your_deepseek_api_key
```

#### 可选配置
```bash
# 阿里云OSS
ALIYUN_OSS_ACCESS_KEY=your_aliyun_access_key
ALIYUN_OSS_SECRET_KEY=your_aliyun_secret_key
ALIYUN_OSS_BUCKET=your_bucket_name
ALIYUN_OSS_ENDPOINT=oss-cn-hangzhou.aliyuncs.com

# Grafana
GRAFANA_USER=admin
GRAFANA_PASSWORD=your_grafana_password_16chars

# CORS（如果有前端域名）
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### 步骤4: 验证配置

```bash
# 检查配置文件
cat .env | grep -v "^#" | grep -v "^$"

# 确保没有包含 "your_" 或 "CHANGE_ME" 的值
cat .env | grep -E "your_|CHANGE_ME"
```

如果上面的命令有输出，说明还有未配置的变量！

---

## 🚀 快速部署

### 方案A: 使用部署脚本（推荐）

```bash
# 给脚本添加执行权限
chmod +x scripts/deploy.sh

# 执行部署
./scripts/deploy.sh production
```

脚本会自动：
1. ✅ 检查环境变量
2. ✅ 构建Docker镜像
3. ✅ 启动所有服务
4. ✅ 运行数据库迁移
5. ✅ 执行健康检查


### 方案B: 手动部署

```bash
# 1. 构建镜像
docker-compose -f docker-compose.prod.yml build

# 2. 启动服务
docker-compose -f docker-compose.prod.yml up -d

# 3. 等待服务启动
sleep 10

# 4. 查看服务状态
docker-compose -f docker-compose.prod.yml ps

# 5. 运行数据库迁移
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head

# 6. 检查健康状态
curl http://localhost/health
```

---

## 📝 详细部署步骤

### 第一步: 启动基础服务

```bash
# 启动数据库和Redis
docker-compose -f docker-compose.prod.yml up -d postgres redis

# 等待服务就绪
docker-compose -f docker-compose.prod.yml logs -f postgres redis
# 看到 "database system is ready to accept connections" 后按 Ctrl+C
```

### 第二步: 初始化数据库

```bash
# 运行数据库迁移
docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres -c "CREATE DATABASE exam_assessment;"

# 或者如果数据库已存在
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head
```

### 第三步: 启动应用服务

```bash
# 启动后端和Celery
docker-compose -f docker-compose.prod.yml up -d backend celery_worker celery_beat

# 查看日志
docker-compose -f docker-compose.prod.yml logs -f backend
```

### 第四步: 启动监控服务

```bash
# 启动Prometheus和Grafana
docker-compose -f docker-compose.prod.yml up -d prometheus grafana node_exporter redis_exporter postgres_exporter

# 查看所有服务状态
docker-compose -f docker-compose.prod.yml ps
```

### 第五步: 启动Nginx

```bash
# 启动Nginx反向代理
docker-compose -f docker-compose.prod.yml up -d nginx

# 检查Nginx配置
docker-compose -f docker-compose.prod.yml exec nginx nginx -t
```

---

## ✅ 验证与测试

### 1. 健康检查

```bash
# 检查后端健康状态
curl http://localhost/health

# 预期输出: {"status":"healthy"}
```

### 2. API文档访问

```bash
# 在浏览器中打开
http://localhost/docs

# 或使用curl
curl http://localhost/docs
```

### 3. 测试用户注册

```bash
# 发送验证码
curl -X POST http://localhost/api/v1/auth/send-code \
  -H "Content-Type: application/json" \
  -d '{"phone": "13800138000"}'

# 注册用户
curl -X POST http://localhost/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "13800138000",
    "password": "Test123456",
    "verification_code": "收到的验证码"
  }'
```

### 4. 测试用户登录

```bash
curl -X POST http://localhost/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "13800138000",
    "password": "Test123456"
  }'

# 保存返回的 access_token
```


### 5. 测试图片上传

```bash
# 使用获取的token上传图片
curl -X POST http://localhost/api/v1/exams/upload \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "image=@/path/to/exam_image.jpg"

# 保存返回的 exam_id
```

### 6. 查询处理状态

```bash
curl -X GET http://localhost/api/v1/exams/{exam_id}/status \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 7. 检查服务日志

```bash
# 查看所有服务日志
docker-compose -f docker-compose.prod.yml logs -f

# 查看特定服务日志
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f celery_worker
docker-compose -f docker-compose.prod.yml logs -f postgres
docker-compose -f docker-compose.prod.yml logs -f redis
```

---

## 📊 监控配置

### Prometheus监控

访问: `http://localhost:9090`

**检查监控目标**:
1. 进入 Status → Targets
2. 确认所有目标状态为 "UP"

**关键指标查询**:
```promql
# HTTP请求总数
http_requests_total

# 请求延迟
http_request_duration_seconds

# Celery任务数
celery_task_total

# 数据库连接数
pg_stat_database_numbackends

# Redis内存使用
redis_memory_used_bytes
```

### Grafana仪表板

访问: `http://localhost:3000`

**默认登录**:
- 用户名: `admin`
- 密码: 在 `.env` 中设置的 `GRAFANA_PASSWORD`

**配置数据源**:
1. 登录Grafana
2. Configuration → Data Sources
3. 添加Prometheus数据源
4. URL: `http://prometheus:9090`
5. 点击 "Save & Test"

**导入仪表板**:
1. Create → Import
2. 上传 `monitoring/grafana/dashboards/` 中的JSON文件
3. 或使用以下ID导入社区仪表板:
   - FastAPI: 14280
   - PostgreSQL: 9628
   - Redis: 11835
   - Node Exporter: 1860

---

## 💾 备份策略

### 自动备份配置

```bash
# 给备份脚本添加执行权限
chmod +x scripts/backup.sh

# 手动执行备份
./scripts/backup.sh
```

### 配置定时备份

**Linux/Mac (使用cron)**:
```bash
# 编辑crontab
crontab -e

# 添加每天凌晨2点自动备份
0 2 * * * /path/to/exam-assessment/scripts/backup.sh >> /var/log/exam-backup.log 2>&1
```

**Windows (使用任务计划程序)**:
1. 打开"任务计划程序"
2. 创建基本任务
3. 触发器: 每天凌晨2点
4. 操作: 启动程序 `bash.exe`
5. 参数: `/path/to/scripts/backup.sh`

### 备份验证

```bash
# 查看备份文件
ls -lh backups/

# 测试恢复（在测试环境）
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U postgres exam_assessment < backups/postgres_YYYYMMDD_HHMMSS.sql
```


---

## 🔒 SSL证书配置（可选但推荐）

### 使用Let's Encrypt免费证书

```bash
# 1. 安装certbot
sudo apt-get update
sudo apt-get install certbot

# 2. 停止nginx（临时）
docker-compose -f docker-compose.prod.yml stop nginx

# 3. 获取证书
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# 4. 复制证书到项目目录
sudo mkdir -p nginx/ssl
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/key.pem
sudo chown -R $USER:$USER nginx/ssl

# 5. 重启nginx
docker-compose -f docker-compose.prod.yml start nginx
```

### 配置自动续期

```bash
# 添加续期脚本
sudo crontab -e

# 添加以下行（每天凌晨3点检查续期）
0 3 * * * certbot renew --quiet --post-hook "cd /path/to/exam-assessment && docker-compose -f docker-compose.prod.yml restart nginx"
```

---

## 🐛 故障排查

### 问题1: 容器无法启动

**症状**: `docker-compose up` 失败

**排查步骤**:
```bash
# 1. 查看详细日志
docker-compose -f docker-compose.prod.yml logs backend

# 2. 检查配置
docker-compose -f docker-compose.prod.yml config

# 3. 检查端口占用
netstat -tulpn | grep -E ':(80|443|5432|6379|8000)'

# 4. 检查磁盘空间
df -h
```

### 问题2: 数据库连接失败

**症状**: "could not connect to database"

**排查步骤**:
```bash
# 1. 检查数据库状态
docker-compose -f docker-compose.prod.yml exec postgres pg_isready

# 2. 检查数据库日志
docker-compose -f docker-compose.prod.yml logs postgres

# 3. 测试连接
docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres -c "SELECT 1;"

# 4. 检查环境变量
docker-compose -f docker-compose.prod.yml exec backend env | grep DATABASE_URL
```

### 问题3: Celery任务不执行

**症状**: 上传后状态一直是 "UPLOADED"

**排查步骤**:
```bash
# 1. 检查Celery worker状态
docker-compose -f docker-compose.prod.yml logs celery_worker

# 2. 检查Redis连接
docker-compose -f docker-compose.prod.yml exec redis redis-cli -a $REDIS_PASSWORD ping

# 3. 手动触发任务测试
docker-compose -f docker-compose.prod.yml exec backend python -c "
from app.tasks.exam_tasks import process_exam_ocr
result = process_exam_ocr.delay('test_exam_id')
print(result.id)
"

# 4. 查看任务队列
docker-compose -f docker-compose.prod.yml exec redis redis-cli -a $REDIS_PASSWORD LLEN celery
```

### 问题4: API返回500错误

**症状**: API请求返回500 Internal Server Error

**排查步骤**:
```bash
# 1. 查看后端日志
docker-compose -f docker-compose.prod.yml logs -f backend | grep ERROR

# 2. 检查API密钥配置
docker-compose -f docker-compose.prod.yml exec backend env | grep -E "BAIDU|DEEPSEEK"

# 3. 测试API连接
docker-compose -f docker-compose.prod.yml exec backend python -c "
import os
print('BAIDU_OCR_API_KEY:', os.getenv('BAIDU_OCR_API_KEY')[:10] + '...')
print('DEEPSEEK_API_KEY:', os.getenv('DEEPSEEK_API_KEY')[:10] + '...')
"
```

### 问题5: 内存不足

**症状**: 容器频繁重启或OOM killed

**解决方案**:
```bash
# 1. 查看资源使用
docker stats

# 2. 增加swap空间（Linux）
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 3. 调整容器资源限制
# 编辑 docker-compose.prod.yml
# 增加 memory 限制
```


---

## 🔧 性能优化建议

### 数据库优化

```sql
-- 连接到数据库
docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres exam_assessment

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_exams_user_id ON exams(user_id);
CREATE INDEX IF NOT EXISTS idx_exams_status ON exams(status);
CREATE INDEX IF NOT EXISTS idx_exams_created_at ON exams(created_at);

-- 分析表
ANALYZE exams;
ANALYZE users;

-- 查看慢查询
SELECT query, calls, total_time, mean_time 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

### Redis优化

```bash
# 配置最大内存和淘汰策略
docker-compose -f docker-compose.prod.yml exec redis redis-cli -a $REDIS_PASSWORD CONFIG SET maxmemory 2gb
docker-compose -f docker-compose.prod.yml exec redis redis-cli -a $REDIS_PASSWORD CONFIG SET maxmemory-policy allkeys-lru

# 查看内存使用
docker-compose -f docker-compose.prod.yml exec redis redis-cli -a $REDIS_PASSWORD INFO memory
```

### Celery优化

```bash
# 增加worker并发数
# 编辑 docker-compose.prod.yml
# 修改 celery_worker 的 command:
command: celery -A app.tasks.celery_app worker --loglevel=info --concurrency=8

# 重启服务
docker-compose -f docker-compose.prod.yml restart celery_worker
```

---

## 📈 扩展部署

### 水平扩展

```bash
# 扩展后端服务
docker-compose -f docker-compose.prod.yml up -d --scale backend=3

# 扩展Celery worker
docker-compose -f docker-compose.prod.yml up -d --scale celery_worker=4

# 查看扩展后的服务
docker-compose -f docker-compose.prod.yml ps
```

### 负载均衡

如果使用多个后端实例，Nginx会自动进行负载均衡。

查看 `nginx/nginx.conf` 中的upstream配置。

---

## 🔄 更新部署

### 更新应用代码

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 重新构建镜像
docker-compose -f docker-compose.prod.yml build backend

# 3. 滚动更新（零停机）
docker-compose -f docker-compose.prod.yml up -d --no-deps backend

# 4. 运行数据库迁移（如果有）
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head
```

### 回滚部署

```bash
# 1. 切换到之前的版本
git checkout <previous-commit-hash>

# 2. 重新构建和部署
docker-compose -f docker-compose.prod.yml build backend
docker-compose -f docker-compose.prod.yml up -d --no-deps backend

# 3. 回滚数据库（如果需要）
docker-compose -f docker-compose.prod.yml exec backend alembic downgrade -1
```

---

## 📞 运维命令速查

### 常用命令

```bash
# 查看所有服务状态
docker-compose -f docker-compose.prod.yml ps

# 查看实时日志
docker-compose -f docker-compose.prod.yml logs -f

# 重启特定服务
docker-compose -f docker-compose.prod.yml restart backend

# 停止所有服务
docker-compose -f docker-compose.prod.yml stop

# 启动所有服务
docker-compose -f docker-compose.prod.yml start

# 完全停止并删除容器
docker-compose -f docker-compose.prod.yml down

# 停止并删除所有数据（危险！）
docker-compose -f docker-compose.prod.yml down -v
```

### 数据库命令

```bash
# 进入数据库
docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres exam_assessment

# 备份数据库
docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U postgres exam_assessment > backup.sql

# 恢复数据库
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U postgres exam_assessment < backup.sql

# 查看数据库大小
docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres -c "SELECT pg_size_pretty(pg_database_size('exam_assessment'));"
```

### Redis命令

```bash
# 进入Redis CLI
docker-compose -f docker-compose.prod.yml exec redis redis-cli -a $REDIS_PASSWORD

# 查看所有键
docker-compose -f docker-compose.prod.yml exec redis redis-cli -a $REDIS_PASSWORD KEYS '*'

# 清空所有数据（危险！）
docker-compose -f docker-compose.prod.yml exec redis redis-cli -a $REDIS_PASSWORD FLUSHALL

# 查看内存使用
docker-compose -f docker-compose.prod.yml exec redis redis-cli -a $REDIS_PASSWORD INFO memory
```


---

## 📋 部署检查清单

部署完成后，请逐项检查：

### 基础服务
- [ ] PostgreSQL 运行正常
- [ ] Redis 运行正常
- [ ] 后端服务启动成功
- [ ] Celery worker 运行正常
- [ ] Nginx 反向代理工作

### API测试
- [ ] `/health` 端点返回正常
- [ ] `/docs` API文档可访问
- [ ] 用户注册功能正常
- [ ] 用户登录功能正常
- [ ] 图片上传功能正常
- [ ] 状态查询功能正常

### 监控系统
- [ ] Prometheus 可访问
- [ ] Grafana 可访问并登录
- [ ] 所有监控目标状态为 UP
- [ ] 仪表板显示正常

### 安全配置
- [ ] 所有默认密码已更改
- [ ] SSL证书已配置（如果使用HTTPS）
- [ ] 防火墙规则已配置
- [ ] 备份策略已设置

### 性能测试
- [ ] 单次上传处理时间 < 60秒
- [ ] API响应时间 < 200ms
- [ ] 并发测试通过
- [ ] 内存使用正常

---

## 🎯 下一步行动

### 立即行动（必需）

1. **配置API密钥**
   - [ ] 获取百度OCR或腾讯云OCR密钥
   - [ ] 获取DeepSeek API密钥
   - [ ] 配置到 `.env` 文件

2. **执行部署**
   - [ ] 运行部署脚本
   - [ ] 验证所有服务正常
   - [ ] 执行完整测试

3. **配置监控**
   - [ ] 登录Grafana
   - [ ] 导入仪表板
   - [ ] 设置告警规则

4. **设置备份**
   - [ ] 配置自动备份
   - [ ] 测试备份恢复
   - [ ] 验证备份文件

### 短期行动（建议）

1. **性能测试**
   - [ ] 使用Locust进行负载测试
   - [ ] 验证60秒处理时间目标
   - [ ] 优化瓶颈

2. **安全加固**
   - [ ] 配置SSL证书
   - [ ] 设置防火墙规则
   - [ ] 配置访问控制

3. **文档完善**
   - [ ] 记录部署过程
   - [ ] 编写运维手册
   - [ ] 培训运维人员

### 长期行动（可选）

1. **功能增强**
   - [ ] 开发教师审核Web界面（Task 22）
   - [ ] 添加更多科目支持
   - [ ] 实现批量上传

2. **运维优化**
   - [ ] 配置CI/CD自动部署
   - [ ] 实现日志聚合
   - [ ] 配置告警系统

3. **扩展部署**
   - [ ] Kubernetes集群部署
   - [ ] 多区域部署
   - [ ] CDN加速

---

## 📚 相关文档

- [项目README](README.md) - 项目概述
- [部署指南](DEPLOYMENT.md) - 详细部署文档
- [项目状态](PROJECT_STATUS.md) - 当前进度
- [后端架构](backend/CHECKPOINT_4_BACKEND_COMPLETE.md) - 后端文档
- [Android架构](android/ANDROID_ARCHITECTURE.md) - Android文档

---

## 💡 常见问题

### Q1: 如何更改数据库密码？

```bash
# 1. 停止服务
docker-compose -f docker-compose.prod.yml stop

# 2. 修改 .env 文件中的 POSTGRES_PASSWORD

# 3. 删除旧的数据卷（注意：会丢失数据！）
docker-compose -f docker-compose.prod.yml down -v

# 4. 重新启动
docker-compose -f docker-compose.prod.yml up -d
```

### Q2: 如何查看Celery任务执行情况？

```bash
# 查看worker日志
docker-compose -f docker-compose.prod.yml logs -f celery_worker

# 或使用Flower监控（需要额外配置）
```

### Q3: 如何增加上传文件大小限制？

编辑 `nginx/nginx.conf`，修改：
```nginx
client_max_body_size 20M;  # 改为你需要的大小
```

然后重启Nginx：
```bash
docker-compose -f docker-compose.prod.yml restart nginx
```

### Q4: 如何配置域名？

1. 在DNS服务商配置A记录指向服务器IP
2. 修改 `nginx/nginx.conf` 中的 `server_name`
3. 配置SSL证书（参考上面的SSL配置章节）
4. 重启Nginx

---

## 🆘 获取帮助

如果遇到问题：

1. **查看日志**: `docker-compose -f docker-compose.prod.yml logs -f`
2. **检查文档**: 参考本指南和相关文档
3. **搜索问题**: 在GitHub Issues中搜索类似问题
4. **提交Issue**: 在项目仓库提交详细的问题描述

---

## ✅ 部署完成

恭喜！如果你完成了所有步骤，你的AI试卷拍照测评工具已经成功部署到生产环境！

**系统访问地址**:
- API服务: `http://your-domain/`
- API文档: `http://your-domain/docs`
- Prometheus: `http://your-domain:9090`
- Grafana: `http://your-domain:3000`

**下一步**:
1. 开始使用系统进行测试
2. 监控系统运行状态
3. 收集用户反馈
4. 持续优化改进

🎉 **祝你使用愉快！**

---

**文档版本**: 1.0  
**更新日期**: 2026年1月7日  
**维护者**: AI试卷拍照测评工具团队

