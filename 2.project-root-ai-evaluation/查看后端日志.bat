@echo off
chcp 65001 >nul
echo ========================================
echo 后端日志查看工具
echo ========================================
echo.
echo 正在获取最近50条日志...
echo.
docker logs exam_assessment_backend_mock --tail 50
echo.
echo ========================================
echo 日志显示完毕
echo ========================================
echo.
echo 提示：
echo - 查找 📝 注册请求
echo - 查找 🔍 验证码检查
echo - 查找 ✅ 成功 或 ❌ 失败
echo.
pause
