@echo off
chcp 65001 >nul
echo ========================================
echo    AI试卷测评系统 - 诊断工具
echo ========================================
echo.

echo [1/5] 检查Docker状态...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker未安装或未运行
    echo    请启动Docker Desktop
    goto :end
) else (
    echo ✅ Docker已安装
)
echo.

echo [2/5] 检查Docker容器状态...
docker ps --format "table {{.Names}}\t{{.Status}}" | findstr "exam_assessment"
if %errorlevel% neq 0 (
    echo ⚠️  后端服务未运行
    echo    运行 start-mock.bat 启动服务
) else (
    echo ✅ 后端服务正在运行
)
echo.

echo [3/5] 测试后端API连接...
curl -s http://localhost:8000/health >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 无法连接到后端API
    echo    请确保后端服务正在运行
) else (
    echo ✅ 后端API连接正常
    curl -s http://localhost:8000/health
)
echo.

echo [4/5] 检查端口占用...
netstat -ano | findstr ":8000" >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  端口8000未被占用
) else (
    echo ✅ 端口8000正在使用
)
echo.

echo [5/5] 检查ADB连接...
adb devices 2>nul | findstr "device" | findstr -v "List" >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  没有检测到Android设备/模拟器
    echo    请在Android Studio中启动模拟器
) else (
    echo ✅ Android设备已连接
    adb devices
)
echo.

echo ========================================
echo 诊断完成！
echo ========================================
echo.
echo 💡 下一步建议：
echo.
echo 如果后端服务未运行：
echo    运行: start-mock.bat
echo.
echo 如果需要查看后端日志：
echo    运行: docker-compose -f docker-compose.mock.yml logs -f backend
echo.
echo 如果Android应用崩溃：
echo    1. 在Android Studio中打开Logcat
echo    2. 搜索 "AndroidRuntime" 或 "FATAL"
echo    3. 复制错误信息
echo.

:end
pause
