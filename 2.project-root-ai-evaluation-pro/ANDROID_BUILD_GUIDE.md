# Android 构建指南

## 概述

本指南介绍如何使用 Expo Application Services (EAS) 构建和发布 VISION-CORE Android 应用。

## 前置准备

### 1. 安装 EAS CLI

```bash
npm install -g eas-cli
```

### 2. 登录 Expo 账号

```bash
eas login
```

如果没有账号，访问 [expo.dev](https://expo.dev) 注册。

### 3. 配置项目

```bash
# 初始化 EAS（如果还没有 eas.json）
eas build:configure
```

## 构建配置

### eas.json 配置说明

项目已包含 `eas.json` 配置文件，包含三个构建配置：

#### 1. Development（开发版本）
```json
"development": {
  "developmentClient": true,
  "distribution": "internal",
  "android": {
    "buildType": "apk"
  }
}
```
- 用于开发和调试
- 包含开发工具
- 生成 APK 文件

#### 2. Preview（预览版本）
```json
"preview": {
  "distribution": "internal",
  "android": {
    "buildType": "apk"
  }
}
```
- 用于内部测试
- 不包含开发工具
- 生成 APK 文件

#### 3. Production（生产版本）
```json
"production": {
  "android": {
    "buildType": "apk"
  }
}
```
- 用于正式发布
- 优化性能
- 可生成 APK 或 AAB

### app.json Android 配置

```json
"android": {
  "adaptiveIcon": {
    "foregroundImage": "./assets/adaptive-icon.png",
    "backgroundColor": "#000000"
  },
  "package": "com.visioncore.app",
  "versionCode": 1,
  "permissions": [
    "android.permission.CAMERA",
    "android.permission.READ_EXTERNAL_STORAGE",
    "android.permission.WRITE_EXTERNAL_STORAGE",
    "android.permission.INTERNET"
  ]
}
```

**配置说明**：
- `package`: 应用包名（唯一标识符）
- `versionCode`: 版本号（每次发布需递增）
- `permissions`: 应用所需权限
  - `CAMERA`: 相机权限（扫描答题卡）
  - `READ/WRITE_EXTERNAL_STORAGE`: 存储权限（保存图片）
  - `INTERNET`: 网络权限（API 调用）

## 构建流程

### 1. 开发版本构建

```bash
# 构建开发版 APK
eas build --profile development --platform android

# 构建完成后，下载并安装到设备
# EAS 会提供下载链接
```

### 2. 预览版本构建

```bash
# 构建预览版 APK（用于测试）
eas build --profile preview --platform android
```

### 3. 生产版本构建

```bash
# 构建生产版 APK
eas build --profile production --platform android

# 或构建 AAB（用于 Google Play）
eas build --profile production --platform android --build-type aab
```

## 本地构建（可选）

如果需要在本地构建（不使用 EAS 云服务）：

```bash
# 安装依赖
npm install --legacy-peer-deps

# 预构建原生代码
npx expo prebuild --platform android

# 使用 Android Studio 或 Gradle 构建
cd android
./gradlew assembleRelease
```

## 签名配置

### 自动签名（推荐）

EAS 会自动为你生成和管理签名密钥。

### 手动签名

如果需要使用自己的签名密钥：

1. **生成密钥库**：
```bash
keytool -genkeypair -v -storetype PKCS12 -keystore vision-core.keystore \
  -alias vision-core -keyalg RSA -keysize 2048 -validity 10000
```

2. **配置 credentials.json**：
```json
{
  "android": {
    "keystore": {
      "keystorePath": "./vision-core.keystore",
      "keystorePassword": "your-password",
      "keyAlias": "vision-core",
      "keyPassword": "your-password"
    }
  }
}
```

3. **使用自定义密钥构建**：
```bash
eas build --profile production --platform android --local-credentials
```

## 测试 APK

### 安装到设备

1. **通过 USB**：
```bash
adb install path/to/app.apk
```

2. **通过下载链接**：
- EAS 构建完成后会提供下载链接
- 在 Android 设备上打开链接
- 允许安装未知来源应用
- 安装 APK

### 测试清单

- [ ] 应用启动正常
- [ ] 相机权限请求
- [ ] 文件上传功能
- [ ] OCR 识别功能
- [ ] AI 分析功能
- [ ] 报告显示
- [ ] 历史记录
- [ ] 网络连接
- [ ] 错误处理

## 发布到 Google Play

### 1. 准备工作

1. **注册 Google Play 开发者账号**
   - 访问 [Google Play Console](https://play.google.com/console)
   - 支付 $25 注册费

2. **创建应用**
   - 在 Play Console 创建新应用
   - 填写应用信息

3. **准备资源**
   - 应用图标（512x512）
   - 功能图片（1024x500）
   - 截图（至少 2 张）
   - 应用描述
   - 隐私政策链接

### 2. 构建 AAB

```bash
# 构建 Android App Bundle（Google Play 推荐格式）
eas build --profile production --platform android
```

### 3. 上传到 Google Play

#### 方法 1: 使用 EAS Submit（推荐）

```bash
# 配置 Google Play 服务账号
# 1. 在 Google Cloud Console 创建服务账号
# 2. 下载 JSON 密钥文件
# 3. 在 Play Console 授权服务账号

# 提交到 Google Play
eas submit --platform android
```

#### 方法 2: 手动上传

1. 登录 [Google Play Console](https://play.google.com/console)
2. 选择你的应用
3. 进入"发布" → "生产"
4. 创建新版本
5. 上传 AAB 文件
6. 填写版本说明
7. 提交审核

### 4. 发布轨道

Google Play 提供多个发布轨道：

- **内部测试**：最多 100 个测试者，立即可用
- **封闭测试**：指定测试者列表
- **开放测试**：任何人都可以加入测试
- **生产**：正式发布给所有用户

建议流程：
1. 内部测试 → 2. 封闭测试 → 3. 开放测试 → 4. 生产发布

## 版本管理

### 更新版本号

每次发布新版本时，需要更新版本号：

**app.json**:
```json
{
  "expo": {
    "version": "1.0.1",  // 用户可见版本
    "android": {
      "versionCode": 2   // 必须递增
    }
  }
}
```

### 版本命名规范

- **主版本号**：重大更新（1.0.0 → 2.0.0）
- **次版本号**：新功能（1.0.0 → 1.1.0）
- **修订号**：Bug 修复（1.0.0 → 1.0.1）

## 常见问题

### 1. 构建失败

**问题**：依赖冲突或配置错误

**解决方案**：
```bash
# 清理缓存
npm cache clean --force
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# 重新构建
eas build --profile production --platform android --clear-cache
```

### 2. 权限被拒绝

**问题**：应用无法访问相机或存储

**解决方案**：
- 检查 app.json 中的 permissions 配置
- 在应用中正确请求权限
- 参考 `expo-camera` 文档

### 3. APK 过大

**问题**：APK 文件超过 100MB

**解决方案**：
- 使用 AAB 格式（自动优化）
- 移除未使用的资源
- 启用代码压缩
- 使用 ProGuard/R8

### 4. 签名不匹配

**问题**：更新应用时签名不一致

**解决方案**：
- 使用相同的密钥库
- 或使用 EAS 自动管理密钥

## 性能优化

### 1. 启用 Hermes

Hermes 是 React Native 的优化 JavaScript 引擎。

**app.json**:
```json
{
  "expo": {
    "android": {
      "jsEngine": "hermes"
    }
  }
}
```

### 2. 启用代码压缩

**eas.json**:
```json
{
  "build": {
    "production": {
      "android": {
        "gradleCommand": ":app:bundleRelease"
      }
    }
  }
}
```

### 3. 优化图片资源

```bash
# 压缩图片
npm install -g imagemin-cli
imagemin assets/*.png --out-dir=assets/optimized
```

## 监控和分析

### 1. 集成 Firebase Analytics

```bash
npm install @react-native-firebase/app @react-native-firebase/analytics
```

### 2. 集成 Sentry（错误追踪）

```bash
npm install @sentry/react-native
```

### 3. 性能监控

- 使用 React Native Performance
- 监控应用启动时间
- 监控 API 响应时间

## 相关资源

- [Expo EAS Build 文档](https://docs.expo.dev/build/introduction/)
- [Google Play Console](https://play.google.com/console)
- [Android 开发者文档](https://developer.android.com/)
- [React Native 文档](https://reactnative.dev/)

## 下一步

构建完成后：
1. 测试 APK 功能
2. 收集用户反馈
3. 修复 Bug
4. 发布到 Google Play
5. 监控应用性能

---

**更新时间**: 2026-01-14  
**状态**: 可用 ✅
