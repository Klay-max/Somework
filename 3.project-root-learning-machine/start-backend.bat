@echo off
echo ========================================
echo 启动学习应用后端服务
echo ========================================
echo.

REM 检查Java
echo [1/3] 检查Java环境...
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ 错误: 未找到Java
    echo.
    echo 请先安装Java 17+:
    echo https://adoptium.net/
    echo.
    pause
    exit /b 1
)
echo ✓ Java已安装
echo.

REM 检查PostgreSQL
echo [2/3] 检查PostgreSQL...
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠ 警告: 未找到PostgreSQL命令行工具
    echo 请确保PostgreSQL已安装并正在运行
    echo.
)
echo.

REM 检查端口
echo [3/3] 检查端口8080...
netstat -ano | findstr :8080 >nul
if %errorlevel% equ 0 (
    echo ⚠ 警告: 端口8080已被占用
    echo 请关闭占用该端口的程序
    echo.
    pause
)
echo.

echo ========================================
echo 启动后端
echo ========================================
echo.
echo 后端将在 http://localhost:8080 运行
echo.
echo 测试账号：
echo   学生 - 用户名: student, 密码: password123
echo   管理员 - 用户名: admin, 密码: password123
echo.
echo 提示: 如果启动失败，请使用IntelliJ IDEA打开backend目录
echo       然后运行 LearningAppApplication.kt
echo.

cd backend

REM 尝试使用gradlew
if exist gradlew.bat (
    echo 使用Gradle Wrapper启动...
    call gradlew.bat bootRun
) else if exist ..\gradlew.bat (
    echo 使用项目根目录的Gradle Wrapper启动...
    call ..\gradlew.bat :backend:bootRun
) else (
    echo ✗ 错误: 未找到Gradle Wrapper
    echo.
    echo 请使用以下方式之一启动:
    echo 1. 使用IntelliJ IDEA打开backend目录并运行 (推荐)
    echo 2. 安装Gradle后运行: gradle bootRun
    echo.
    pause
    exit /b 1
)
