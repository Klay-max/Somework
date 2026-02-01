@echo off
echo ========================================
echo Android 本地构建脚本
echo ========================================

echo.
echo [1/4] 检查 Java 版本...
java -version
if %ERRORLEVEL% NEQ 0 (
    echo 错误: Java 未安装或未添加到 PATH
    pause
    exit /b 1
)

echo.
echo [2/4] 设置环境变量...
set ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk
echo ANDROID_HOME=%ANDROID_HOME%

echo.
echo [3/4] 清理并重新生成 Android 项目...
call npx expo prebuild --platform android --clean
if %ERRORLEVEL% NEQ 0 (
    echo 错误: Prebuild 失败
    pause
    exit /b 1
)

echo.
echo [4/4] 构建 APK...
cd android
call gradlew assembleRelease
if %ERRORLEVEL% NEQ 0 (
    echo 错误: 构建失败
    cd ..
    pause
    exit /b 1
)

cd ..
echo.
echo ========================================
echo 构建成功！
echo APK 位置: android\app\build\outputs\apk\release\app-release.apk
echo ========================================
pause
