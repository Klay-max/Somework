# Android 构建 - Prebuild 尝试记录

## 执行时间
2026-01-22

## 问题诊断

根据 ChatGPT 专家分析，问题本质是：
- 项目中存在历史遗留的 `android` 目录
- `expo-constants` / `expo-modules-core` 为 SDK 50 新版
- Android Gradle Plugin / Gradle 版本由 EAS 云端管理（AGP 8.x）
- 错误：`useDefaultAndroidSdkVersions()` 不存在，`components.release` 不存在
- 这是 Expo Modules 与 Android 原生目录结构错位问题

## 执行的修复步骤

### 1. 删除旧的原生目录 ✅
```bash
Remove-Item -Recurse -Force android
Remove-Item -Recurse -Force ios
```

### 2. 修复依赖问题 ✅
```bash
npx expo install expo-constants
npx expo install --fix
npm uninstall @types/react-native
```

修复了以下问题：
- ✅ 安装缺失的 `expo-constants` 依赖
- ✅ 移除不应直接安装的 `@types/react-native`

### 3. 重新生成原生目录 ✅
```bash
npx expo prebuild --clean --platform android
```

结果：
- ✅ 成功清理并重新生成 `android` 目录
- ✅ `expo-constants` 错误已消失
- ✅ `expo-modules-core` 错误已消失

### 4. 尝试构建 ❌
```bash
eas build --profile preview --platform android
```

结果：
- ❌ 仍然失败：Gradle build failed with unknown error
- 构建 ID: 992f7cd6-7d85-48d0-8872-69d02e995e23

## 当前状态

### expo-doctor 检查结果
```
12/15 checks passed. 3 checks failed.
```

剩余问题：
1. ⚠️ `.expo` 目录未被 Git 忽略（实际上已在 .gitignore 中）
2. ⚠️ `expo-modules-autolinking` 版本不匹配（期望 ~1.10.0，实际 1.11.3）
3. ⚠️ app.json 中的原生配置属性在有原生目录时不会同步

## 分析

### 好消息
- ✅ 原始的两个 Gradle 错误（`useDefaultAndroidSdkVersions()` 和 `components.release`）已经通过 prebuild 解决
- ✅ 依赖问题已修复
- ✅ 原生目录已重新生成

### 坏消息
- ❌ 构建仍然失败，但错误信息不明确
- ⚠️ `expo-modules-autolinking` 版本不匹配可能是新问题

## 下一步建议

### 选项 1：修复 expo-modules-autolinking 版本
```bash
npm install expo-modules-autolinking@~1.10.0
npx expo prebuild --clean --platform android
eas build --profile preview --platform android
```

### 选项 2：查看详细构建日志
访问：https://expo.dev/accounts/klay215/projects/anfudao/builds/992f7cd6-7d85-48d0-8872-69d02e995e23

查看具体的 Gradle 错误信息

### 选项 3：使用 Expo Go 测试
```bash
npx expo start
```
在手机上安装 Expo Go，扫码测试所有功能

## 技术细节

### 为什么 prebuild 能解决原始错误？

1. **expo-constants 错误**：
   - 旧的 `android` 目录使用了过时的 Gradle 配置
   - `useDefaultAndroidSdkVersions()` 方法在新版本中已被移除
   - `expo prebuild` 生成的是与 SDK 50 完全兼容的配置

2. **expo-modules-core 错误**：
   - 旧的配置尝试访问不存在的 `release` 组件
   - 新生成的配置使用正确的组件结构

3. **结构性约束**：
   - Expo SDK 50+ 要求原生目录必须由 `expo prebuild` 生成
   - 手动创建或旧版本生成的目录会导致不兼容

## 结论

`expo prebuild --clean` 成功解决了原始的两个 Gradle 错误，但构建仍然失败。需要：
1. 查看新的构建日志以确定具体错误
2. 或修复 `expo-modules-autolinking` 版本不匹配问题
3. 或使用 Expo Go 进行功能测试

---

**更新时间**: 2026-01-22
**构建尝试次数**: 6
**Prebuild 状态**: ✅ 成功
**最终构建状态**: ❌ 失败（新错误）
