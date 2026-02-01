@echo off
chcp 65001 >nul
echo ========================================
echo 打开 APK 文件夹
echo ========================================
echo.

set APK_PATH=android\app\build\outputs\apk\release

if exist "%APK_PATH%\app-release.apk" (
    echo ✓ 找到 APK 文件
    echo.
    echo 文件位置: %APK_PATH%\app-release.apk
    echo.
    
    REM 获取文件大小
    for %%A in ("%APK_PATH%\app-release.apk") do (
        set SIZE=%%~zA
    )
    echo 文件大小: %SIZE% 字节
    echo.
    
    echo 正在打开文件夹...
    explorer "%APK_PATH%"
    echo.
    echo ========================================
    echo 下一步：
    echo ========================================
    echo.
    echo 1. 连接手机到电脑（USB 数据线）
    echo 2. 在手机上选择"文件传输"模式
    echo 3. 将 app-release.apk 复制到手机
    echo 4. 在手机上点击 APK 文件安装
    echo.
    echo 详细步骤请查看：安装APK到手机指南.md
    echo.
) else (
    echo ✗ 未找到 APK 文件
    echo.
    echo APK 应该在: %APK_PATH%\app-release.apk
    echo.
    echo 可能的原因：
    echo 1. APK 还没有构建
    echo 2. 构建失败
    echo 3. 文件被删除
    echo.
    echo 解决方案：
    echo 1. 运行 build-android-local.bat 重新构建
    echo 2. 或使用 EAS Build 云端构建
    echo.
)

pause
