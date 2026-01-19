@echo off
echo ========================================
echo 测试 Mock API 服务
echo ========================================
echo.

echo 1. 测试健康检查端点...
curl http://localhost:8000/health
echo.
echo.

echo 2. 打开 API 文档页面...
echo 请在浏览器中访问: http://localhost:8000/docs
start http://localhost:8000/docs
echo.

echo ========================================
echo 测试完成！
echo ========================================
echo.
echo 提示：
echo - API 文档: http://localhost:8000/docs
echo - 健康检查: http://localhost:8000/health
echo - 所有验证码都是: 123456
echo.
pause
