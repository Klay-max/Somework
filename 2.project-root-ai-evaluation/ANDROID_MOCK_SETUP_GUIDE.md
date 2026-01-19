# 📱 Android 应用连接 Mock 后端配置指南

## 当前状态

✅ Mock 后端已成功启动在 `http://localhost:8000`  
✅ Android 应用代码已完成  
⏳ 需要配置 Android 应用连接到本地后端

---

## 🎯 配置步骤

### 步骤 1：修改 API 地址

已自动修改 `android/app/build.gradle.kts` 文件中的 API_BASE_URL：

**修改前**：
```kotlin
buildConfigField("String", "API_BASE_URL", "\"https://api.examai.com/\"")
```

**修改后（Android 模拟器）**：
```kotlin
buildConfigField("String", "API_BASE_URL", "\"http://10.0.2.2:8000/\"")
```

**说明**：
- `10.0.2.2` 是 Android 模拟器访问宿主机 localhost 的特殊 IP 地址
- 如果使用真机测试，需要改成你电脑的实际 IP 地址（见下方）

---

### 步骤 2：查看你的电脑 IP（真机测试需要）

如果你要在真机上测试，需要先查看你的电脑 IP：

**Windows 用户**：
```bash
ipconfig
```
找到 "IPv4 地址"，例如：`192.168.1.100`

**Mac/Linux 用户**：
```bash
ifconfig
```
找到 en0 或 wlan0 的 inet 地址

然后修改为：
```kotlin
buildConfigField("String", "API_BASE_URL", "\"http://你的IP:8000/\"")
```

例如：
```kotlin
buildConfigField("String", "API_BASE_URL", "\"http://192.168.1.100:8000/\"")
```

---

### 步骤 3：在 Android Studio 中打开项目

1. 打开 Android Studio
2. 选择 "Open an Existing Project"
3. 导航到项目的 `android/` 目录
4. 点击 "OK" 打开项目

---

### 步骤 4：等待 Gradle 同步

首次打开项目时，Android Studio 会自动同步 Gradle 依赖：

1. 等待底部状态栏显示 "Gradle sync finished"
2. 如果遇到错误，点击 "Sync Now" 重新同步
3. 确保所有依赖都下载完成

---

### 步骤 5：运行应用

#### 使用 Android 模拟器（推荐）

1. 点击顶部工具栏的 "Device Manager"
2. 创建一个新的虚拟设备（如果还没有）：
   - 选择 "Create Device"
   - 选择 "Phone" → "Pixel 6"
   - 选择系统镜像（推荐 API 34）
   - 点击 "Finish"
3. 启动模拟器
4. 点击绿色的 "Run" 按钮（或按 Shift + F10）

#### 使用真机

1. 在手机上启用开发者选项：
   - 设置 → 关于手机 → 连续点击 "版本号" 7 次
2. 启用 USB 调试：
   - 设置 → 开发者选项 → USB 调试
3. 用 USB 线连接手机到电脑
4. 在手机上允许 USB 调试授权
5. 在 Android Studio 中选择你的设备
6. 点击绿色的 "Run" 按钮

---

## 🧪 测试流程

### 1. 注册新用户

1. 打开应用，点击 "注册"
2. 输入手机号：`13800138000`（任意 11 位数字）
3. 点击 "发送验证码"
4. 输入验证码：`123456`（Mock 模式固定验证码）
5. 设置密码：`test123456`
6. 点击 "注册"

### 2. 登录

1. 输入手机号：`13800138000`
2. 输入密码：`test123456`
3. 点击 "登录"

### 3. 拍照上传试卷

1. 点击 "拍照" 按钮
2. 允许相机权限
3. 拍摄一张试卷照片（或任意照片）
4. 确认照片
5. 等待上传完成

### 4. 查看分析报告

1. 上传完成后，自动跳转到历史记录
2. 点击刚上传的试卷
3. 查看 Mock 生成的分析报告

---

## 🎭 Mock 模式特点

在 Mock 模式下，你会看到：

1. **OCR 识别**：返回预设的模拟试卷文本（数学题）
2. **AI 分析**：返回随机生成的分析结果
3. **验证码**：所有手机号的验证码都是 `123456`
4. **图片存储**：文件保存在 Docker 容器的本地卷中

---

## 🔧 常见问题

### Q1: 应用无法连接到后端？

**检查清单**：
- ✅ Mock 后端是否正在运行？
  ```bash
  docker-compose --env-file .env.mock -f docker-compose.mock.yml ps
  ```
- ✅ API 地址是否正确？
  - 模拟器：`http://10.0.2.2:8000/`
  - 真机：`http://你的电脑IP:8000/`
- ✅ 防火墙是否允许 8000 端口？
  - Windows：控制面板 → 防火墙 → 允许应用通过防火墙
  - Mac：系统偏好设置 → 安全性与隐私 → 防火墙选项

### Q2: Gradle 同步失败？

**解决方法**：
1. 检查网络连接
2. 在 Android Studio 中：
   - File → Settings → Build, Execution, Deployment → Gradle
   - 选择 "Gradle JDK" 为 JDK 17
3. 点击 "Sync Project with Gradle Files"

### Q3: 模拟器启动失败？

**解决方法**：
1. 确保已启用虚拟化（BIOS 中的 VT-x 或 AMD-V）
2. 在 Android Studio 中：
   - Tools → Device Manager
   - 删除现有设备，重新创建

### Q4: 真机连接不上后端？

**解决方法**：
1. 确保手机和电脑在同一 Wi-Fi 网络
2. 查看电脑 IP：`ipconfig`（Windows）或 `ifconfig`（Mac/Linux）
3. 修改 `build.gradle.kts` 中的 IP 地址
4. 重新编译应用

### Q5: 相机权限被拒绝？

**解决方法**：
1. 在手机设置中手动授予相机权限：
   - 设置 → 应用 → ExamAI → 权限 → 相机
2. 或者卸载应用重新安装

---

## 📝 下一步

测试完成后，你可以：

1. **继续使用 Mock 模式**：完全免费，适合开发和测试
2. **切换到真实 API**：
   - 获取百度 OCR、DeepSeek 等 API 密钥
   - 修改 `.env` 文件，设置 `USE_MOCK_SERVICES=false`
   - 重启后端服务
3. **部署到云端**：
   - 按照 `AWS_EC2_DEPLOYMENT_GUIDE.md` 部署到 AWS
   - 修改 Android 应用的 API_BASE_URL 为云端地址

---

## 💡 提示

- Mock 模式完全免费，不需要任何外部 API
- 验证码固定为 `123456`，方便测试
- 所有数据都存储在本地 Docker 卷中
- 可以随时在 Mock 和真实 API 之间切换

---

**祝你测试愉快！** 🚀

