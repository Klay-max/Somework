@echo off
chcp 65001 >nul
echo ========================================
echo 检查 EAS Build 状态
echo ========================================
echo.

echo 构建 ID: 8ebbec21-1f2e-4603-b856-279c4dd2d3d9
echo 状态: ERRORED (失败)
echo SDK 版本: 50.0.0 (应该是 51.0.0)
echo.

echo ========================================
echo 问题分析
echo ========================================
echo.
echo 1. SDK 版本不匹配
echo    - 项目使用: Expo SDK 51
echo    - 构建使用: Expo SDK 50
echo.
echo 2. 可能的原因:
echo    - EAS 缓存了旧的配置
echo    - app.json 配置问题
echo    - node_modules 不同步
echo.

echo ========================================
echo 解决方案
echo ========================================
echo.
echo 方案 1: 清理缓存并重新构建
echo    eas build --platform android --profile preview --clear-cache
echo.
echo 方案 2: 使用本地构建的 APK
echo    - 你已经有一个成功的本地 APK (89.7 MB)
echo    - 位置: android\app\build\outputs\apk\release\app-release.apk
echo.
echo 方案 3: 修复配置后重试
echo    - 确保 package.json 和 app.json 一致
echo    - 删除 node_modules 重新安装
echo    - 重新运行 eas build
echo.

pause
