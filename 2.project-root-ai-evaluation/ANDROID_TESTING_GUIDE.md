# 📱 Android 应用测试指南

## ✅ 准备工作检查

在开始之前，确认以下准备工作已完成：

- ✅ Mock 后端已启动（http://localhost:8000）
- ✅ API 地址已配置（`android/app/build.gradle.kts` 中的 `API_BASE_URL`）
- ⏳ 需要安装 Android Studio
- ⏳ 需要创建 Android 模拟器或连接真机

---

## 📋 步骤 1：验证 Mock 后端运行状态

在开始测试 Android 应用之前，先确认后端正常运行：

### 1.1 检查服务状态

```bash
docker-compose --env-file .env.mock -f docker-compose.mock.yml ps
```

应该看到所有服务都是 `Up` 状态：
- `postgres` (端口 5432)
- `redis` (端口 6379)
- `backend` (端口 8000)
- `celery_worker`

### 1.2 测试健康检查

打开浏览器访问：**http://localhost:8000/health**

应该看到：
```json
{"status":"healthy","version":"1.0.0"}
```

### 1.3 查看 API 文档

打开浏览器访问：**http://localhost:8000/docs**

应该能看到完整的 Swagger UI 界面。

---

## 📋 步骤 2：安装 Android Studio

如果还没有安装 Android Studio：

### Windows 用户

1. 访问：https://developer.android.com/studio
2. 下载 Android Studio
3. 运行安装程序
4. 选择 "Standard" 安装类型
5. 等待下载完成（约 2-3 GB）

### 安装完成后

1. 启动 Android Studio
2. 完成初始设置向导
3. 等待 SDK 组件下载完成

---

## 📋 步骤 3：打开 Android 项目

### 3.1 打开项目

1. 启动 Android Studio
2. 选择 **"Open"** 或 **"Open an Existing Project"**
3. 导航到你的项目目录
4. 选择 **`android`** 文件夹（不是根目录！）
5. 点击 **"OK"**

### 3.2 等待 Gradle 同步

首次打开项目时，Android Studio 会自动同步 Gradle：

1. 底部会显示 "Syncing..."
2. 等待进度条完成（可能需要 5-10 分钟）
3. 如果出现错误，点击 "Sync Now" 重试

**常见问题**：
- 如果提示 JDK 版本问题：
  - File → Settings → Build, Execution, Deployment → Gradle
  - 选择 "Gradle JDK" 为 JDK 17
  - 点击 "Apply" 和 "OK"

### 3.3 确认同步成功

同步成功后，你应该能看到：
- 左侧项目结构树
- 没有红色错误提示
- 底部状态栏显示 "Gradle sync finished"

---

## 📋 步骤 4：创建 Android 模拟器（推荐）

### 4.1 打开 Device Manager

1. 点击顶部工具栏的 **"Device Manager"** 图标
2. 或者：Tools → Device Manager

### 4.2 创建虚拟设备

1. 点击 **"Create Device"**
2. 选择设备类型：
   - 分类：**Phone**
   - 设备：**Pixel 6** 或 **Pixel 5**（推荐）
3. 点击 **"Next"**

### 4.3 选择系统镜像

1. 选择系统镜像：
   - 推荐：**API 34** (Android 14)
   - 或者：**API 33** (Android 13)
2. 如果镜像旁边有 "Download" 链接，点击下载
3. 等待下载完成
4. 点击 **"Next"**

### 4.4 完成创建

1. 设备名称：保持默认或自定义
2. 点击 **"Finish"**
3. 模拟器创建完成！

### 4.5 启动模拟器

1. 在 Device Manager 中找到刚创建的设备
2. 点击 ▶️ 播放按钮启动
3. 等待模拟器启动（首次启动可能需要 2-3 分钟）
4. 看到 Android 主屏幕表示启动成功

---

## 📋 步骤 5：运行 Android 应用

### 5.1 选择运行设备

1. 确保模拟器已启动
2. 在 Android Studio 顶部工具栏，找到设备选择器
3. 选择你刚启动的模拟器（例如 "Pixel 6 API 34"）

### 5.2 运行应用

1. 点击绿色的 **▶️ Run** 按钮
2. 或者按快捷键：**Shift + F10**
3. 等待应用编译和安装（首次可能需要 3-5 分钟）

### 5.3 确认应用启动

应用启动后，你应该看到：
- 模拟器中显示应用界面
- 登录/注册页面
- Material 3 设计风格

---

## 📋 步骤 6：测试完整功能流程

### 6.1 用户注册

1. 在应用中点击 **"注册"** 或 **"Register"**
2. 输入手机号：`13800138000`（任意 11 位数字）
3. 点击 **"发送验证码"**
4. 输入验证码：`123456`（Mock 模式固定验证码）
5. 设置密码：`test123456`（至少 8 位）
6. 点击 **"注册"**

**预期结果**：
- 注册成功
- 自动跳转到主页面

### 6.2 用户登录（如果已注册）

1. 输入手机号：`13800138000`
2. 输入密码：`test123456`
3. 点击 **"登录"**

**预期结果**：
- 登录成功
- 跳转到主页面

### 6.3 拍照上传试卷

#### 方法 1：使用相机拍照

1. 点击 **"拍照"** 按钮
2. 允许相机权限（首次使用）
3. 模拟器会显示虚拟相机画面
4. 点击拍照按钮
5. 确认照片
6. 等待上传

#### 方法 2：从相册选择

1. 点击 **"从相册选择"** 按钮
2. 允许存储权限（首次使用）
3. 选择一张图片
4. 确认选择
5. 等待上传

**预期结果**：
- 显示上传进度
- 上传成功后自动跳转到历史记录

### 6.4 查看处理状态

上传后，应用会自动轮询处理状态：

1. 显示 **"处理中..."** 状态
2. 每 5 秒更新一次状态
3. 状态变化：
   - `pending` → 等待处理
   - `processing` → 正在处理
   - `completed` → 处理完成
   - `failed` → 处理失败

**预期结果**：
- 状态实时更新
- 处理完成后可以查看报告

### 6.5 查看分析报告

1. 在历史记录列表中，点击已完成的试卷
2. 应用会加载报告详情页
3. 使用 WebView 显示 HTML 报告

**预期结果**：
- 显示完整的 4 页报告
- 包含 Mock 生成的分析数据
- 可以滚动查看所有内容

### 6.6 分享报告

在报告详情页：

1. 点击 **"分享"** 按钮
2. 选择分享方式：
   - **邮件分享**：打开邮件应用
   - **通用分享**：显示系统分享菜单
   - **复制链接**：复制报告 URL

**预期结果**：
- 分享功能正常工作
- 可以通过不同方式分享报告

### 6.7 删除历史记录

1. 在历史记录列表中，长按某个试卷
2. 或者点击删除按钮
3. 确认删除

**预期结果**：
- 试卷从列表中移除
- 软删除（30 天内可恢复）

---

## 📋 步骤 7：测试离线功能

### 7.1 测试离线上传队列

1. 关闭 Mock 后端：
   ```bash
   docker-compose --env-file .env.mock -f docker-compose.mock.yml stop
   ```

2. 在应用中尝试上传照片
3. 应用会将上传任务加入离线队列

4. 重新启动 Mock 后端：
   ```bash
   docker-compose --env-file .env.mock -f docker-compose.mock.yml start
   ```

5. 应用会自动重试上传

**预期结果**：
- 离线时显示 "等待网络连接"
- 网络恢复后自动上传
- WorkManager 后台任务正常工作

---

## 🎭 Mock 模式特点

在 Mock 模式下，你会看到：

### OCR 识别结果
返回预设的数学试卷文本：
```
一、选择题（每题5分，共30分）
1. 下列函数中，在区间(0,+∞)上单调递增的是（）
A. y = -x + 1
B. y = x²
C. y = 2^x
D. y = log₀.₅x
...
```

### AI 分析结果
- 随机生成的知识点标注
- 随机生成的难度评估
- 随机生成的错误原因分类
- 随机生成的五维能力评分

### 验证码
- 所有手机号的验证码都是 `123456`
- 无需真实短信服务

### 图片存储
- 文件保存在 Docker 容器的本地卷中
- 不需要阿里云 OSS

---

## 🔧 常见问题排查

### Q1: 应用无法连接到后端

**症状**：
- 登录/注册失败
- 显示网络错误
- 无法上传照片

**解决方法**：

1. **检查后端是否运行**：
   ```bash
   docker-compose --env-file .env.mock -f docker-compose.mock.yml ps
   ```

2. **检查 API 地址配置**：
   - 模拟器：应该是 `http://10.0.2.2:8000/`
   - 真机：应该是 `http://你的电脑IP:8000/`

3. **测试后端连接**：
   - 在浏览器访问：http://localhost:8000/health
   - 应该返回：`{"status":"healthy","version":"1.0.0"}`

4. **检查防火墙**：
   - Windows：控制面板 → 防火墙 → 允许应用通过防火墙
   - 确保 8000 端口未被阻止

5. **重新编译应用**：
   - Build → Clean Project
   - Build → Rebuild Project
   - 重新运行应用

### Q2: Gradle 同步失败

**症状**：
- 显示 "Gradle sync failed"
- 红色错误提示
- 无法编译

**解决方法**：

1. **检查 JDK 版本**：
   - File → Settings → Build, Execution, Deployment → Gradle
   - 选择 "Gradle JDK" 为 JDK 17
   - 点击 "Apply"

2. **清理缓存**：
   - File → Invalidate Caches / Restart
   - 选择 "Invalidate and Restart"

3. **重新同步**：
   - File → Sync Project with Gradle Files

4. **检查网络连接**：
   - 确保可以访问 Maven Central
   - 如果在中国，可能需要配置镜像

### Q3: 模拟器启动失败

**症状**：
- 模拟器无法启动
- 显示错误消息
- 黑屏或卡住

**解决方法**：

1. **检查虚拟化是否启用**：
   - 进入 BIOS 设置
   - 启用 Intel VT-x 或 AMD-V
   - 重启电脑

2. **重新创建模拟器**：
   - Tools → Device Manager
   - 删除现有模拟器
   - 创建新的模拟器

3. **降低模拟器配置**：
   - 选择较低的 API 级别（如 API 30）
   - 减少 RAM 分配
   - 禁用硬件加速

### Q4: 相机权限被拒绝

**症状**：
- 点击拍照按钮无反应
- 显示权限错误

**解决方法**：

1. **手动授予权限**：
   - 模拟器：Settings → Apps → ExamAI → Permissions → Camera
   - 启用相机权限

2. **重新安装应用**：
   - 卸载应用
   - 重新运行

### Q5: 上传一直失败

**症状**：
- 上传进度卡住
- 显示上传失败
- 重试无效

**解决方法**：

1. **检查后端日志**：
   ```bash
   docker-compose --env-file .env.mock -f docker-compose.mock.yml logs backend
   ```

2. **检查图片大小**：
   - 确保图片 ≤ 10MB
   - 格式为 JPG/PNG

3. **重启后端服务**：
   ```bash
   docker-compose --env-file .env.mock -f docker-compose.mock.yml restart backend
   ```

4. **清除应用数据**：
   - 模拟器：Settings → Apps → ExamAI → Storage → Clear Data
   - 重新登录

---

## 📊 测试检查清单

完成以下测试项目，确保应用功能正常：

### 用户认证
- [ ] 用户注册（手机号 + 验证码 + 密码）
- [ ] 用户登录（手机号 + 密码）
- [ ] Token 自动保存
- [ ] Token 过期处理
- [ ] 自动登录

### 拍照上传
- [ ] 相机权限请求
- [ ] 拍照功能
- [ ] 图库选择
- [ ] 图片预览
- [ ] 上传进度显示
- [ ] 上传成功/失败提示

### 报告查看
- [ ] 历史记录列表
- [ ] 分页加载
- [ ] 下拉刷新
- [ ] 报告详情页
- [ ] WebView 显示 HTML
- [ ] 报告分享（邮件、通用、复制链接）

### 状态跟踪
- [ ] 状态轮询（5 秒间隔）
- [ ] 实时进度显示
- [ ] 处理完成通知

### 离线功能
- [ ] 离线上传队列
- [ ] 网络恢复自动上传
- [ ] 本地缓存（7 天）

### 错误处理
- [ ] 网络错误提示
- [ ] 服务器错误提示
- [ ] 重试机制
- [ ] 友好的错误消息

---

## 🎯 下一步

测试完成后，你可以：

### 1. 继续使用 Mock 模式
- 完全免费
- 适合开发和演示
- 无需任何 API 密钥

### 2. 切换到真实 API
- 申请百度 OCR、DeepSeek 等 API 密钥
- 修改 `.env` 文件：`USE_MOCK_SERVICES=false`
- 重启后端服务
- 获得真实的识别和分析结果

### 3. 部署到云端
- 按照 `AWS_EC2_DEPLOYMENT_GUIDE.md` 部署到 AWS
- 修改 Android 应用的 `API_BASE_URL` 为云端地址
- 在手机上随时随地使用

### 4. 发布到应用商店
- 配置应用签名
- 生成发布版 APK/AAB
- 准备应用商店资料
- 提交到 Google Play

---

## 💡 提示

- Mock 模式完全免费，不需要任何外部 API
- 验证码固定为 `123456`，方便测试
- 所有数据都存储在本地 Docker 卷中
- 可以随时在 Mock 和真实 API 之间切换
- 模拟器比真机更容易调试
- 使用 Android Studio 的 Logcat 查看日志

---

## 📞 需要帮助？

如果遇到问题：

1. 查看本文档的 "常见问题排查" 部分
2. 检查后端日志：
   ```bash
   docker-compose --env-file .env.mock -f docker-compose.mock.yml logs -f backend
   ```
3. 查看 Android Studio 的 Logcat 日志
4. 参考 `ANDROID_MOCK_SETUP_GUIDE.md` 文档

---

**祝你测试愉快！** 🚀
