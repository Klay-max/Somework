@echo off
REM Mock 版本快速启动脚本 (Windows)

echo 🎭 启动 AI 试卷拍照测评工具 - Mock 版本
echo ==========================================
echo.

REM 检查 Docker 是否安装
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误：未检测到 Docker
    echo 请先安装 Docker Desktop: https://www.docker.com/products/docker-desktop
    exit /b 1
)

REM 检查 Docker 是否运行
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误：Docker 未运行
    echo 请启动 Docker Desktop
    exit /b 1
)

echo ✅ Docker 已就绪
echo.

REM 检查 .env.mock 文件
if not exist .env.mock (
    echo ❌ 错误：未找到 .env.mock 文件
    echo 请确保在项目根目录运行此脚本
    exit /b 1
)

echo 📦 启动服务...
echo.

REM 启动 Docker Compose
docker-compose --env-file .env.mock -f docker-compose.mock.yml up -d

REM 等待服务启动
echo.
echo ⏳ 等待服务启动...
timeout /t 5 /nobreak >nul

REM 检查服务状态
echo.
echo 📊 服务状态：
docker-compose -f docker-compose.mock.yml ps

echo.
echo ✅ Mock 版本启动成功！
echo.
echo 📝 接下来的步骤：
echo 1. 运行数据库迁移：
echo    docker-compose -f docker-compose.mock.yml exec backend alembic upgrade head
echo.
echo 2. 访问 API 文档：
echo    http://localhost:8000/docs
echo.
echo 3. 测试注册（验证码固定为 123456）
echo.
echo 4. 查看日志：
echo    docker-compose -f docker-compose.mock.yml logs -f
echo.
echo 5. 停止服务：
echo    docker-compose -f docker-compose.mock.yml down
echo.
echo 💡 提示：所有验证码都是 123456
echo 🎉 开始测试吧！
echo.
pause
