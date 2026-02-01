# EAS Build 失败原因分析

## 构建信息

```
构建 ID:     8ebbec21-1f2e-4603-b856-279c4dd2d3d9
状态:        ❌ ERRORED
平台:        Android
配置:        preview
SDK 版本:    50.0.0 (项目使用 51.0.0)
构建时间:    2026/1/22 16:30:02 - 16:32:27 (约 2.5 分钟)
```

## 错误信息

### 主要错误
```
错误代码: EAS_BUILD_UNKNOWN_GRADLE_ERROR
错误信息: Gradle build failed with unknown error. 
         See logs for the "Run gradlew" phase for more information.
```

### 构建指标
```json
{
  "buildWaitTime": 1420,      // 等待时间: 1.4 秒
  "buildQueueTime": 35758,    // 队列时间: 35.8 秒
  "buildDuration": 97670      // 构建时间: 97.7 秒 (约 1.6 分钟)
}
```

## 问题分析

### 1. SDK 版本不匹配 ⚠️

**项目配置**：
- `package.json`: `"expo": "~51.0.0"` ✅
- `react-native`: `"0.74.5"` ✅

**EAS 构建使用**：
- SDK Version: `50.0.0` ❌

**为什么会这样？**
- EAS 可能从 Git 提交中读取了旧的配置
- 或者缓存了之前的构建配置
- Git 提交: `dad091abaa9becf2db01bd7781834c43e1519f51`
- 提交信息: "添加工作总结文档 - 2026-01-19"

### 2. Gradle 构建失败

**可能的原因**：

#### A. SDK 版本不匹配导致的依赖冲突
- Expo SDK 50 的依赖与 SDK 51 的代码不兼容
- 某些包（如 expo-updates）需要 SDK 51

#### B. 原生依赖问题
- React Native 0.74.5 需要特定的 Gradle 配置
- NDK/CMake 版本可能不兼容

#### C. 配置文件问题
- `app.json` 中的某些配置可能与 SDK 50 不兼容
- `runtimeVersion: "1.0.0"` 可能需要 SDK 51

#### D. expo-updates 兼容性
- `expo-updates@0.25.28` 是为 SDK 51 设计的
- 在 SDK 50 环境下可能无法构建

### 3. 构建时间很短（1.6 分钟）

这表明：
- ❌ 构建在早期阶段就失败了
- ❌ 可能是依赖安装或配置阶段出错
- ❌ 没有进入实际的编译阶段

## 根本原因

**最可能的原因**：

EAS Build 使用了错误的 SDK 版本（50 而不是 51），导致：
1. 依赖版本不匹配
2. expo-updates 无法正确安装
3. Gradle 配置冲突
4. 构建在早期阶段失败

## 解决方案

### 方案 1：强制使用正确的 SDK 版本 ⭐ (推荐)

在 `app.json` 中明确指定 SDK 版本：

```json
{
  "expo": {
    "sdkVersion": "51.0.0",
    // ... 其他配置
  }
}
```

然后清理缓存重新构建：
```bash
eas build --platform android --profile preview --clear-cache
```

### 方案 2：检查 Git 提交

确保最新的代码已提交：

```bash
# 查看当前状态
git status

# 如果有未提交的更改
git add .
git commit -m "更新到 Expo SDK 51"

# 重新构建
eas build --platform android --profile preview --clear-cache
```

### 方案 3：使用 preview2 配置

尝试使用不同的构建配置：

```bash
eas build --platform android --profile preview2 --clear-cache
```

### 方案 4：临时降级到 SDK 50

如果急需 EAS Build 成功，可以临时降级：

```bash
# 降级到 SDK 50
npx expo install expo@~50.0.0

# 更新所有依赖
npx expo install --fix

# 重新构建
eas build --platform android --profile preview
```

**注意**：这会失去 SDK 51 的新特性，不推荐长期使用。

### 方案 5：使用本地构建的 APK ✅ (最快)

你已经有一个成功的本地 APK：

```bash
# 位置
android\app\build\outputs\apk\release\app-release.apk

# 大小
89.7 MB

# 状态
✅ 已测试，功能正常

# 安装
adb install android\app\build\outputs\apk\release\app-release.apk
```

**优点**：
- ✅ 立即可用
- ✅ 已验证可用
- ✅ 无需等待

**缺点**：
- ❌ 没有 OTA 更新功能

## 详细的修复步骤

### 步骤 1：修改 app.json

```bash
# 打开 app.json，添加 sdkVersion
```

```json
{
  "expo": {
    "name": "安辅导",
    "slug": "anfudao",
    "version": "1.0.0",
    "sdkVersion": "51.0.0",  // 👈 添加这一行
    // ... 其他配置保持不变
  }
}
```

### 步骤 2：确认依赖版本

```bash
# 检查 package.json
cat package.json | grep "expo"

# 应该看到
"expo": "~51.0.0"
```

### 步骤 3：提交更改

```bash
git add app.json
git commit -m "明确指定 Expo SDK 51.0.0"
```

### 步骤 4：清理缓存并重新构建

```bash
# 清理 EAS 缓存
eas build --platform android --profile preview --clear-cache

# 或使用 preview2（无需凭证）
eas build --platform android --profile preview2 --clear-cache
```

### 步骤 5：监控构建

```bash
# 构建开始后，可以查看状态
eas build:list

# 或访问 Web 界面
# https://expo.dev/accounts/klay215/projects/anfudao/builds
```

## 预期结果

### 如果修复成功
- ✅ 构建时间应该在 10-20 分钟
- ✅ 会生成 APK 文件
- ✅ APK 包含 OTA 更新功能
- ✅ 可以通过 `eas update` 推送更新

### 如果仍然失败
- 查看新的构建日志
- 可能需要调整其他配置
- 或继续使用本地 APK

## 我的建议

### 🎯 立即行动

**选项 A：快速修复 EAS Build**
1. 在 `app.json` 中添加 `"sdkVersion": "51.0.0"`
2. 提交更改
3. 运行 `eas build --platform android --profile preview2 --clear-cache`
4. 等待 10-20 分钟

**选项 B：使用现有 APK**
1. 安装本地 APK：`adb install android\app\build\outputs\apk\release\app-release.apk`
2. 完整测试所有功能
3. 同时后台修复 EAS Build

### 🔄 推荐方案

**两个都做**：
1. 先安装本地 APK，立即开始测试
2. 同时修复 `app.json` 并重新构建
3. 如果 EAS Build 成功，再安装新的 APK 测试 OTA 更新

这样可以：
- ✅ 不浪费时间等待
- ✅ 立即验证应用功能
- ✅ 同时准备 OTA 更新版本

## 查看完整日志

如果需要查看详细的构建日志：

1. **Web 界面**（推荐）：
   ```
   https://expo.dev/accounts/klay215/projects/anfudao/builds/8ebbec21-1f2e-4603-b856-279c4dd2d3d9
   ```

2. **命令行**：
   ```bash
   eas build:view 8ebbec21-1f2e-4603-b856-279c4dd2d3d9
   ```

3. **日志文件**：
   构建日志已保存在 EAS 服务器上，可以通过 Web 界面查看

## 总结

**失败原因**：
- 🔴 SDK 版本不匹配（使用了 50 而不是 51）
- 🔴 导致 Gradle 构建失败
- 🔴 可能是缓存或配置问题

**解决方案**：
- ✅ 在 `app.json` 中明确指定 SDK 版本
- ✅ 清理缓存重新构建
- ✅ 或使用现有的本地 APK

**下一步**：
告诉我你想：
1. 修复 EAS Build（需要 10-20 分钟）
2. 使用现有 APK（立即可用）
3. 两个都做（推荐）

我会帮你继续！🚀
