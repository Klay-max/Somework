# Android Studio 构建指南

## 问题总结

经过多次尝试，我们已经解决了以下问题：

1. ✅ **KAPT JDK 兼容性** - 已迁移到 KSP
2. ✅ **Hilt 插件冲突** - 已移除 Hilt Gradle 插件，直接使用 KSP
3. ✅ **路径中文字符** - 创建了虚拟驱动器 P:
4. ✅ **AuthRepository 依赖注入** - 已添加到 RepositoryModule

## 当前状态

命令行构建仍然遇到路径编码问题，即使使用虚拟驱动器 P:，Gradle 仍然读取原始中文路径。

**最佳解决方案：在 Android Studio 中构建**

## 在 Android Studio 中构建步骤

### 步骤 1：打开 Android Studio

1. 启动 Android Studio
2. 如果有欢迎界面，点击 "Open"
3. 如果已经打开了其他项目，点击 File → Close Project 回到欢迎界面

### 步骤 2：打开项目

**重要：选择虚拟驱动器路径**

1. 在文件选择器中，导航到 `P:\android`
2. 选择 `android` 文件夹
3. 点击 "OK"

**不要选择原始路径** `D:\桌面文件\作品集\project-root-ai evaluation\android`

### 步骤 3：等待 Gradle 同步

1. Android Studio 会自动开始 Gradle 同步
2. 你会在底部看到 "Gradle Sync" 进度条
3. 等待同步完成（可能需要几分钟，因为要下载依赖）

### 步骤 4：检查同步结果

**如果同步成功：**
- 底部会显示 "Gradle sync finished"
- 项目结构会在左侧显示

**如果同步失败：**
- 查看 "Build" 窗口中的错误信息
- 常见问题：
  - SDK 路径问题 → File → Project Structure → SDK Location
  - JDK 版本问题 → File → Settings → Build Tools → Gradle → Gradle JDK

### 步骤 5：构建项目

1. 点击菜单 Build → Make Project
2. 或者按快捷键 Ctrl+F9
3. 等待构建完成

### 步骤 6：运行应用

1. 确保已启动 Android 模拟器或连接了真机
2. 点击绿色运行按钮（或按 Shift+F10）
3. 选择目标设备
4. 应用会自动构建、安装并启动

## 配置 Mock 后端连接

应用已配置为连接 Mock 后端：

- **模拟器**：`http://10.0.2.2:8000/`（已配置）
- **真机**：需要修改为你的电脑 IP 地址

### 如果使用真机测试

1. 获取你的电脑 IP 地址：
   ```cmd
   ipconfig
   ```
   查找 "IPv4 地址"，例如 `192.168.1.100`

2. 修改 `android/app/build.gradle.kts`：
   ```kotlin
   buildConfigField("String", "API_BASE_URL", "\"http://192.168.1.100:8000/\"")
   ```

3. 重新同步 Gradle

## Mock 后端状态

✅ Mock 后端正在运行：http://localhost:8000

- 所有外部服务使用 Mock 实现
- 验证码固定为 "123456"
- 无需配置任何 API 密钥

## 常见问题

### Q: Android Studio 显示 "SDK not found"

**A:** 配置 Android SDK 路径
1. File → Project Structure
2. SDK Location → Android SDK Location
3. 选择你的 Android SDK 路径（通常在 `C:\Users\<用户名>\AppData\Local\Android\Sdk`）

### Q: Gradle 同步失败，提示 JDK 版本问题

**A:** 配置正确的 JDK
1. File → Settings
2. Build, Execution, Deployment → Build Tools → Gradle
3. Gradle JDK → 选择 JDK 17 或 JDK 21
4. 如果没有，点击 "Download JDK" 下载

### Q: 构建成功但无法运行

**A:** 检查模拟器/设备
1. Tools → Device Manager
2. 创建或启动一个 Android 模拟器
3. 或者通过 USB 连接真机并启用 USB 调试

### Q: 应用无法连接后端

**A:** 检查后端是否运行
1. 打开浏览器访问 http://localhost:8000/docs
2. 如果无法访问，重新启动 Mock 后端：
   ```cmd
   docker-compose -f docker-compose.mock.yml up -d
   ```

## 为什么 Android Studio 更好？

1. **智能路径处理** - IDE 会正确处理路径编码问题
2. **自动依赖管理** - 自动下载和配置依赖
3. **更好的错误提示** - 实时显示编译错误和警告
4. **集成调试** - 可以直接调试应用
5. **模拟器集成** - 一键启动和部署

## 下一步

一旦在 Android Studio 中成功构建并运行应用：

1. 测试注册功能（验证码：123456）
2. 测试登录功能
3. 测试拍照上传试卷
4. 测试查看分析报告

祝你成功！🎉
