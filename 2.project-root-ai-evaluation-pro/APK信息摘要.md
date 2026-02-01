# APK 信息摘要

## 📦 APK 基本信息

| 项目 | 信息 |
|------|------|
| **应用名称** | 安辅导 |
| **包名** | com.anfudao.app |
| **版本号** | 1.0.0 |
| **版本代码** | 1 |
| **文件名** | app-release.apk |
| **文件大小** | 89.7 MB (89,748,762 字节) |
| **构建时间** | 2026/1/23 13:45:46 |
| **构建类型** | Release (未签名) |
| **最低 Android 版本** | Android 5.0 (API 21) |
| **目标 Android 版本** | Android 14 (API 34) |

---

## 🔐 权限列表

APK 请求以下权限：

- ✅ **相机权限** (`CAMERA`) - 用于扫描答题卡
- ✅ **存储读取** (`READ_EXTERNAL_STORAGE`) - 读取图片
- ✅ **存储写入** (`WRITE_EXTERNAL_STORAGE`) - 保存处理结果
- ✅ **网络访问** (`INTERNET`) - OCR 和 AI 分析
- ✅ **录音权限** (`RECORD_AUDIO`) - 相机功能需要

---

## 🎨 应用特性

- **界面风格**：深色模式 (Dark Mode)
- **屏幕方向**：竖屏 (Portrait)
- **图标**：自适应图标（支持各种启动器）
- **启动画面**：黑色背景，居中显示

---

## 🛠️ 技术栈

- **框架**：Expo SDK 51 + React Native 0.74.5
- **路由**：Expo Router (文件系统路由)
- **UI**：NativeWind (Tailwind CSS for React Native)
- **相机**：expo-camera
- **国际化**：expo-localization + i18next
- **状态管理**：React Hooks + Context API

---

## 📂 文件位置

```
android\app\build\outputs\apk\release\app-release.apk
```

**完整路径**：
```
D:\桌面文件\project-root\android\app\build\outputs\apk\release\app-release.apk
```

---

## 🔍 APK 内容

APK 包含以下主要组件：

### 核心功能
- 📷 相机扫描
- 🔍 OCR 文字识别
- 🤖 AI 智能分析
- 📊 数据可视化报告
- 📁 批量处理
- 📜 历史记录
- ⚙️ 设置管理

### 支持的语言
- 🇨🇳 简体中文
- 🇺🇸 English

### 运行模式
- 🌐 真实 API 模式（需要网络和 API 密钥）
- 🎭 模拟模式（离线测试，使用假数据）

---

## ⚠️ 重要说明

### 关于签名
- ❌ 此 APK **未签名**
- ✅ 可以安装在自己的设备上测试
- ❌ 不能发布到 Google Play 商店
- ⚠️ 其他用户安装时会看到"未知来源"警告

### 关于 API 密钥
- 如果构建时 `.env.local` 中配置了 API 密钥，它们会被打包进 APK
- 可以在应用设置中切换"模拟模式"进行无 API 测试
- 真实 API 模式需要网络连接

### 关于更新
- 如果修改代码后需要重新测试，需要重新构建 APK
- 重新构建命令：`cd android && .\gradlew assembleRelease --no-daemon`
- 后续构建会快得多（依赖已缓存）

---

## 📱 兼容性

### 支持的设备
- ✅ 所有 Android 5.0+ 设备
- ✅ 手机和平板
- ✅ 各种屏幕尺寸

### 推荐配置
- Android 8.0+ (API 26+)
- 2GB+ RAM
- 200MB+ 可用存储空间
- 后置摄像头

---

## 🚀 安装方法

### 方法 1：手动传输
1. 将 APK 复制到手机
2. 在手机上点击安装
3. 允许"未知来源"权限

### 方法 2：ADB 安装
```bash
adb install -r android\app\build\outputs\apk\release\app-release.apk
```

### 方法 3：一键安装
```bash
install-apk.bat
```

---

## 📊 构建统计

- **构建方式**：本地 Gradle 构建
- **Java 版本**：JDK 17
- **Gradle 版本**：8.8
- **构建时间**：约 10 分钟（首次）
- **后续构建**：约 2-3 分钟

---

## 🔄 版本历史

### v1.0.0 (2026/1/23)
- 🎉 首个 Release 版本
- ✅ 完整功能实现
- ✅ 本地构建成功
- ⏳ 待测试和反馈

---

## 📞 支持

如有问题，请参考：
- `APK测试指南.md` - 安装和测试指南
- `APK测试检查清单.md` - 完整测试清单
- `快速测试指南.md` - 5分钟快速测试

---

**构建状态**：✅ 成功  
**测试状态**：⏳ 待测试  
**发布状态**：❌ 未签名，不可发布
