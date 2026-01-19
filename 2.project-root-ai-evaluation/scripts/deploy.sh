#!/bin/bash

# AI 试卷拍照测评工具 - 部署脚本
# 用法: ./scripts/deploy.sh [environment]
# 环境: dev, staging, production

set -e

ENVIRONMENT=${1:-production}
COMPOSE_FILE="docker-compose.prod.yml"

echo "========================================="
echo "AI 试卷拍照测评工具 - 部署脚本"
echo "环境: $ENVIRONMENT"
echo "========================================="

# 检�?.env 文件
if [ ! -f .env ]; then
    echo "错误: .env 文件不存�?
    echo "请复�?.env.example 并配置环境变�?
    exit 1
fi

# 检查必需的环境变�?required_vars=("POSTGRES_PASSWORD" "REDIS_PASSWORD" "SECRET_KEY" "DEEPSEEK_API_KEY")
for var in "${required_vars[@]}"; do
    if ! grep -q "^${var}=" .env || grep -q "^${var}=CHANGE_ME" .env || grep -q "^${var}=your_" .env; then
        echo "错误: 环境变量 $var 未正确配�?
        echo "请编�?.env 文件并设置正确的�?
        exit 1
    fi
done

echo "�?环境变量检查通过"

# 拉取最新代�?echo ""
echo "拉取最新代�?.."
git pull origin main

# 构建镜像
echo ""
echo "构建 Docker 镜像..."
docker-compose -f $COMPOSE_FILE build --no-cache

# 停止旧容�?echo ""
echo "停止旧容�?.."
docker-compose -f $COMPOSE_FILE down

# 启动新容�?echo ""
echo "启动新容�?.."
docker-compose -f $COMPOSE_FILE up -d

# 等待服务就绪
echo ""
echo "等待服务就绪..."
sleep 10

# 检查服务状�?echo ""
echo "检查服务状�?.."
docker-compose -f $COMPOSE_FILE ps

# 运行数据库迁�?echo ""
echo "运行数据库迁�?.."
docker-compose -f $COMPOSE_FILE exec -T backend alembic upgrade head

# 健康检�?echo ""
echo "执行健康检�?.."
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if curl -f http://localhost/health > /dev/null 2>&1; then
        echo "�?后端服务健康"
        break
    fi
    attempt=$((attempt + 1))
    echo "等待后端服务启动... ($attempt/$max_attempts)"
    sleep 2
done

if [ $attempt -eq $max_attempts ]; then
    echo "�?后端服务启动失败"
    echo "查看日志:"
    docker-compose -f $COMPOSE_FILE logs backend
    exit 1
fi

# 显示服务信息
echo ""
echo "========================================="
echo "部署完成�?
echo "========================================="
echo ""
echo "服务地址:"
echo "  - API: http://localhost"
echo "  - API 文档: http://localhost/docs"
echo "  - Prometheus: http://localhost:9090"
echo "  - Grafana: http://localhost:3000"
echo ""
echo "查看日志:"
echo "  docker-compose -f $COMPOSE_FILE logs -f"
echo ""
echo "停止服务:"
echo "  docker-compose -f $COMPOSE_FILE down"
echo ""
echo "========================================="
