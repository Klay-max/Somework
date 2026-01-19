#!/bin/bash

echo "========================================"
echo "Task 4 Checkpoint - 集成测试"
echo "========================================"
echo ""

echo "[1/4] 检查 Docker 服务状态..."
docker compose ps postgres redis
if [ $? -ne 0 ]; then
    echo ""
    echo "错误：Docker 服务未运行"
    echo "请先启动服务：docker compose up -d postgres redis"
    exit 1
fi

echo ""
echo "[2/4] 检查测试数据库..."
docker exec exam_assessment_db psql -U postgres -lqt | grep -q exam_assessment_test
if [ $? -ne 0 ]; then
    echo "创建测试数据库..."
    docker exec exam_assessment_db psql -U postgres -c "CREATE DATABASE exam_assessment_test;"
fi

echo ""
echo "[3/4] 运行集成测试..."
python -m pytest tests/test_integration_checkpoint.py -v

echo ""
echo "[4/4] 测试完成！"
echo ""
echo "如果所有测试通过，Task 4 Checkpoint 完成 ✓"
echo "下一步：继续 Task 5 - 实现 OCR 抽象层"
echo ""
