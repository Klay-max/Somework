# 本地测试完整指南

## 问题诊断

根据你的错误信息，主要问题是：

### 问题 1：运行目录错误
```
C:\Users\WIN10>node local-api-server.js
Error: Cannot find module 'C:\Users\WIN10\local-api-server.js'
```

**原因：** 你在 `C:\Users\WIN10` 目录下运行命令，但项目文件在 `D:\桌面文件\project-root\2.project-root-ai-evaluation-pro`

### 问题 2：Expo 找不到项目
```
C:\Users\WIN10>npx expo start --web
ConfigError: Cannot determine the project's Expo SDK version
```

**原因：** 同样是目录错误

## 正确的启动方法

### 方法 A：使用批处理脚本（最简单）

1. 打开文件资源管理器
2. 导航到：`D:\桌面文件\project-root\2.project-root-ai-evaluation-pro`
3. 双击 `start-local-dev.bat` 文件
4. 会自动打开两个命令行窗口
5. 等待启动完成
6. 在 Expo 窗口中按 `w` 键打开浏览器

### 方法 B：手动启动（用于调试）

#### 步骤 1：打开第一个命令行窗口

1. 按 `Win + R` 打开运行对话框
2. 输入 `cmd` 并按回车
3. 在命令行中输入：
```cmd
cd /d D:\桌面文件\project-root\2.project-root-ai-evaluation-pro
node local-api-server.js
```

**成功标志：**
```
✓ 本地 API 服务器运行在 http://localhost:3001
✓ OCR 端点: http://localhost:3001/api/ocr

环境变量状态:
  ALICLOUD_ACCESS_KEY_ID: ✓ 已设置
  ALICLOUD_ACCESS_KEY_SECRET: ✓ 已设置

按 Ctrl+C 停止服务器
```

#### 步骤 2：打开第二个命令行窗口

1. 再次按 `Win + R` 打开运行对话框
2. 输入 `cmd` 并按回车
3. 在命令行中输入：
```cmd
cd /d D:\桌面文件\project-root\2.project-root-ai-evaluation-pro
npx expo start --web
```

**成功标志：**
```
Starting project at D:\桌面文件\project-root\2.project-root-ai-evaluation-pro

› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press w │ open web
› Press a │ open Android
› Press i │ open iOS simulator
```

#### 步骤 3：打开浏览器

在 Expo 窗口中按 `w` 键，或手动在浏览器中访问 `http://localhost:8081`

## 测试流程

### 1. 验证首页加载

浏览器应该显示：
- 黑色背景
- 青色（#00ffff）文字
- "VISION-CORE" 标题
- "启动视觉诊断" 按钮

### 2. 测试扫描功能

1. 点击 "启动视觉诊断"
2. 应该进入扫描页面
3. 点击虚线框选择图片（任意图片）
4. 点击 "开始扫描"

### 3. 观察处理过程

应该依次显示：
```
正在处理图像... (1/6)
正在识别答题卡... (2/6)
正在提取答案... (3/6)
正在评分... (4/6)
正在分析错题... (5/6)
正在生成学习路径... (6/6)
正在生成报告...
```

### 4. 查看报告页面

处理完成后应该自动跳转到报告页面，显示：
- 核心得分
- 能力分析雷达图
- 深度分析
- 知识点掌握
- 提分路径

## 调试方法

### 查看浏览器控制台

1. 按 `F12` 打开开发者工具
2. 切换到 "Console" 标签
3. 查看日志输出：

**正常的日志：**
```
[API Request] POST /ocr
正在处理图像... (1/6)
正在识别答题卡... (2/6)
[API Response] 200 OK
正在提取答案... (3/6)
...
准备导航到报告页面: report-1234567890
导航命令已发送
报告页面加载，参数: {id: "report-1234567890", hasData: true}
✓ 使用路由参数中的报告数据
```

**如果出现错误：**
- 红色的错误信息
- 网络请求失败
- 截图发给我

### 查看 API 服务器日志

在 "Local API Server" 窗口中查看：

**正常的日志：**
```
[API] Received OCR request
[OCR] 使用模拟数据（本地网络无法访问阿里云 API）
[API] OCR success!
```

**如果出现错误：**
- 复制错误信息发给我

### 查看 Expo 服务器日志

在 "Expo Dev Server" 窗口中查看：

**正常的日志：**
```
 BUNDLE  ./app/camera.tsx
 BUNDLE  ./app/report/[id].tsx
```

**如果出现错误：**
- 红色的错误信息
- 复制发给我

## 常见问题解决

### Q1: "Not found" 错误

**可能原因：**
1. 路由配置问题
2. 报告数据未正确传递
3. 页面组件加载失败

**调试步骤：**
1. 打开浏览器控制台（F12）
2. 查看地址栏 URL（应该是 `http://localhost:8081/report/report-xxxxx`）
3. 查看控制台日志
4. 截图发给我

### Q2: 识别超时

**原因：** 本地网络无法访问阿里云 API

**当前方案：** 已配置使用模拟数据，不应该超时

**如果仍然超时：**
1. 检查 API 服务器是否正常运行
2. 检查浏览器控制台的网络请求
3. 确认请求发送到 `http://localhost:3001/api/ocr`

### Q3: 图片上传失败

**可能原因：**
1. 图片格式不支持
2. 图片太大
3. Base64 转换失败

**解决方法：**
1. 使用 JPG 或 PNG 格式
2. 图片大小控制在 5MB 以内
3. 查看浏览器控制台错误信息

### Q4: 页面样式错乱

**可能原因：**
1. CSS 未正确加载
2. NativeWind 配置问题

**解决方法：**
1. 刷新页面（Ctrl + F5）
2. 清除浏览器缓存
3. 重启 Expo 服务器

## 成功标准

测试成功的标志：
- ✓ 首页正常显示
- ✓ 可以选择图片
- ✓ 扫描进度正常显示
- ✓ 自动跳转到报告页面
- ✓ 报告内容完整显示
- ✓ 可以返回首页
- ✓ 可以查看历史记录

## 下一步

测试成功后，我们可以：

1. **修复发现的问题**
2. **部署到生产环境**：
   ```cmd
   npm run deploy
   ```
3. **构建 Android APK**：
   ```cmd
   eas build --platform android
   ```
4. **继续开发新功能**

## 需要帮助？

如果遇到问题，请提供：
1. 错误截图（包括浏览器地址栏）
2. 浏览器控制台日志（F12 → Console）
3. API 服务器窗口的输出
4. Expo 服务器窗口的输出

我会根据这些信息帮你诊断问题。
