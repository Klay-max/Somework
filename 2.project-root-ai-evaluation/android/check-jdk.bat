@echo off
echo ========================================
echo Android JDK 检查工具
echo ========================================
echo.

echo 当前JAVA_HOME:
echo %JAVA_HOME%
echo.

echo 当前Java版本:
java -version
echo.

echo ========================================
echo 检查结果:
echo ========================================

java -version 2>&1 | findstr /C:"GraalVM" >nul
if %errorlevel%==0 (
    echo [警告] 检测到GraalVM JDK
    echo.
    echo GraalVM与Android Gradle插件不完全兼容。
    echo 建议安装标准的JDK 17。
    echo.
    echo 下载地址:
    echo - Oracle JDK 17: https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html
    echo - OpenJDK 17: https://adoptium.net/temurin/releases/?version=17
    echo.
) else (
    echo [OK] 使用标准JDK
)

echo.
echo ========================================
echo 建议:
echo ========================================
echo 1. 在Android Studio中打开项目
echo 2. File ^> Settings ^> Build Tools ^> Gradle
echo 3. 设置 Gradle JDK 为 JDK 17
echo 4. 点击 Apply 和 OK
echo 5. File ^> Invalidate Caches ^> Invalidate and Restart
echo.

pause
