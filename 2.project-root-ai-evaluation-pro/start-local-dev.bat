@echo off
echo ========================================
echo 安辅导 本地开发环境启动脚本
echo ========================================
echo.

echo 当前目录: %CD%
echo.

echo [1/2] 启动本地 API 服务器 (端口 3001)...
start "Local API Server" cmd /k "node local-api-server.js"
timeout /t 2 /nobreak >nul

echo [2/2] 启动 Expo 开发服务器 (端口 8081)...
start "Expo Dev Server" cmd /k "npx expo start --web"

echo.
echo ========================================
echo 两个服务器已启动！
echo ========================================
echo.
echo 本地 API 服务器: http://localhost:3001
echo Expo 开发服务器: http://localhost:8081
echo.
echo 请在浏览器中访问 Expo 提供的 URL
echo 按任意键关闭此窗口...
pause >nul
