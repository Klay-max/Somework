# Android 应用快速启动指南

## 前提条件

✅ **后端已启动**：Mock 后端正在 `http://localhost:8000` 运行
- 验证：访问 http://localhost:8000/docs 应该能看到 API 文档

## 启动 Android 应用

### 方法 1：使用 Android Studio（推荐）

1. **打开项目**
   ```
   用 Android Studio 打开 android 文件夹
   ```

2. **等待 Gradle 同步完成**
   - 首次打开会自动下载依赖，需要几分钟

3. **启动模拟器**
   - 点击工具栏的设备管理器图标
   - 选择或创建一个 Android 模拟器（推荐 Pixel 5 API 33+）
   - 点击启动

4. **运行应用**
   - 点击绿色的运行按钮（▶️）
   - 或按 `Shift + F10`

### 方法 2：使用命令行

```powershell
cd android
.\gradlew installDebug
```

## 使用 Mock 后端测试

### 1. 注册新用户

- 手机号：任意 11 位数字（如 `13800138000`）
- 验证码：**永远是 `123456`**（Mock 模式）
- 密码：任意密码（建议简单点，如 `Pass123`）
- 角色：选择"学生"

### 2. 登录

- 使用刚才注册的手机号和密码登录

### 3. 测试功能

所有功能都使用 Mock 数据：
- ✅ OCR 识别：返回模拟的文字识别结果
- ✅ AI 分析：返回模拟的试卷分析
- ✅ 报告生成：生成模拟的评估报告
- ✅ 历史记录：显示模拟数据

## 网络配置说明

### Android 模拟器
- 使用 `10.0.2.2:8000` 访问主机的 localhost:8000
- 已在 `build.gradle.kts` 中配置

### 真实设备（如果需要）
如果要在真实设备上测试：

1. 确保设备和电脑在同一 WiFi 网络
2. 修改 `android/app/build.gradle.kts`：
   ```kotlin
   buildConfigField("String", "API_BASE_URL", "\"http://192.168.2.28:8000/\"")
   ```
3. 重新编译应用

## 常见问题

### 1. 无法连接到后端
**检查清单**：
- ✅ 后端是否在运行？访问 http://localhost:8000/docs
- ✅ 模拟器是否启动？
- ✅ 防火墙是否阻止了 8000 端口？

### 2. 验证码错误
- Mock 模式下验证码永远是 `123456`
- 确保后端日志显示 "🎭 Using Mock SMS Service"

### 3. 编译错误
```powershell
cd android
.\gradlew clean
.\gradlew build
```

## 后端状态检查

```powershell
# 检查容器状态
docker ps

# 查看后端日志
docker logs exam_assessment_backend_mock --tail 50

# 测试 API
curl http://localhost:8000/health
```

## 下一步

现在你可以：
1. 🎯 测试完整的用户流程（注册 → 登录 → 拍照 → 上传 → 查看报告）
2. 📱 体验所有 UI 界面
3. 🔍 查看 Mock 数据的返回结果
4. 🐛 发现并报告任何问题

**提示**：所有外部 API 调用都被 Mock 了，完全免费，无需任何 API 密钥！
