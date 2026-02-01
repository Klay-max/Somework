@echo off
echo ========================================
echo 安辅导 Android APK 构建脚本 (Mock 模式)
echo ========================================
echo.

echo [1/4] 清理旧的构建文件...
if exist android\app\build\outputs\apk (
    rmdir /s /q android\app\build\outputs\apk
)

echo [2/4] 预构建 Android 项目...
call npx expo prebuild --platform android

echo [3/4] 构建 APK...
cd android
call gradlew.bat assembleRelease
cd ..

echo [4/4] 复制 APK 到根目录...
if exist android\app\build\outputs\apk\release\app-release.apk (
    copy android\app\build\outputs\apk\release\app-release.apk anfudao-mock-v1.0.0.apk
    echo.
    echo ========================================
    echo 构建成功！
    echo APK 位置: anfudao-mock-v1.0.0.apk
    echo ========================================
) else (
    echo.
    echo ========================================
    echo 构建失败！请检查错误信息
    echo ========================================
)

pause
