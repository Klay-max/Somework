#!/bin/bash

echo "🚀 启动学习应用后端服务..."
echo ""

cd backend

echo "📦 检查依赖..."
./gradlew clean build -x test

echo ""
echo "🔥 启动Spring Boot应用..."
echo "后端将在 http://localhost:8080 运行"
echo ""
echo "测试账号："
echo "  学生 - 用户名: student, 密码: password123"
echo "  管理员 - 用户名: admin, 密码: password123"
echo ""

./gradlew bootRun
