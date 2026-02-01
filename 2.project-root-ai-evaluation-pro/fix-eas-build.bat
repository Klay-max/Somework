@echo off
chcp 65001 >nul
echo ========================================
echo 修复 EAS Build 配置
echo ========================================
echo.

echo 这个脚本会：
echo 1. 清理本地依赖
echo 2. 重新安装依赖
echo 3. 重新生成 Android 项目
echo 4. 准备重新构建
echo.

set /p confirm="确认执行？这会删除 node_modules 和 android 文件夹 (y/n): "
if /i not "%confirm%"=="y" (
    echo 已取消
    pause
    exit /b
)

echo.
echo ========================================
echo 步骤 1/4: 清理 node_modules
echo ========================================
if exist node_modules (
    echo 删除 node_modules...
    rmdir /s /q node_modules
    echo ✓ 已删除
) else (
    echo node_modules 不存在，跳过
)

echo.
echo ========================================
echo 步骤 2/4: 清理 package-lock.json
echo ========================================
if exist package-lock.json (
    echo 删除 package-lock.json...
    del package-lock.json
    echo ✓ 已删除
) else (
    echo package-lock.json 不存在，跳过
)

echo.
echo ========================================
echo 步骤 3/4: 重新安装依赖
echo ========================================
echo 运行 npm install...
call npm install
if errorlevel 1 (
    echo ✗ 安装失败
    pause
    exit /b 1
)
echo ✓ 依赖安装完成

echo.
echo ========================================
echo 步骤 4/4: 重新生成 Android 项目
echo ========================================
if exist android (
    echo 删除旧的 android 文件夹...
    rmdir /s /q android
    echo ✓ 已删除
)

echo 运行 expo prebuild...
call npx expo prebuild --platform android --clean
if errorlevel 1 (
    echo ✗ prebuild 失败
    pause
    exit /b 1
)
echo ✓ Android 项目生成完成

echo.
echo ========================================
echo 配置 Android SDK 路径
echo ========================================
echo 创建 android\local.properties...
echo sdk.dir=C:\\Users\\WIN10\\AppData\\Local\\Android\\Sdk > android\local.properties
echo ✓ 已创建

echo.
echo ========================================
echo ✓ 修复完成！
echo ========================================
echo.
echo 下一步：
echo.
echo 选项 1: 使用 EAS Build (推荐)
echo    eas build --platform android --profile preview2 --clear-cache
echo.
echo 选项 2: 本地构建
echo    cd android
echo    .\gradlew assembleRelease --no-daemon
echo.
echo 选项 3: 使用现有的 APK
echo    adb install android\app\build\outputs\apk\release\app-release.apk
echo.

pause
