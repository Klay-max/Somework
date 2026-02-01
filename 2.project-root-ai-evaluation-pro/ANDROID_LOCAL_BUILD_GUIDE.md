# Android 本地构建指南

## 🔍 问题诊断

**当前状态**:
- ✅ Android SDK 已安装: `C:\Users\WIN10\AppData\Local\Android\Sdk`
- ✅ Java 已安装: OpenJDK 25.0.1
- ❌ **Java 版本不兼容**: Gradle 8.8 不支持 Java 25

**错误信息**:
```
Unsupported class file major version 69
```

这表示 Java 25（class file version 69）对于当前的 Gradle 版本来说太新了。

## 📋 兼容性要求

| Gradle 版本 | 支持的 Java 版本 |
|------------|----------------|
| Gradle 8.8 | Java 8 - 21    |
| Gradle 8.10+ | Java 8 - 23   |

**推荐**: 使用 **Java 17 LTS** 或 **Java 21 LTS**

## 🔧 解决方案

### 方案 A: 安装 Java 17 LTS（推荐）

1. **下载 Java 17**:
   - 访问: https://adoptium.net/temurin/releases/
   - 选择: Java 17 (LTS)
   - 平台: Windows x64
   - 包类型: JDK
   - 下载 `.msi` 安装包

2. **安装 Java 17**:
   - 运行下载的 `.msi` 文件
   - 勾选 "Set JAVA_HOME variable"
   - 勾选 "Add to PATH"
   - 完成安装

3. **验证安装**:
   ```powershell
   java -version
   # 应该显示: openjdk version "17.x.x"
   ```

4. **重新构建**:
   ```powershell
   cd android
   .\gradlew clean
   .\gradlew assembleRelease
   ```

### 方案 B: 临时使用 Java 17（如果已安装多个版本）

如果你已经安装了 Java 17，可以临时切换：

```powershell
# 设置 JAVA_HOME 指向 Java 17
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

# 验证
java -version

# 构建
cd android
.\gradlew assembleRelease
```

### 方案 C: 升级 Gradle（不推荐，可能引入其他问题）

修改 `android/gradle/wrapper/gradle-wrapper.properties`:
```properties
distributionUrl=https\://services.gradle.org/distributions/gradle-8.10-all.zip
```

然后重新构建。

## 📱 完整构建流程

安装正确的 Java 版本后，按以下步骤构建：

### 1. 清理并重新生成 Android 项目
```powershell
npx expo prebuild --platform android --clean
```

### 2. 设置环境变量
```powershell
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
```

### 3. 构建 APK
```powershell
cd android
.\gradlew assembleRelease
```

### 4. 查找生成的 APK
构建成功后，APK 文件位于:
```
android/app/build/outputs/apk/release/app-release.apk
```

## 🎯 快速测试脚本

创建一个批处理文件 `build-android-local.bat`:

```batch
@echo off
echo ========================================
echo Android 本地构建脚本
echo ========================================

echo.
echo [1/4] 检查 Java 版本...
java -version
if %ERRORLEVEL% NEQ 0 (
    echo 错误: Java 未安装或未添加到 PATH
    pause
    exit /b 1
)

echo.
echo [2/4] 设置环境变量...
set ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk
echo ANDROID_HOME=%ANDROID_HOME%

echo.
echo [3/4] 清理并重新生成 Android 项目...
call npx expo prebuild --platform android --clean
if %ERRORLEVEL% NEQ 0 (
    echo 错误: Prebuild 失败
    pause
    exit /b 1
)

echo.
echo [4/4] 构建 APK...
cd android
call gradlew assembleRelease
if %ERRORLEVEL% NEQ 0 (
    echo 错误: 构建失败
    cd ..
    pause
    exit /b 1
)

cd ..
echo.
echo ========================================
echo 构建成功！
echo APK 位置: android\app\build\outputs\apk\release\app-release.apk
echo ========================================
pause
```

## 🐛 常见问题

### Q1: "ANDROID_HOME is not set"
**解决**: 
```powershell
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
```

### Q2: "SDK location not found"
**解决**: 创建 `android/local.properties`:
```properties
sdk.dir=C:\\Users\\WIN10\\AppData\\Local\\Android\\Sdk
```

### Q3: "Execution failed for task ':app:mergeReleaseResources'"
**解决**: 清理构建缓存
```powershell
cd android
.\gradlew clean
.\gradlew assembleRelease
```

### Q4: 构建太慢
**解决**: 修改 `android/gradle.properties`，增加内存:
```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=1024m
```

## 📊 构建时间预估

- 首次构建: 10-20 分钟（需要下载依赖）
- 后续构建: 3-5 分钟

## 🔗 有用的链接

- [Adoptium Java 下载](https://adoptium.net/temurin/releases/)
- [Gradle 兼容性矩阵](https://docs.gradle.org/current/userguide/compatibility.html)
- [Expo Prebuild 文档](https://docs.expo.dev/workflow/prebuild/)
- [Android Studio 下载](https://developer.android.com/studio)（如果需要完整的 Android 开发环境）

---

**更新时间**: 2026-01-23
**状态**: 等待安装 Java 17
