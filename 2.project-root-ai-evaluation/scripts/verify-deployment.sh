#!/bin/bash

# 部署验证脚本
# 用法: ./scripts/verify-deployment.sh

set -e

echo "========================================="
echo "生产部署验证"
echo "========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASSED=0
FAILED=0

# 测试函数
test_pass() {
    echo -e "${GREEN}✓${NC} $1"
    PASSED=$((PASSED + 1))
}

test_fail() {
    echo -e "${RED}✗${NC} $1"
    FAILED=$((FAILED + 1))
}

# 1. 检查容器状态
echo "1. 检查容器状态..."
CONTAINERS=("postgres" "redis" "backend" "celery_worker" "nginx")

for container in "${CONTAINERS[@]}"; do
    if docker-compose -f docker-compose.prod.yml ps | grep -q "$container.*Up"; then
        test_pass "$container 容器运行正常"
    else
        test_fail "$container 容器未运行"
    fi
done

# 2. 检查健康端点
echo ""
echo "2. 检查API健康状态..."
if curl -f -s http://localhost/health > /dev/null; then
    HEALTH_STATUS=$(curl -s http://localhost/health | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
    if [ "$HEALTH_STATUS" = "healthy" ]; then
        test_pass "健康检查通过"
    else
        test_fail "健康检查失败: $HEALTH_STATUS"
    fi
else
    test_fail "无法访问健康端点"
fi

# 3. 检查API文档
echo ""
echo "3. 检查API文档..."
if curl -f -s http://localhost/docs > /dev/null; then
    test_pass "API文档可访问"
else
    test_fail "API文档不可访问"
fi

# 4. 检查数据库连接
echo ""
echo "4. 检查数据库连接..."
if docker-compose -f docker-compose.prod.yml exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
    test_pass "数据库连接正常"
else
    test_fail "数据库连接失败"
fi

# 5. 检查Redis连接
echo ""
echo "5. 检查Redis连接..."
REDIS_PASSWORD=$(grep "^REDIS_PASSWORD=" .env | cut -d'=' -f2)
if docker-compose -f docker-compose.prod.yml exec -T redis redis-cli -a "$REDIS_PASSWORD" ping 2>/dev/null | grep -q "PONG"; then
    test_pass "Redis连接正常"
else
    test_fail "Redis连接失败"
fi

# 6. 检查Celery worker
echo ""
echo "6. 检查Celery worker..."
if docker-compose -f docker-compose.prod.yml logs celery_worker | grep -q "celery@.*ready"; then
    test_pass "Celery worker运行正常"
else
    test_fail "Celery worker未就绪"
fi

# 7. 检查监控服务
echo ""
echo "7. 检查监控服务..."
if curl -f -s http://localhost:9090/-/healthy > /dev/null; then
    test_pass "Prometheus运行正常"
else
    test_fail "Prometheus不可访问"
fi

if curl -f -s http://localhost:3000/api/health > /dev/null; then
    test_pass "Grafana运行正常"
else
    test_fail "Grafana不可访问"
fi

# 8. 测试API端点
echo ""
echo "8. 测试API端点..."

# 测试发送验证码（应该失败，但端点应该存在）
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost/api/v1/auth/send-code \
    -H "Content-Type: application/json" \
    -d '{"phone": "13800138000"}')

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "400" ] || [ "$HTTP_CODE" = "422" ]; then
    test_pass "认证API端点可访问 (HTTP $HTTP_CODE)"
else
    test_fail "认证API端点异常 (HTTP $HTTP_CODE)"
fi

# 9. 检查日志错误
echo ""
echo "9. 检查日志错误..."
ERROR_COUNT=$(docker-compose -f docker-compose.prod.yml logs backend | grep -i "error" | grep -v "ERROR_LOG" | wc -l)
if [ "$ERROR_COUNT" -lt 5 ]; then
    test_pass "后端日志正常 ($ERROR_COUNT 个错误)"
else
    test_fail "后端日志有较多错误 ($ERROR_COUNT 个)"
fi

# 10. 检查磁盘空间
echo ""
echo "10. 检查系统资源..."
DISK_USAGE=$(df -h . | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 90 ]; then
    test_pass "磁盘空间充足 (使用率: ${DISK_USAGE}%)"
else
    test_fail "磁盘空间不足 (使用率: ${DISK_USAGE}%)"
fi

# 总结
echo ""
echo "========================================="
echo "验证完成"
echo "========================================="
echo ""
echo "通过: $PASSED"
echo "失败: $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ 所有验证通过！系统运行正常。${NC}"
    echo ""
    echo "下一步："
    echo "  1. 访问 API 文档: http://localhost/docs"
    echo "  2. 访问 Grafana: http://localhost:3000"
    echo "  3. 开始使用系统"
    exit 0
else
    echo -e "${RED}✗ 发现 $FAILED 个问题${NC}"
    echo ""
    echo "建议："
    echo "  1. 查看日志: docker-compose -f docker-compose.prod.yml logs"
    echo "  2. 检查配置: cat .env"
    echo "  3. 重启服务: docker-compose -f docker-compose.prod.yml restart"
    exit 1
fi
