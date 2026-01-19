# Android SDK 版本问题修复指南

## 问题
编译失败,错误信息:
```
A problem occurred configuring project ':app'.
> Failed to install the following Android SDK packages as some licences have not been accepted.
     platforms;android-33 Android SDK Platform 33
     build-tools;33.0.0 Android SDK Build-Tools 33
```

你当前只有 Android SDK 25.0.1,但项目需要 SDK 33。

## 解决方案

### 方案1: 在Android Studio中安装SDK (推荐)

1. 打开 Android Studio
2. 点击 **File** → **Settings** (或 **Ctrl+Alt+S**)
3. 导航到 **Appearance & Behavior** → **System Settings** → **Android SDK**
4. 在 **SDK Platforms** 标签页:
   - 勾选 **Android 13.0 (Tiramisu)** - API Level 33
   - 点击 **Apply** 安装

5. 在 **SDK Tools** 标签页:
   - 勾选 **Android SDK Build-Tools 33.0.0**
   - 点击 **Apply** 安装

6. 等待下载和安装完成

### 方案2: 使用命令行安装SDK

如果Android Studio的SDK Manager不工作,可以使用命令行:

```cmd
# 找到你的Android SDK路径 (通常在)
# C:\Users\你的用户名\AppData\Local\Android\Sdk

# 进入SDK目录
cd C:\Users\WIN10\AppData\Local\Android\Sdk\tools\bin

# 列出可用的包
sdkmanager --list

# 安装需要的包
sdkmanager "platforms;android-33"
sdkmanager "build-tools;33.0.0"

# 接受许可证
sdkmanager --licenses
```

### 方案3: 降级项目到SDK 25 (不推荐)

如果无法安装新SDK,可以降级项目,但会失去很多新特性:

修改 `android/app/build.gradle.kts`:
```kotlin
android {
    compileSdk = 25
    
    defaultConfig {
        minSdk = 21
        targetSdk = 25
        // ...
    }
}
```

但这会导致很多依赖库不兼容,不建议使用。

## 推荐步骤

1. 先尝试方案1 (Android Studio SDK Manager)
2. 如果不行,尝试方案2 (命令行)
3. 安装完成后,重新运行编译:
   ```cmd
   cd android
   .\gradlew assembleDebug
   ```

## 验证安装

安装完成后,检查SDK是否正确安装:

```cmd
# 检查已安装的SDK版本
cd C:\Users\WIN10\AppData\Local\Android\Sdk
dir platforms
dir build-tools
```

应该能看到:
- `platforms\android-33`
- `build-tools\33.0.0`

---

**当前状态**: 等待安装 Android SDK 33

**下一步**: 安装SDK后,重新编译项目
