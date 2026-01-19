@echo off
echo ========================================
echo Android 项目配置验证脚本
echo ========================================
echo.

echo [1/7] 检查虚拟驱动器 P: ...
if exist P:\android (
    echo ✅ 虚拟驱动器 P: 存在
) else (
    echo ❌ 虚拟驱动器 P: 不存在
    echo 请运行: subst P: "D:\桌面文件\作品集\project-root-ai evaluation"
    goto :error
)

echo.
echo [2/7] 检查 Android 项目目录...
if exist P:\android\build.gradle.kts (
    echo ✅ Android 项目存在
) else (
    echo ❌ Android 项目不存在
    goto :error
)

echo.
echo [3/7] 检查 Hilt 插件配置...
findstr /C:"com.google.dagger.hilt.android" P:\android\build.gradle.kts >nul
if %errorlevel% equ 0 (
    echo ✅ 根目录 Hilt 插件已配置
) else (
    echo ❌ 根目录 Hilt 插件未配置
    goto :error
)

echo.
echo [4/7] 检查 app 模块 Hilt 插件...
findstr /C:"com.google.dagger.hilt.android" P:\android\app\build.gradle.kts >nul
if %errorlevel% equ 0 (
    echo ✅ app 模块 Hilt 插件已应用
) else (
    echo ❌ app 模块 Hilt 插件未应用
    goto :error
)

echo.
echo [5/7] 检查 KSP 插件...
findstr /C:"com.google.devtools.ksp" P:\android\app\build.gradle.kts >nul
if %errorlevel% equ 0 (
    echo ✅ KSP 插件已配置
) else (
    echo ❌ KSP 插件未配置
    goto :error
)

echo.
echo [6/7] 检查 Application 类...
if exist P:\android\app\src\main\java\com\examai\ExamAiApplication.kt (
    echo ✅ ExamAiApplication.kt 存在
    findstr /C:"@HiltAndroidApp" P:\android\app\src\main\java\com\examai\ExamAiApplication.kt >nul
    if %errorlevel% equ 0 (
        echo ✅ @HiltAndroidApp 注解存在
    ) else (
        echo ❌ @HiltAndroidApp 注解缺失
        goto :error
    )
) else (
    echo ❌ ExamAiApplication.kt 不存在
    goto :error
)

echo.
echo [7/7] 检查 MainActivity...
if exist P:\android\app\src\main\java\com\examai\MainActivity.kt (
    echo ✅ MainActivity.kt 存在
    findstr /C:"@AndroidEntryPoint" P:\android\app\src\main\java\com\examai\MainActivity.kt >nul
    if %errorlevel% equ 0 (
        echo ✅ @AndroidEntryPoint 注解存在
    ) else (
        echo ❌ @AndroidEntryPoint 注解缺失
        goto :error
    )
) else (
    echo ❌ MainActivity.kt 不存在
    goto :error
)

echo.
echo ========================================
echo ✅ 所有配置检查通过！
echo ========================================
echo.
echo 📋 配置状态：
echo   ✅ 虚拟驱动器 P: 已创建
echo   ✅ Hilt 插件已正确配置
echo   ✅ KSP 插件已配置
echo   ✅ @HiltAndroidApp 注解已添加
echo   ✅ @AndroidEntryPoint 注解已添加
echo.
echo ⚠️  唯一问题：JDK 版本
echo   ❌ 系统 JDK 25 不兼容 Kotlin 1.9.20
echo   ✅ 解决方案：使用 Android Studio + JDK 21
echo.
echo 🎯 下一步：
echo   1. 打开 Android Studio
echo   2. Settings → Build Tools → Gradle → Gradle JDK
echo   3. 选择 JDK 21（或下载）
echo   4. 打开项目：P:\android
echo   5. 等待 Sync 完成
echo   6. Build → Make Project
echo.
echo 📖 详细说明：请阅读 请使用AndroidStudio构建.md
echo.
pause
exit /b 0

:error
echo.
echo ========================================
echo ❌ 配置检查失败
echo ========================================
echo.
echo 请检查上述错误信息并修复。
echo.
pause
exit /b 1
