@echo off
echo ========================================
echo 环境检查脚本
echo ========================================
echo.

echo [1/4] 检查Java...
java -version 2>nul
if %errorlevel% equ 0 (
    echo ✓ Java已安装
) else (
    echo ✗ Java未安装或未配置环境变量
    echo   请从以下地址下载安装Java 17+:
    echo   https://adoptium.net/
)
echo.

echo [2/4] 检查PostgreSQL...
psql --version 2>nul
if %errorlevel% equ 0 (
    echo ✓ PostgreSQL已安装
) else (
    echo ✗ PostgreSQL未安装或未配置环境变量
    echo   请从以下地址下载安装:
    echo   https://www.postgresql.org/download/windows/
)
echo.

echo [3/4] 检查数据库连接...
psql -U postgres -d learningapp -c "SELECT 1;" 2>nul
if %errorlevel% equ 0 (
    echo ✓ 数据库learningapp存在且可连接
) else (
    echo ✗ 无法连接到数据库learningapp
    echo   请确保:
    echo   1. PostgreSQL服务正在运行
    echo   2. 数据库learningapp已创建
    echo   3. 密码正确
)
echo.

echo [4/4] 检查端口8080...
netstat -ano | findstr :8080 >nul
if %errorlevel% equ 0 (
    echo ✗ 端口8080已被占用
    echo   请关闭占用该端口的程序，或修改backend配置使用其他端口
) else (
    echo ✓ 端口8080可用
)
echo.

echo ========================================
echo 检查完成
echo ========================================
echo.
echo 下一步:
echo 1. 如果所有检查都通过，可以启动后端
echo 2. 如果有✗标记，请按照提示解决问题
echo 3. 使用IntelliJ IDEA打开backend目录并运行
echo.
pause
