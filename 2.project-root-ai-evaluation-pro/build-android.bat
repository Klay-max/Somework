@echo off
echo ========================================
echo 安辅导 Android 构建脚本
echo ========================================
echo.

REM 检查 EAS CLI 是否安装
where eas >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [错误] EAS CLI 未安装
    echo.
    echo 请运行: npm install -g eas-cli
    echo.
    pause
    exit /b 1
)

echo [1/4] 检查 EAS CLI 版本...
call eas --version
echo.

echo [2/4] 检查登录状态...
call eas whoami
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo 请先登录 Expo 账号:
    echo   eas login
    echo.
    pause
    exit /b 1
)
echo.

echo [3/4] 选择构建方式:
echo   1. 云端构建 - 预览版 (推荐，无需本地 SDK)
echo   2. 云端构建 - 生产版
echo   3. 本地构建 - 开发版 (需要 Android SDK)
echo   4. 本地构建 - 预览版 (需要 Android SDK)
echo.
set /p choice="请选择 (1-4): "

if "%choice%"=="1" (
    echo.
    echo [4/4] 开始云端构建预览版...
    echo 这将需要 10-20 分钟，请耐心等待
    echo.
    call eas build --profile preview --platform android
) else if "%choice%"=="2" (
    echo.
    echo [4/4] 开始云端构建生产版...
    echo 这将需要 10-20 分钟，请耐心等待
    echo.
    call eas build --profile production --platform android
) else if "%choice%"=="3" (
    echo.
    echo [4/4] 开始本地构建开发版...
    echo 注意：需要安装 Android SDK
    echo.
    call eas build --profile development --platform android --local
) else if "%choice%"=="4" (
    echo.
    echo [4/4] 开始本地构建预览版...
    echo 注意：需要安装 Android SDK
    echo.
    call eas build --profile preview --platform android --local
) else (
    echo.
    echo [错误] 无效的选择
    pause
    exit /b 1
)

echo.
echo ========================================
echo 构建完成！
echo ========================================
echo.
echo 下一步:
echo   1. 如果是云端构建，扫描二维码下载 APK
echo   2. 如果是本地构建，APK 在当前目录
echo   3. 将 APK 安装到手机
echo   4. 测试应用功能
echo.
pause
