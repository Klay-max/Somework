#!/bin/bash

# 生产环境快速启动脚本 (Linux/Mac)

set -e

echo "========================================"
echo "AI 试卷拍照测评工具 - 生产环境启动"
echo "========================================"
echo ""

# 1. 运行部署前检查
echo "步骤 1/5: 运行部署前检查..."
if ! ./scripts/pre-deployment-check.sh; then
    echo ""
    echo "部署前检查失败！请修复错误后重试。"
    exit 1
fi

# 2. 构建镜像
echo ""
echo "步骤 2/5: 构建Docker镜像..."
docker-compose -f docker-compose.prod.yml build

# 3. 启动服务
echo ""
echo "步骤 3/5: 启动服务..."
docker-compose -f docker-compose.prod.yml up -d

# 4. 等待服务就绪
echo ""
echo "步骤 4/5: 等待服务就绪..."
sleep 10

# 5. 运行数据库迁移
echo ""
echo "步骤 5/5: 运行数据库迁移..."
docker-compose -f docker-compose.prod.yml exec -T backend alembic upgrade head || {
    echo "数据库迁移失败！"
    echo "查看日志: docker-compose -f docker-compose.prod.yml logs backend"
}

# 6. 健康检查
echo ""
echo "执行健康检查..."
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if curl -f http://localhost/health > /dev/null 2>&1; then
        echo "✓ 后端服务健康"
        break
    fi
    attempt=$((attempt + 1))
    echo "等待后端服务启动... ($attempt/$max_attempts)"
    sleep 2
done

if [ $attempt -eq $max_attempts ]; then
    echo "⚠ 后端服务启动超时"
    echo "查看日志: docker-compose -f docker-compose.prod.yml logs backend"
fi

# 显示服务信息
echo ""
echo "========================================"
echo "部署完成！"
echo "========================================"
echo ""
echo "服务地址:"
echo "  - API: http://localhost"
echo "  - API文档: http://localhost/docs"
echo "  - Prometheus: http://localhost:9090"
echo "  - Grafana: http://localhost:3000"
echo ""
echo "查看服务状态:"
echo "  docker-compose -f docker-compose.prod.yml ps"
echo ""
echo "查看日志:"
echo "  docker-compose -f docker-compose.prod.yml logs -f"
echo ""
echo "停止服务:"
echo "  docker-compose -f docker-compose.prod.yml down"
echo ""
