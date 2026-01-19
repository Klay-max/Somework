# 🔧 Android 构建错误修复

## ✅ 已修复的问题

### 问题描述
Android Studio 构建失败，显示以下错误：
```
Android resource linking failed
- Android resource linking failed :23
- Android resource linking failed :23
- Android resource linking failed
```

### 根本原因
1. **缺少应用图标资源**：AndroidManifest.xml 引用了 `@mipmap/ic_launcher` 和 `@mipmap/ic_launcher_round`，但这些资源文件不存在
2. **HTTP 流量被阻止**：`usesCleartextTraffic="false"` 阻止了连接到本地 HTTP 后端

---

## 🛠️ 修复方案

### 修复 1：使用系统默认图标

**修改前**：
```xml
android:icon="@mipmap/ic_launcher"
android:roundIcon="@mipmap/ic_launcher_round"
android:usesCleartextTraffic="false"
```

**修改后**：
```xml
android:icon="@android:drawable/sym_def_app_icon"
android:roundIcon="@android:drawable/sym_def_app_icon"
android:usesCleartextTraffic="true"
```

**说明**：
- 使用 Android 系统内置的默认图标，避免资源缺失错误
- 允许 HTTP 流量，以便连接到本地 Mock 后端（http://10.0.2.2:8000）

### 修复 2：创建 mipmap 目录

虽然现在使用系统图标，但为了项目完整性，已创建以下目录：
- `android/app/src/main/res/mipmap-mdpi/`
- `android/app/src/main/res/mipmap-hdpi/`
- `android/app/src/main/res/mipmap-xhdpi/`
- `android/app/src/main/res/mipmap-xxhdpi/`
- `android/app/src/main/res/mipmap-xxxhdpi/`

---

## 📋 下一步操作

### 1. 在 Android Studio 中重新同步

1. 点击顶部的 **"Sync Project with Gradle Files"** 按钮
2. 或者：File → Sync Project with Gradle Files
3. 等待同步完成

### 2. 清理并重新构建

1. 点击：Build → Clean Project
2. 等待清理完成
3. 点击：Build → Rebuild Project
4. 等待构建完成

### 3. 运行应用

1. 确保模拟器已启动
2. 点击绿色的 ▶️ Run 按钮
3. 应用应该能成功安装并运行

---

## 🎨 可选：添加自定义应用图标

如果你想使用自定义图标而不是系统默认图标：

### 方法 1：使用 Android Studio 的 Image Asset Studio

1. 右键点击 `res` 文件夹
2. 选择：New → Image Asset
3. 选择图标类型：Launcher Icons (Adaptive and Legacy)
4. 上传你的图标图片（推荐 512x512 PNG）
5. 点击 "Next" 和 "Finish"
6. Android Studio 会自动生成所有尺寸的图标

### 方法 2：手动创建图标

为每个 mipmap 目录创建对应尺寸的图标：

- `mipmap-mdpi/ic_launcher.png` (48x48)
- `mipmap-hdpi/ic_launcher.png` (72x72)
- `mipmap-xhdpi/ic_launcher.png` (96x96)
- `mipmap-xxhdpi/ic_launcher.png` (144x144)
- `mipmap-xxxhdpi/ic_launcher.png` (192x192)

然后修改 AndroidManifest.xml：
```xml
android:icon="@mipmap/ic_launcher"
android:roundIcon="@mipmap/ic_launcher_round"
```

---

## 🔍 验证修复

构建成功后，你应该看到：

1. **Build Output** 窗口显示：
   ```
   BUILD SUCCESSFUL in Xs
   ```

2. **没有红色错误提示**

3. **应用可以正常安装到模拟器**

---

## 📝 关于 usesCleartextTraffic

### 为什么需要设置为 true？

从 Android 9 (API 28) 开始，默认情况下应用不允许使用明文 HTTP 流量，只允许 HTTPS。

在我们的 Mock 测试环境中：
- 后端运行在 `http://localhost:8000`（HTTP，不是 HTTPS）
- 模拟器需要通过 `http://10.0.2.2:8000` 访问
- 因此必须允许 HTTP 流量

### 生产环境注意事项

⚠️ **重要**：在发布到生产环境时，应该：
1. 使用 HTTPS 后端
2. 将 `usesCleartextTraffic` 改回 `false`
3. 或者使用 Network Security Configuration 只允许特定域名使用 HTTP

---

## 🎯 测试清单

修复完成后，测试以下功能：

- [ ] 应用成功构建
- [ ] 应用成功安装到模拟器
- [ ] 应用图标显示（系统默认图标）
- [ ] 应用可以启动
- [ ] 可以连接到 Mock 后端
- [ ] 注册/登录功能正常
- [ ] 可以上传照片

---

## 💡 提示

- 系统默认图标是临时解决方案，适合开发和测试
- 发布前建议使用 Image Asset Studio 创建专业的应用图标
- 如果遇到其他构建错误，查看 Build Output 窗口的详细信息
- 使用 Logcat 查看运行时日志

---

**修复完成！现在可以继续测试应用了。** 🚀
