@echo off
chcp 65001 >nul
echo 修复 Gradle 编码问题...
echo.

REM 设置环境变量
set JAVA_TOOL_OPTIONS=-Dfile.encoding=UTF-8

REM 清理并重新构建
cd android
echo 清理构建缓存...
call .\gradlew clean --no-daemon

echo.
echo 开始构建 APK...
call .\gradlew assembleRelease --no-daemon

echo.
echo 构建完成！
pause
