@echo off
echo ========================================
echo 修复 Android 构建配置
echo ========================================
echo.

echo [1/5] 删除旧的 android 目录...
if exist android (
    rmdir /s /q android
    echo 已删除
) else (
    echo 目录不存在，跳过
)

echo.
echo [2/5] 清理缓存...
if exist node_modules\.cache (
    rmdir /s /q node_modules\.cache
)

echo.
echo [3/5] 运行 Expo prebuild...
call npx expo prebuild --platform android --clean

echo.
echo [4/5] 检查生成的 android 目录...
if exist android (
    echo ✓ Android 目录已生成
) else (
    echo ✗ Android 目录生成失败
    pause
    exit /b 1
)

echo.
echo [5/5] 准备 EAS 构建...
echo 现在可以运行: eas build --profile preview --platform android

echo.
echo ========================================
echo 修复完成！
echo ========================================
pause
