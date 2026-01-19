# 快速开始指南

## Task 4 Checkpoint - 运行集成测试

### 方法 1：使用自动化脚本（推荐）

#### Windows:
```bash
cd backend
run_checkpoint_tests.bat
```

#### Linux/Mac:
```bash
cd backend
chmod +x run_checkpoint_tests.sh
./run_checkpoint_tests.sh
```

### 方法 2：手动步骤

#### 1. 启动 Docker 服务

```bash
# 在项目根目录
docker compose up -d postgres redis

# 验证服务状态
docker compose ps
```

应该看到：
```
NAME                      STATUS
exam_assessment_db        Up (healthy)
exam_assessment_redis     Up (healthy)
```

#### 2. 创建测试数据库

```bash
docker exec exam_assessment_db psql -U postgres -c "CREATE DATABASE exam_assessment_test;"
```

#### 3. 运行集成测试

```bash
cd backend
python -m pytest tests/test_integration_checkpoint.py -v
```

#### 4. 查看测试结果

预期输出：
```
tests/test_integration_checkpoint.py::TestCheckpointIntegration::test_complete_auth_flow PASSED
tests/test_integration_checkpoint.py::TestCheckpointIntegration::test_complete_upload_flow PASSED
tests/test_integration_checkpoint.py::TestCheckpointIntegration::test_auth_required_for_upload PASSED
tests/test_integration_checkpoint.py::TestCheckpointIntegration::test_invalid_image_rejected PASSED
tests/test_integration_checkpoint.py::TestCheckpointIntegration::test_oversized_image_rejected PASSED
tests/test_integration_checkpoint.py::TestHealthCheck::test_health_endpoint PASSED
tests/test_integration_checkpoint.py::TestAPIDocumentation::test_openapi_docs_available PASSED
tests/test_integration_checkpoint.py::TestAPIDocumentation::test_openapi_json_available PASSED

======================== 8 passed in X.XXs ========================
```

### 方法 3：运行所有测试

```bash
cd backend

# 运行所有测试
python -m pytest tests/ -v

# 生成覆盖率报告
python -m pytest tests/ --cov=app --cov-report=html --cov-report=term

# 查看覆盖率报告
# 打开 htmlcov/index.html
```

## 故障排查

### 问题 1：Docker 未安装

**错误信息**：`docker: command not found` 或 `无法将"docker"项识别为 cmdlet`

**解决方案**：
1. 下载并安装 Docker Desktop
   - Windows: https://docs.docker.com/desktop/install/windows-install/
   - Mac: https://docs.docker.com/desktop/install/mac-install/
   - Linux: https://docs.docker.com/engine/install/

2. 安装后重启系统
3. 验证安装：`docker --version`

### 问题 2：端口已被占用

**错误信息**：`port is already allocated`

**解决方案**：
```bash
# Windows - 查找占用端口的进程
netstat -ano | findstr :5432
netstat -ano | findstr :6379

# 停止占用端口的进程或更改 docker-compose.yml 中的端口映射
```

### 问题 3：数据库连接失败

**错误信息**：`could not connect to server`

**解决方案**：
```bash
# 检查 PostgreSQL 容器状态
docker compose logs postgres

# 重启服务
docker compose restart postgres

# 等待服务健康检查通过
docker compose ps
```

### 问题 4：Redis 连接失败

**错误信息**：`Error connecting to Redis`

**解决方案**：
```bash
# 检查 Redis 容器状态
docker compose logs redis

# 测试 Redis 连接
docker exec exam_assessment_redis redis-cli ping
# 应该返回：PONG

# 重启服务
docker compose restart redis
```

### 问题 5：测试数据库不存在

**错误信息**：`database "exam_assessment_test" does not exist`

**解决方案**：
```bash
# 手动创建测试数据库
docker exec exam_assessment_db psql -U postgres -c "CREATE DATABASE exam_assessment_test;"

# 验证数据库已创建
docker exec exam_assessment_db psql -U postgres -c "\l"
```

## 测试覆盖范围

### 认证功能测试
- ✅ 发送短信验证码
- ✅ 用户注册（手机号 + 验证码 + 密码）
- ✅ 用户登录（手机号 + 密码）
- ✅ 获取当前用户信息（JWT 认证）
- ✅ Token 过期处理

### 图像上传测试
- ✅ 图像上传（需要 JWT 认证）
- ✅ 图像格式验证（JPG, PNG, HEIC）
- ✅ 图像大小验证（≤ 10MB）
- ✅ 图像质量检测（分辨率、模糊度、亮度）
- ✅ 试卷状态查询
- ✅ 试卷详情获取
- ✅ 历史记录查看

### API 端点测试
- ✅ 健康检查端点（/health）
- ✅ API 文档可访问性（/docs）
- ✅ OpenAPI JSON 可访问性（/openapi.json）

### 属性测试（Property-Based Testing）
- ✅ Property 1: Phone Number Validation Consistency
- ✅ Property 2: JWT Token Expiration Accuracy
- ✅ Property 3: Image Format and Size Validation
- ✅ Property 5: Image Quality Validation
- ✅ Property 6: Image Quality Rejection Feedback

## 下一步

一旦所有测试通过：

1. ✅ 标记 Task 4 为完成
2. 🚀 开始 Task 5：实现 OCR 抽象层
   - 设计 OCR 接口和数据模型
   - 实现百度 OCR 提供商
   - 实现腾讯 OCR 提供商
   - 实现 OCR 提供商选择逻辑

## 有用的命令

```bash
# 查看所有容器状态
docker compose ps

# 查看容器日志
docker compose logs -f postgres
docker compose logs -f redis

# 停止所有服务
docker compose down

# 停止并删除数据卷（清理所有数据）
docker compose down -v

# 重启特定服务
docker compose restart postgres
docker compose restart redis

# 进入 PostgreSQL 容器
docker exec -it exam_assessment_db psql -U postgres

# 进入 Redis 容器
docker exec -it exam_assessment_redis redis-cli

# 查看测试覆盖率
python -m pytest tests/ --cov=app --cov-report=term-missing
```

## 联系支持

如果遇到问题：
1. 查看 `backend/CHECKPOINT_STATUS.md` 了解详细状态
2. 检查 Docker 容器日志
3. 验证所有依赖已正确安装
4. 确保端口 5432 和 6379 未被占用
