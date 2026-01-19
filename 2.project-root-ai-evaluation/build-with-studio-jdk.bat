@echo off
echo ========================================
echo Building Android App with Studio JDK
echo ========================================
echo.

REM Set JAVA_HOME to Android Studio's bundled JDK
set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"

echo Using JDK: %JAVA_HOME%
echo.

REM Verify Java version
"%JAVA_HOME%\bin\java" -version
echo.

REM Stop existing Gradle Daemon
echo Stopping Gradle Daemon...
cd android
call gradlew --stop
echo.

REM Build the app
echo Building Android app...
call gradlew assembleDebug
echo.

if %ERRORLEVEL% EQU 0 (
    echo ========================================
    echo ✓ BUILD SUCCESSFUL!
    echo ========================================
    echo.
    echo APK location: android\app\build\outputs\apk\debug\app-debug.apk
) else (
    echo ========================================
    echo ✗ BUILD FAILED
    echo ========================================
)

pause
