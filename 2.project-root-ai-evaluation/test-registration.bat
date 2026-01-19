@echo off
chcp 65001 >nul
echo ========================================
echo Android 注册功能测试脚本
echo ========================================
echo.

echo [1/3] 测试后端健康检查...
curl -s http://localhost:8000/health
echo.
echo.

echo [2/3] 发送验证码...
powershell -Command "Invoke-RestMethod -Uri 'http://localhost:8000/api/v1/auth/send-code' -Method Post -ContentType 'application/json' -Body '{\"phone\":\"13800138000\"}'"
echo.
echo.

echo [3/3] 测试注册（使用验证码 123456）...
powershell -Command "Invoke-RestMethod -Uri 'http://localhost:8000/api/v1/auth/register' -Method Post -ContentType 'application/json' -Body '{\"phone\":\"13800138000\",\"verification_code\":\"123456\",\"password\":\"password123\"}'"
echo.
echo.

echo ========================================
echo 测试完成！
echo ========================================
echo.
echo 如果看到 user_id 和 token，说明注册功能正常！
echo 现在可以在 Android 模拟器中测试了。
echo.
pause
