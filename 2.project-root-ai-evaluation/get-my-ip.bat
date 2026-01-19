@echo off
echo ========================================
echo 查看你的电脑 IP 地址
echo ========================================
echo.
echo 如果要在真机上测试 Android 应用，需要使用你的电脑 IP 地址
echo.
echo 你的网络配置：
echo ----------------------------------------
ipconfig | findstr /i "IPv4"
echo ----------------------------------------
echo.
echo 找到 "IPv4 地址" 后，修改 android/app/build.gradle.kts 文件：
echo buildConfigField("String", "API_BASE_URL", "\"http://你的IP:8000/\"")
echo.
echo 例如：
echo buildConfigField("String", "API_BASE_URL", "\"http://192.168.1.100:8000/\"")
echo.
pause
