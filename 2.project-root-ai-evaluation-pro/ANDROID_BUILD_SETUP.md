# Android 构建配置指南

## 当前状态
✅ EAS 配置文件已创建 (`eas.json`)
✅ Android 权限已配置 (`app.json`)
✅ 相机插件已配置

## 前置要求

### 1. 安装 EAS CLI
```bash
npm install -g eas-cli
```

### 2. 登录 Expo 账号
```bash
eas login
```
如果没有账号，访问 https://expo.dev 注册

### 3. 配置项目
```bash
eas build:configure
```

## 构建步骤

### 方案 A: 本地测试构建（推荐用于开发）

#### 1. 构建开发版 APK
```bash
eas build --profile development --platform android --local
```

**优点**:
- 在本地构建，速度快
- 不消耗 Expo 云构建配额
- 包含开发工具

**缺点**:
- 需要安装 Android SDK
- 文件较大

#### 2. 构建预览版 APK（更小）
```bash
eas build --profile preview --platform android --local
```

**优点**:
- 文件更小
- 接近生产版本
- 仍可本地构建

### 方案 B: 云端构建（推荐用于分发）

#### 1. 构建预览版 APK
```bash
eas build --profile preview --platform android
```

**优点**:
- 无需本地 Android SDK
- Expo 服务器构建
- 每月有免费配额

**缺点**:
- 需要上传代码
- 构建时间较长（10-20分钟）

#### 2. 构建生产版 APK
```bash
eas build --profile production --platform android
```

## 安装到手机

### 方法 1: 通过 USB
1. 在手机上启用"开发者选项"和"USB 调试"
2. 连接手机到电脑
3. 运行：
```bash
adb install path/to/your-app.apk
```

### 方法 2: 通过二维码（云端构建）
1. 构建完成后，EAS 会生成一个下载链接
2. 用手机扫描二维码
3. 下载并安装 APK

### 方法 3: 通过文件传输
1. 将 APK 文件传输到手机
2. 在手机上打开文件管理器
3. 点击 APK 文件安装

## 测试 API 连接

### 确保手机能访问 Vercel API

#### 选项 1: 使用 Vercel 生产环境
- API 地址: `https://somegood.vercel.app/api`
- 手机需要联网
- 可以测试真实的 OCR 和 DeepSeek API

#### 选项 2: 使用本地 API（开发时）
1. 确保电脑和手机在同一 WiFi
2. 找到电脑的局域网 IP：
```bash
ipconfig  # Windows
ifconfig  # Mac/Linux
```
3. 修改 `lib/ApiClient.ts` 中的 API_BASE_URL：
```typescript
const API_BASE_URL = 'http://192.168.x.x:3001/api';  // 替换为你的 IP
```
4. 启动本地 API 服务器：
```bash
node local-api-server.js
```

## 调试技巧

### 1. 查看应用日志
```bash
# Android
adb logcat | grep -i "ReactNativeJS"
```

### 2. 使用 Expo Dev Client
开发版构建包含 Expo Dev Client，可以：
- 实时重新加载
- 查看错误堆栈
- 调试网络请求

### 3. 检查网络请求
在代码中添加日志：
```typescript
console.log('API Request:', url, data);
console.log('API Response:', response);
```

## 常见问题

### Q: 构建失败 - "Gradle build failed"
**A**: 检查 `app.json` 中的配置，确保：
- `package` 名称唯一
- `versionCode` 是整数
- 所有必需的权限已声明

### Q: 安装失败 - "App not installed"
**A**: 
1. 卸载旧版本
2. 检查手机是否允许安装未知来源应用
3. 确保 APK 文件完整

### Q: 相机无法打开
**A**: 
1. 检查权限是否授予
2. 在 `app.json` 中确认相机权限配置
3. 重新安装应用

### Q: API 请求失败
**A**:
1. 检查手机网络连接
2. 确认 API 地址正确
3. 查看控制台日志
4. 测试 Vercel API 是否正常：
```bash
curl https://somegood.vercel.app/api/ocr
```

## 推荐的构建流程

### 第一次构建（快速测试）
```bash
# 1. 构建预览版（云端，无需本地 SDK）
eas build --profile preview --platform android

# 2. 等待构建完成（10-20分钟）

# 3. 扫描二维码下载到手机

# 4. 安装并测试
```

### 后续开发（快速迭代）
```bash
# 1. 使用 Expo Go 测试（最快）
npx expo start

# 2. 在手机上打开 Expo Go 应用

# 3. 扫描二维码

# 注意：Expo Go 可能不支持某些原生功能
```

### 准备发布
```bash
# 1. 构建生产版
eas build --profile production --platform android

# 2. 测试 APK

# 3. 上传到 Google Play 或分发
```

## 下一步

构建完成后，你可以：
1. ✅ 在真实设备上测试扫描功能
2. ✅ 验证相机权限
3. ✅ 测试 OCR 识别
4. ✅ 验证 DeepSeek API 调用
5. ✅ 检查报告生成

## 需要帮助？

如果遇到问题：
1. 查看 EAS 构建日志
2. 检查 Expo 文档: https://docs.expo.dev/build/setup/
3. 查看手机日志: `adb logcat`
