@echo off
REM 生产环境快速启动脚本 (Windows)

echo ========================================
echo AI 试卷拍照测评工具 - 生产环境启动
echo ========================================
echo.

REM 1. 运行部署前检查
echo 步骤 1/5: 运行部署前检查...
call scripts\pre-deployment-check.bat
if errorlevel 1 (
    echo.
    echo 部署前检查失败！请修复错误后重试。
    pause
    exit /b 1
)

echo.
echo 步骤 2/5: 构建Docker镜像...
docker-compose -f docker-compose.prod.yml build
if errorlevel 1 (
    echo 构建失败！
    pause
    exit /b 1
)

echo.
echo 步骤 3/5: 启动服务...
docker-compose -f docker-compose.prod.yml up -d
if errorlevel 1 (
    echo 启动失败！
    pause
    exit /b 1
)

echo.
echo 步骤 4/5: 等待服务就绪...
timeout /t 10 /nobreak >nul

echo.
echo 步骤 5/5: 运行数据库迁移...
docker-compose -f docker-compose.prod.yml exec -T backend alembic upgrade head
if errorlevel 1 (
    echo 数据库迁移失败！
    echo 查看日志: docker-compose -f docker-compose.prod.yml logs backend
)

echo.
echo ========================================
echo 部署完成！
echo ========================================
echo.
echo 服务地址:
echo   - API: http://localhost
echo   - API文档: http://localhost/docs
echo   - Prometheus: http://localhost:9090
echo   - Grafana: http://localhost:3000
echo.
echo 查看服务状态:
echo   docker-compose -f docker-compose.prod.yml ps
echo.
echo 查看日志:
echo   docker-compose -f docker-compose.prod.yml logs -f
echo.
echo 停止服务:
echo   docker-compose -f docker-compose.prod.yml down
echo.
pause
