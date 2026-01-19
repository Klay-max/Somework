@echo off
echo ========================================
echo Creating Virtual Drive to Fix Path Issue
echo ========================================
echo.

REM Create virtual drive P: pointing to current directory
subst P: "%CD%"

if %ERRORLEVEL% EQU 0 (
    echo ✓ Virtual drive P: created successfully
    echo.
    echo Current path with Chinese characters:
    echo %CD%
    echo.
    echo New virtual path (English only):
    echo P:\
    echo.
    echo ========================================
    echo Next Steps:
    echo ========================================
    echo 1. Close Android Studio
    echo 2. Open Android Studio
    echo 3. Open project from: P:\android
    echo 4. Build the project
    echo.
    echo Or run: cd P:\android ^& gradlew assembleDebug
    echo.
    echo To remove virtual drive later: subst P: /d
    echo ========================================
) else (
    echo ✗ Failed to create virtual drive
    echo Please run this script as Administrator
)

pause
