@echo off
echo Creating global Gradle configuration...

REM Create .gradle directory if it doesn't exist
if not exist "%USERPROFILE%\.gradle" mkdir "%USERPROFILE%\.gradle"

REM Create gradle.properties with KAPT JDK compatibility settings
(
echo # Global Gradle Configuration
echo # JVM arguments for KAPT compatibility with JDK 17+
echo org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8 --add-opens=jdk.compiler/com.sun.tools.javac.main=ALL-UNNAMED --add-opens=jdk.compiler/com.sun.tools.javac.code=ALL-UNNAMED --add-opens=jdk.compiler/com.sun.tools.javac.comp=ALL-UNNAMED --add-opens=jdk.compiler/com.sun.tools.javac.file=ALL-UNNAMED --add-opens=jdk.compiler/com.sun.tools.javac.jvm=ALL-UNNAMED --add-opens=jdk.compiler/com.sun.tools.javac.parser=ALL-UNNAMED --add-opens=jdk.compiler/com.sun.tools.javac.processing=ALL-UNNAMED --add-opens=jdk.compiler/com.sun.tools.javac.tree=ALL-UNNAMED --add-opens=jdk.compiler/com.sun.tools.javac.util=ALL-UNNAMED
echo.
echo # Enable Gradle daemon
echo org.gradle.daemon=true
echo.
echo # Enable parallel builds
echo org.gradle.parallel=true
) > "%USERPROFILE%\.gradle\gradle.properties"

echo.
echo ✓ Created: %USERPROFILE%\.gradle\gradle.properties
echo.
echo Now stopping Gradle Daemon...
cd android
call gradlew --stop
echo.
echo ✓ Gradle Daemon stopped
echo.
echo Please restart Android Studio and try building again.
pause
