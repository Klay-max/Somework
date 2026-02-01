@echo off
chcp 65001 >nul
echo ========================================
echo 快速构建 APK
echo ========================================
echo.

echo 检查 Android 项目...
if not exist "android" (
    echo ✗ android 文件夹不存在
    echo.
    echo 正在生成 Android 项目...
    call npx expo prebuild --platform android --clean
    if errorlevel 1 (
        echo ✗ 生成失败
        pause
        exit /b 1
    )
    echo ✓ Android 项目生成完成
    echo.
)

echo 检查 local.properties...
if not exist "android\local.properties" (
    echo 创建 local.properties...
    echo sdk.dir=C:\\Users\\WIN10\\AppData\\Local\\Android\\Sdk > android\local.properties
    echo ✓ 已创建
    echo.
)

echo ========================================
echo 开始构建 APK
echo ========================================
echo.
echo 这可能需要 10-15 分钟，请耐心等待...
echo.
echo 提示：
echo - 构建过程中可能看起来卡住了，这是正常的
echo - 不要关闭窗口
echo - 可以去喝杯咖啡 ☕
echo.

set /p confirm="确认开始构建？(y/n): "
if /i not "%confirm%"=="y" (
    echo 已取消
    pause
    exit /b
)

echo.
echo 正在构建...
echo.

cd android
call .\gradlew assembleRelease --no-daemon

if errorlevel 1 (
    echo.
    echo ========================================
    echo ✗ 构建失败
    echo ========================================
    echo.
    echo 可能的原因：
    echo 1. Java 版本不兼容（需要 Java 17）
    echo 2. NDK 配置问题
    echo 3. 依赖下载失败
    echo.
    echo 解决方案：
    echo 1. 检查 Java 版本：java -version
    echo 2. 查看错误日志
    echo 3. 或使用 EAS Build 云端构建
    echo.
    cd ..
    pause
    exit /b 1
)

cd ..

echo.
echo ========================================
echo ✓ 构建成功！
echo ========================================
echo.

if exist "android\app\build\outputs\apk\release\app-release.apk" (
    echo APK 位置: android\app\build\outputs\apk\release\app-release.apk
    echo.
    
    REM 获取文件大小
    for %%A in ("android\app\build\outputs\apk\release\app-release.apk") do (
        set SIZE=%%~zA
        set /a SIZE_MB=%%~zA/1024/1024
    )
    echo 文件大小: !SIZE_MB! MB
    echo.
    
    echo 正在打开文件夹...
    explorer "android\app\build\outputs\apk\release"
    echo.
    echo ========================================
    echo 下一步：安装到手机
    echo ========================================
    echo.
    echo 1. 连接手机到电脑
    echo 2. 复制 app-release.apk 到手机
    echo 3. 在手机上安装
    echo.
    echo 详细步骤请查看：安装APK到手机指南.md
    echo.
) else (
    echo ✗ 未找到 APK 文件
    echo 构建可能没有完全成功
    echo.
)

pause
