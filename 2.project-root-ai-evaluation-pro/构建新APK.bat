@echo off
echo ========================================
echo 构建包含新图标的 APK
echo ========================================
echo.
echo 这将构建一个新的 APK，包含：
echo - 新的应用图标（logo.png）
echo - 首页统计卡片
echo - 历史记录搜索功能
echo - 深色模式切换
echo - 版本标记横幅
echo.
echo 构建大约需要 10-15 分钟...
echo.
pause

npx eas-cli build --platform android --profile preview2 --non-interactive

echo.
echo ========================================
echo 构建已提交！
echo ========================================
echo.
echo 请访问以下链接查看构建进度：
echo https://expo.dev/accounts/klay215/projects/anfudao/builds
echo.
echo 构建完成后，你会收到一个下载链接。
echo.
pause
