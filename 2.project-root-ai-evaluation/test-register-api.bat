@echo off
echo ========================================
echo 测试注册API
echo ========================================
echo.

echo 步骤1: 发送验证码
curl -X POST http://localhost:8000/api/v1/auth/send-code ^
  -H "Content-Type: application/json" ^
  -d "{\"phone\":\"13800138000\"}"
echo.
echo.

echo 步骤2: 注册用户
curl -X POST http://localhost:8000/api/v1/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"phone\":\"13800138000\",\"verification_code\":\"123456\",\"password\":\"password123\"}"
echo.
echo.

pause
