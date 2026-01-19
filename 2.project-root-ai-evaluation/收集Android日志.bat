@echo off
chcp 65001 >nul
echo ========================================
echo    收集Android崩溃日志
echo ========================================
echo.

echo 正在检查ADB连接...
adb devices 2>nul | findstr "device" | findstr -v "List" >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 没有检测到Android设备/模拟器
    echo    请在Android Studio中启动模拟器
    pause
    exit /b 1
)

echo ✅ 设备已连接
echo.

echo 正在收集日志...
echo.

set LOGFILE=android-crash-log-%date:~0,4%%date:~5,2%%date:~8,2%-%time:~0,2%%time:~3,2%%time:~6,2%.txt
set LOGFILE=%LOGFILE: =0%

echo [1/3] 收集完整日志...
adb logcat -d > "%LOGFILE%"

echo [2/3] 筛选错误信息...
echo. >> "%LOGFILE%"
echo ======================================== >> "%LOGFILE%"
echo 错误和异常信息 >> "%LOGFILE%"
echo ======================================== >> "%LOGFILE%"
adb logcat -d *:E >> "%LOGFILE%"

echo [3/3] 筛选应用日志...
echo. >> "%LOGFILE%"
echo ======================================== >> "%LOGFILE%"
echo ExamAI应用日志 >> "%LOGFILE%"
echo ======================================== >> "%LOGFILE%"
adb logcat -d | findstr "ExamAI" >> "%LOGFILE%"

echo.
echo ✅ 日志已保存到: %LOGFILE%
echo.
echo 📋 日志文件内容预览（最后50行）：
echo ========================================
type "%LOGFILE%" | more +50
echo ========================================
echo.
echo 💡 请把这个日志文件的内容发给我，我会帮你分析问题！
echo.

pause
