# 🚀 项目复刻检查清单

这是一个快速参考清单，帮助你在新电脑上快速搭建项目环境。

---

## ✅ 第一步：安装必需软件（按顺序）

### 1. JDK 17
- [ ] 下载并安装 JDK 17
- [ ] 验证安装：打开命令行，输入 `java -version`
- [ ] 应该显示：`java version "17.x.x"`

### 2. PostgreSQL 18
- [ ] 下载并安装 PostgreSQL 18
- [ ] 记录你设置的密码：`__________`
- [ ] 安装 pgAdmin（可选，但推荐）
- [ ] 验证安装：打开 pgAdmin，能看到 PostgreSQL 18 服务器

### 3. IntelliJ IDEA
- [ ] 下载并安装 IntelliJ IDEA（Community 或 Ultimate）
- [ ] 首次启动，确保 Kotlin 插件已启用

### 4. Android Studio
- [ ] 下载并安装 Android Studio（最新稳定版）
- [ ] 首次启动，完成 SDK 安装向导
- [ ] 确保安装了：
  - [ ] Android SDK Platform 34
  - [ ] Android SDK Build-Tools
  - [ ] Android Emulator
  - [ ] Android SDK Platform-Tools

### 5. Git（可选）
- [ ] 如果需要从 Git 仓库克隆项目，安装 Git

---

## ✅ 第二步：准备项目文件

### 选项 A：复制文件夹
- [ ] 将整个 `project-root-learning-machine` 文件夹复制到新电脑
- [ ] 确保所有子文件夹都完整复制：
  - [ ] backend/
  - [ ] android-app/
  - [ ] web-admin/
  - [ ] .kiro/
  - [ ] 所有 .md 文档

### 选项 B：从 Git 克隆
- [ ] 打开命令行
- [ ] 执行：`git clone <你的仓库地址>`

---

## ✅ 第三步：配置数据库

### 1. 创建数据库
- [ ] 打开 pgAdmin
- [ ] 右键 "Databases" → "Create" → "Database"
- [ ] 数据库名：`learningapp`
- [ ] 点击 "Save"

### 2. 修改后端配置
- [ ] 打开文件：`backend/src/main/resources/application.yml`
- [ ] 找到这一行：`password: klay9873210`
- [ ] 改成你的 PostgreSQL 密码：`password: 你的密码`
- [ ] 保存文件

---

## ✅ 第四步：启动后端

### 1. 打开项目
- [ ] 启动 IntelliJ IDEA
- [ ] File → Open
- [ ] 选择 `backend` 文件夹（不是整个项目，只选 backend）
- [ ] 点击 "OK"

### 2. 等待 Gradle 同步
- [ ] 右下角会显示 "Gradle sync in progress..."
- [ ] 首次同步需要 5-10 分钟（下载依赖）
- [ ] 等待显示 "Gradle sync finished"

### 3. 配置 JDK（如果需要）
- [ ] File → Project Structure → Project
- [ ] SDK 选择 JDK 17
- [ ] 如果没有，点击 "Add SDK" → "Download JDK" → 选择版本 17

### 4. 运行后端
- [ ] 在左侧项目树中找到：
  ```
  backend/src/main/kotlin/com/learningapp/LearningAppApplication.kt
  ```
- [ ] 右键该文件 → "Run 'LearningAppApplicationKt'"
- [ ] 等待控制台显示：`Started LearningAppApplication in X.XXX seconds`

### 5. 验证后端
- [ ] 打开浏览器
- [ ] 访问：`http://localhost:8080/actuator/health`
- [ ] 应该看到：`{"status":"DOWN"}` 或 `{"status":"UP"}`
- [ ] 看到任何 JSON 响应都说明后端启动成功！

---

## ✅ 第五步：运行 Android 应用

### 1. 打开项目
- [ ] 启动 Android Studio
- [ ] File → Open
- [ ] 选择 `android-app` 文件夹
- [ ] 点击 "OK"

### 2. 等待 Gradle 同步
- [ ] 底部会显示 "Gradle sync in progress..."
- [ ] 首次同步需要 10-20 分钟（下载依赖）
- [ ] 等待显示 "Gradle sync finished" 或 "BUILD SUCCESSFUL"

### 3. 处理路径问题（如果路径包含中文）
- [ ] 打开文件：`android-app/gradle.properties`
- [ ] 确保包含这一行：`android.overridePathCheck=true`
- [ ] 如果没有，添加这一行并保存

### 4. 创建模拟器
- [ ] 点击工具栏的 "Device Manager" 图标（手机图标）
- [ ] 点击 "Create Device"
- [ ] 选择 "Pixel 5"
- [ ] 点击 "Next"
- [ ] 选择系统镜像：Android 13 (API 33) 或 Android 14 (API 34)
- [ ] 如果需要下载，点击下载按钮，等待完成
- [ ] 点击 "Next" → "Finish"

### 5. 启动模拟器
- [ ] 在 Device Manager 中，点击模拟器旁边的 ▶️ 按钮
- [ ] 等待模拟器完全启动（看到主屏幕）

### 6. 运行应用
- [ ] 确保工具栏的设备下拉菜单中选中了你的模拟器
- [ ] 点击绿色的 Run 按钮 ▶️（或按 Shift+F10）
- [ ] 等待应用安装到模拟器（1-2 分钟）
- [ ] 应用会自动启动

### 7. 测试应用
- [ ] 应该看到"课程列表"界面
- [ ] 应该显示 3 个课程：
  - [ ] Kotlin编程入门
  - [ ] Android开发实战
  - [ ] Spring Boot微服务
- [ ] 点击任意课程，能查看详情

---

## ✅ 第六步：验证完整功能

### 后端验证
- [ ] 浏览器访问：`http://localhost:8080/actuator/health` ✅
- [ ] IntelliJ IDEA 控制台没有错误日志 ✅

### Android 应用验证
- [ ] 课程列表正常显示 ✅
- [ ] 点击课程能查看详情 ✅
- [ ] 点击"开始学习"能进入学习界面 ✅

---

## 🎉 完成！

如果所有步骤都打勾了，恭喜你成功复刻了项目！

---

## ❌ 遇到问题？

### 后端启动失败
**症状**：IntelliJ IDEA 控制台显示错误

**常见原因和解决方案**：

1. **数据库连接失败**
   - 检查 PostgreSQL 是否正在运行
   - 检查 `application.yml` 中的密码是否正确
   - 检查数据库 `learningapp` 是否已创建

2. **端口被占用**
   - 错误信息：`Port 8080 is already in use`
   - 解决：关闭占用 8080 端口的程序，或修改 `application.yml` 中的端口号

3. **JDK 版本不对**
   - 确保使用 JDK 17
   - File → Project Structure → Project → SDK 选择 JDK 17

---

### Android Gradle 同步失败
**症状**：Android Studio 底部显示 "Gradle sync failed"

**常见原因和解决方案**：

1. **网络问题**
   - 检查网络连接
   - 如果在中国，可能需要配置镜像

2. **路径包含中文**
   - 在 `android-app/gradle.properties` 中添加：
     ```
     android.overridePathCheck=true
     ```

3. **JDK 版本不对**
   - File → Settings → Build, Execution, Deployment → Build Tools → Gradle
   - Gradle JDK 选择 JDK 17

---

### Android 应用无法连接后端
**症状**：应用显示"获取课程列表失败"

**常见原因和解决方案**：

1. **后端未启动**
   - 确保 IntelliJ IDEA 中后端正在运行
   - 浏览器访问 `http://localhost:8080/actuator/health` 验证

2. **网络配置错误**
   - 检查 `android-app/app/src/main/java/com/learningapp/data/remote/NetworkModule.kt`
   - 确保 BASE_URL 是：`http://10.0.2.2:8080/`
   - （10.0.2.2 是模拟器访问主机 localhost 的地址）

3. **API 权限问题**
   - 检查 `backend/src/main/kotlin/com/learningapp/config/SecurityConfig.kt`
   - 确保包含：`.requestMatchers("/api/courses/**").permitAll()`

---

## 📋 快速命令参考

### 验证 Java 安装
```bash
java -version
```

### 验证 PostgreSQL 安装（Windows）
```bash
psql --version
```

### 创建数据库（在 psql 中）
```sql
CREATE DATABASE learningapp;
```

### 查看数据库列表（在 psql 中）
```sql
\l
```

---

## 📞 需要帮助？

如果按照清单操作后仍有问题：

1. 查看 `PROJECT_ARCHITECTURE.md` 了解详细架构
2. 查看 `QUICK_START.md` 了解快速开始步骤
3. 查看 `开始测试.md` 了解测试步骤
4. 检查 IDE 控制台的完整错误日志
5. 检查 Android Logcat 的错误信息

---

**祝你成功复刻项目！** 🚀
