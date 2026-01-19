@echo off
echo ========================================
echo Rebuilding Android App with KSP
echo ========================================
echo.

REM Set JAVA_HOME
set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
echo Using JDK: %JAVA_HOME%
echo.

REM Change to virtual drive
cd /d P:\android

REM Stop all Gradle Daemons
echo Stopping all Gradle Daemons...
call gradlew --stop
echo.

REM Clean all build artifacts
echo Cleaning build artifacts...
if exist .gradle rmdir /s /q .gradle
if exist app\build rmdir /s /q app\build
if exist build rmdir /s /q build
echo.

REM Clean global Gradle cache for this project
echo Cleaning Gradle cache...
if exist "%USERPROFILE%\.gradle\caches" (
    rmdir /s /q "%USERPROFILE%\.gradle\caches\transforms-*" 2>nul
    rmdir /s /q "%USERPROFILE%\.gradle\caches\modules-*" 2>nul
)
echo.

REM Build with KSP
echo Building with KSP (no KAPT)...
call gradlew assembleDebug --no-build-cache --refresh-dependencies
echo.

if %ERRORLEVEL% EQU 0 (
    echo ========================================
    echo ✓ BUILD SUCCESSFUL!
    echo ========================================
    echo.
    echo APK location: P:\android\app\build\outputs\apk\debug\app-debug.apk
    echo.
    echo You can now open Android Studio and run the app!
) else (
    echo ========================================
    echo ✗ BUILD FAILED
    echo ========================================
    echo.
    echo Check the error messages above.
)

pause
