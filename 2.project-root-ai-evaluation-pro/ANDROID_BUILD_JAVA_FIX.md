# 🔧 Android 构建 Java 版本修复指南

## ❌ 当前问题

**错误信息**：
```
Unsupported class file major version 69
```

**原因**：
- 当前 Java 版本：**Java 25**
- Gradle 8.8 需要：**Java 17**
- 版本不兼容

---

## ✅ 解决方案

### 方案 1：使用 EAS Build（推荐）⭐

**优点**：
- 不需要配置 Java
- 云端自动处理所有依赖
- 构建速度快
- 提供下载链接

**步骤**：

```bash
# 1. 登录 EAS
eas login

# 2. 初始化项目
eas init

# 3. 构建 APK（Mock 模式已启用）
eas build --profile preview --platform android
```

**预计时间**：10-15 分钟

---

### 方案 2：安装 Java 17

**步骤**：

1. **下载 Java 17**
   - 访问：https://adoptium.net/temurin/releases/
   - 选择：Java 17 (LTS)
   - 平台：Windows x64
   - 下载 `.msi` 安装包

2. **安装 Java 17**
   - 运行安装包
   - 记住安装路径（例如：`C:\Program Files\Eclipse Adoptium\jdk-17.0.9.9-hotspot\`）

3. **设置 JAVA_HOME**
   ```bash
   # 临时设置（当前终端）
   set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.9.9-hotspot
   set PATH=%JAVA_HOME%\bin;%PATH%
   
   # 验证
   java -version
   ```

4. **重新构建**
   ```bash
   cd android
   .\gradlew.bat clean
   .\gradlew.bat assembleRelease
   cd ..
   ```

---

### 方案 3：使用 Gradle Wrapper 指定 Java 版本

**修改 `android/gradle.properties`**：

```properties
# 添加这一行
org.gradle.java.home=C:\\Program Files\\Eclipse Adoptium\\jdk-17.0.9.9-hotspot
```

然后重新构建：
```bash
cd android
.\gradlew.bat assembleRelease
cd ..
```

---

## 🚀 推荐流程

### 最快方案：EAS Build

```bash
# 一键构建
eas build --profile preview --platform android --non-interactive
```

等待 10-15 分钟后，EAS 会提供下载链接。

---

## 📦 构建完成后

APK 位置：
- **本地构建**：`android/app/build/outputs/apk/release/app-release.apk`
- **EAS Build**：通过 EAS 提供的下载链接

重命名为：`anfudao-mock-v1.0.0.apk`

---

## 🎯 当前状态

- ✅ Mock 模式已启用
- ✅ Android bundle 已导出（4.98 MB）
- ✅ 所有依赖已安装
- ⚠️ 需要 Java 17 或使用 EAS Build

---

## 💡 建议

**立即使用 EAS Build**，避免本地环境配置问题：

```bash
eas build --profile preview --platform android
```

这是最简单、最快速的方案！
