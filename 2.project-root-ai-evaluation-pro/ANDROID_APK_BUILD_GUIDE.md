# 📱 安辅导 Android APK 构建指南

## 🎯 当前状态

**Mock 模式已启用** ✅
- 文件：`lib/MockApiService.ts`
- 配置：`enabled: true`
- 无需网络即可完整体验所有功能

---

## 🚀 快速构建（推荐）

### 方法 1：使用 EAS Build（云构建）

**优点**：
- 不依赖本地环境
- 构建速度快
- 自动处理依赖

**步骤**：

1. **登录 EAS**
```bash
eas login
```

2. **创建新项目**
```bash
eas init
```

3. **构建 APK**
```bash
eas build --profile preview --platform android
```

4. **等待构建完成**（约 10-15 分钟）
   - EAS 会提供下载链接
   - 下载 APK 到本地

---

### 方法 2：本地构建

**前提条件**：
- ✅ Android Studio 已安装
- ✅ Java JDK 17+ 已安装
- ✅ Android SDK 已配置
- ✅ Gradle 可以正常下载

**步骤**：

1. **清理旧构建**
```bash
cd android
.\gradlew.bat clean
cd ..
```

2. **预构建 Android 项目**
```bash
npx expo prebuild --platform android
```

3. **构建 Release APK**
```bash
cd android
.\gradlew.bat assembleRelease
cd ..
```

4. **查找 APK**
```
android\app\build\outputs\apk\release\app-release.apk
```

---

### 方法 3：使用构建脚本

**已创建脚本**：`build-android-apk.bat`

**使用方法**：
```bash
.\build-android-apk.bat
```

脚本会自动：
1. 清理旧文件
2. 预构建项目
3. 构建 APK
4. 复制到根目录（`anfudao-mock-v1.0.0.apk`）

---

## 🐛 常见问题

### 问题 1：Gradle 下载超时

**错误信息**：
```
Timeout of 120000 reached waiting for exclusive access to file: gradle-8.8-all.zip
```

**解决方案**：

1. **等待当前下载完成**
   - Gradle 正在后台下载
   - 可能需要 5-10 分钟
   - 不要中断进程

2. **手动下载 Gradle**
   - 访问：https://services.gradle.org/distributions/gradle-8.8-all.zip
   - 下载后放到：`C:\Users\WIN10\.gradle\wrapper\dists\gradle-8.8-all\`
   - 解压缩

3. **使用国内镜像**
   - 编辑 `android/gradle/wrapper/gradle-wrapper.properties`
   - 修改下载地址为阿里云镜像

---

### 问题 2：Android 目录被占用

**错误信息**：
```
EBUSY: resource busy or locked, rmdir 'android'
```

**解决方案**：

1. 关闭所有 Android Studio 窗口
2. 关闭所有终端窗口
3. 重启电脑（如果需要）
4. 重新运行构建命令

---

### 问题 3：EAS 项目 ID 无效

**错误信息**：
```
Invalid UUID appId
```

**解决方案**：

1. 删除 `app.json` 中的 `extra.eas.projectId`
2. 运行 `eas init` 创建新项目
3. 重新构建

---

## 📦 构建产物

### Mock 模式 APK 特性

**文件名**：`anfudao-mock-v1.0.0.apk`

**功能**：
- ✅ 完整的 UI/UX
- ✅ 相机扫描功能
- ✅ 图片上传功能
- ✅ 模拟 OCR 识别（1.5 秒延迟）
- ✅ 模拟 AI 分析（2 秒延迟）
- ✅ 模拟学习路径生成（1.5 秒延迟）
- ✅ 历史记录管理
- ✅ PDF 导出功能
- ✅ 批量处理功能
- ✅ 多语言支持

**Mock 数据**：
- 50 道选择题
- 5 道错题（题号：5, 12, 23, 34, 45）
- 总分：90/100
- 完整的能力分析
- 3 阶段学习路径

**优点**：
- 无需网络连接
- 响应速度快
- 适合演示和测试
- 不消耗 API 配额

---

## 🔄 切换到真实 API 模式

如果后续想构建真实 API 版本：

1. **修改 Mock 配置**
```typescript
// lib/MockApiService.ts
export const MOCK_CONFIG = {
  enabled: false, // 改为 false
  // ...
};
```

2. **重新构建**
```bash
.\build-android-apk.bat
```

3. **配置 API 密钥**
   - 确保 `.env.local` 中有正确的 API 密钥
   - 或在应用设置中配置

---

## 📱 安装和测试

### 安装 APK

1. **传输到手机**
   - USB 连接
   - 或通过云盘/微信传输

2. **启用未知来源**
   - 设置 → 安全 → 允许安装未知应用

3. **安装 APK**
   - 点击 APK 文件
   - 按照提示安装

### 测试功能

1. **启动应用**
   - 查看启动画面
   - 进入主界面

2. **测试扫描**
   - 点击"开始扫描"
   - 上传任意图片或拍照
   - 等待 1-2 秒

3. **查看报告**
   - 得分统计
   - 能力雷达图
   - 知识矩阵
   - AI 分析
   - 学习路径

4. **测试其他功能**
   - 历史记录
   - 批量扫描
   - PDF 导出
   - 语言切换

---

## 🎨 APK 信息

**应用名称**：安辅导  
**包名**：com.anfudao.app  
**版本**：1.0.0  
**版本号**：1  
**最小 SDK**：21 (Android 5.0)  
**目标 SDK**：34 (Android 14)  

**权限**：
- 相机权限（扫描功能）
- 存储权限（保存图片和 PDF）
- 网络权限（真实 API 模式需要）

**签名**：
- Debug 签名（开发版本）
- 需要 Release 签名才能发布到应用商店

---

## 🚀 下一步

### 当前可以做的：

1. **等待 Gradle 下载完成**
   - 检查：`C:\Users\WIN10\.gradle\wrapper\dists\gradle-8.8-all\`
   - 看是否有完整的 gradle-8.8 文件夹

2. **使用 EAS Build**
   - 如果有 Expo 账号
   - 云构建更快更稳定

3. **使用已有的 APK**
   - 项目根目录有 `AI test-0116.apk`
   - 可以先测试这个版本

### 构建完成后：

1. **测试 Mock 模式 APK**
2. **收集用户反馈**
3. **修复评分逻辑**
4. **构建真实 API 版本**
5. **发布到应用商店**

---

## 💡 建议

**推荐方案**：使用 EAS Build

**原因**：
- 不受本地环境限制
- 构建速度快
- 自动处理依赖
- 提供下载链接
- 支持多平台

**命令**：
```bash
# 1. 登录
eas login

# 2. 初始化（如果需要）
eas init

# 3. 构建
eas build --profile preview --platform android

# 4. 等待完成，下载 APK
```

---

**构建时间**：2026-01-20  
**模式**：Mock 模式  
**状态**：准备就绪，等待 Gradle 下载完成或使用 EAS Build
