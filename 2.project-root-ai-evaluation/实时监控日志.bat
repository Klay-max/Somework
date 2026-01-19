@echo off
chcp 65001 >nul
echo ========================================
echo 实时监控后端日志
echo ========================================
echo.
echo 现在开始实时显示日志...
echo 在 Android 应用中操作，这里会实时显示日志
echo.
echo 按 Ctrl+C 停止监控
echo.
echo ========================================
echo.
docker logs -f exam_assessment_backend_mock
