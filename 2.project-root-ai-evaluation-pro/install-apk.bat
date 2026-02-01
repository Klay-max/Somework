@echo off
chcp 65001 >nul
echo ========================================
echo    APK 安装工具
echo ========================================
echo.

REM 检查 ADB 是否可用
where adb >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [错误] 未找到 ADB 工具
    echo.
    echo 请先安装 ADB：
    echo 1. 下载 Platform Tools: https://developer.android.com/studio/releases/platform-tools
    echo 2. 解压并添加到系统 PATH
    echo.
    echo 或者使用"方法 1"手动传输 APK 到手机安装
    echo 详见：APK测试指南.md
    echo.
    pause
    exit /b 1
)

echo [✓] 找到 ADB 工具
echo.

REM 检查 APK 文件是否存在
set APK_PATH=android\app\build\outputs\apk\release\app-release.apk
if not exist "%APK_PATH%" (
    echo [错误] 未找到 APK 文件
    echo 路径: %APK_PATH%
    echo.
    echo 请先构建 APK：
    echo   cd android
    echo   .\gradlew assembleRelease --no-daemon
    echo.
    pause
    exit /b 1
)

echo [✓] 找到 APK 文件
echo.

REM 检查设备连接
echo 正在检查已连接的设备...
adb devices
echo.

REM 询问用户是否继续
set /p CONFIRM="是否继续安装？(Y/N): "
if /i not "%CONFIRM%"=="Y" (
    echo 已取消安装
    pause
    exit /b 0
)

echo.
echo 正在安装 APK...
echo.

REM 尝试覆盖安装（如果已安装旧版本）
adb install -r "%APK_PATH%"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo    安装成功！🎉
    echo ========================================
    echo.
    echo 现在可以在手机上打开应用进行测试
    echo.
) else (
    echo.
    echo ========================================
    echo    安装失败
    echo ========================================
    echo.
    echo 可能的原因：
    echo 1. 设备未连接或未授权 USB 调试
    echo 2. 签名冲突（尝试先卸载旧版本）
    echo 3. 存储空间不足
    echo.
    echo 请查看上方错误信息，或参考 APK测试指南.md
    echo.
)

pause
