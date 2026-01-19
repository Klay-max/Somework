# 🚀 MVP测试执行指南

## ✅ 当前配置状态

- **数据库名称**: `learningapp`
- **数据库用户**: `postgres`
- **数据库密码**: `klay9873210`
- **后端端口**: `8080`
- **Android BASE_URL**: `http://10.0.2.2:8080/` (模拟器)

## 📝 测试步骤

### 第1步：检查PostgreSQL数据库 ✅

在命令行执行：

```bash
# 检查PostgreSQL是否运行
psql --version

# 如果PostgreSQL未运行，启动服务
# Windows: 在"服务"中找到PostgreSQL服务并启动
# 或在命令行运行：
net start postgresql-x64-14
```

### 第2步：确认数据库存在 ✅

```bash
# 连接到PostgreSQL
psql -U postgres

# 在psql中执行：
\l

# 查看是否有 learningapp 数据库
# 如果没有，创建它：
CREATE DATABASE learningapp;

# 退出
\q
```

### 第3步：启动后端服务 🚀

**方式1：使用IntelliJ IDEA (推荐)**

1. 打开IntelliJ IDEA
2. 选择 "Open" 打开 `backend` 文件夹
3. 等待Gradle同步完成（首次可能需要5-10分钟）
4. 在项目结构中找到：`backend/src/main/kotlin/com/learningapp/LearningAppApplication.kt`
5. 右键点击文件 → 选择 "Run 'LearningAppApplicationKt'"
6. 等待控制台显示：`Started LearningAppApplication`

**注意：** 文件路径是 `backend/src/main/kotlin/com/learningapp/LearningAppApplication.kt`（不是 `src/main/kotlin/...`）

**方式2：使用命令行**

```bash
cd backend

# Windows
gradlew.bat bootRun

# 如果gradlew.bat不存在，使用：
gradle bootRun
```

### 第4步：验证后端启动 ✅

打开浏览器访问：
```
http://localhost:8080/actuator/health
```

**预期结果：**
```json
{"status":"UP"}
```

### 第5步：测试登录API 🔐

在命令行执行（需要安装curl，或使用Postman）：

```bash
curl -X POST http://localhost:8080/api/auth/login -H "Content-Type: application/json" -d "{\"username\":\"student\",\"password\":\"password123\"}"
```

**预期结果：** 返回包含token的JSON

**如果没有curl，可以使用PowerShell：**
```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -ContentType "application/json" -Body '{"username":"student","password":"password123"}'
```

### 第6步：测试课程列表API 📚

```bash
curl http://localhost:8080/api/courses?status=PUBLISHED
```

**预期结果：** 返回3个测试课程的JSON数组

### 第7步：配置并运行Android应用 📱

1. **打开Android Studio**
2. 选择 "Open" 打开 `android-app` 文件夹
3. 等待Gradle同步完成（首次可能需要10-15分钟）
4. 启动Android模拟器：
   - 点击工具栏的 "Device Manager"
   - 如果没有模拟器，点击 "Create Device" 创建一个
   - 选择一个设备（推荐：Pixel 5）
   - 选择系统镜像（推荐：Android 13）
   - 点击 "Finish"
   - 启动模拟器
5. 点击运行按钮 ▶️ (绿色三角形)

### 第8步：测试Android应用功能 🧪

#### 8.1 登录测试
- [ ] 应用启动后显示登录界面
- [ ] 输入用户名：`student`
- [ ] 输入密码：`password123`
- [ ] 点击"登录"按钮
- [ ] 成功进入课程列表界面

#### 8.2 课程列表测试
- [ ] 看到3个测试课程：
  - Kotlin编程入门
  - Android开发实战
  - Spring Boot微服务
- [ ] 下拉刷新功能正常
- [ ] 课程卡片显示课程名称、描述、封面

#### 8.3 课程详情测试
- [ ] 点击"Kotlin编程入门"课程
- [ ] 看到课程详细信息
- [ ] 看到学习单元列表（3个单元）
- [ ] 点击"开始学习"按钮

#### 8.4 学习内容测试
- [ ] 看到第一个学习单元的内容
- [ ] 内容正常显示（文本/图片）
- [ ] 点击"标记完成"按钮
- [ ] 点击"下一单元"按钮
- [ ] 成功进入下一个学习单元

#### 8.5 学习记录测试
- [ ] 返回课程列表
- [ ] 点击底部导航的"学习记录"
- [ ] 看到刚才学习的课程记录
- [ ] 显示学习进度百分比

## ✅ 测试完成检查清单

### 后端测试
- [ ] PostgreSQL服务运行正常
- [ ] 数据库 learningapp 已创建
- [ ] 后端服务启动成功
- [ ] 健康检查返回 UP
- [ ] 登录API返回token
- [ ] 课程列表API返回3个课程

### Android测试
- [ ] Android Studio打开项目成功
- [ ] Gradle同步完成
- [ ] 模拟器启动成功
- [ ] 应用安装并运行
- [ ] 登录功能正常
- [ ] 课程列表显示正常
- [ ] 课程详情显示正常
- [ ] 学习内容显示正常
- [ ] 进度保存功能正常
- [ ] 学习记录显示正常

## ❌ 常见问题快速解决

### 问题1：后端启动失败 - 数据库连接错误

**错误信息：** `Connection refused` 或 `database does not exist`

**解决方案：**
```bash
# 1. 确保PostgreSQL服务运行
net start postgresql-x64-14

# 2. 创建数据库
psql -U postgres -c "CREATE DATABASE learningapp;"

# 3. 验证连接
psql -U postgres -d learningapp -c "SELECT 1;"
```

### 问题2：后端启动失败 - 端口被占用

**错误信息：** `Port 8080 is already in use`

**解决方案：**
```bash
# 查找占用8080端口的进程
netstat -ano | findstr :8080

# 结束进程（替换<PID>为实际进程ID）
taskkill /PID <PID> /F
```

### 问题3：Android应用无法连接后端

**错误信息：** `Failed to connect` 或 `Connection refused`

**解决方案：**
1. 确保后端已启动（访问 http://localhost:8080/actuator/health）
2. 确认BASE_URL配置为 `http://10.0.2.2:8080/`
3. 检查模拟器网络连接
4. 重启模拟器

### 问题4：Gradle同步失败

**解决方案：**
1. 在Android Studio中：File → Invalidate Caches / Restart
2. 删除项目中的 `.gradle` 文件夹
3. 重新同步

### 问题5：没有测试数据

**解决方案：**
```bash
# 手动执行测试数据SQL
cd backend
psql -U postgres -d learningapp -f src/main/resources/db/migration/V2__Insert_test_data.sql
```

## 📊 测试结果记录

**测试日期：** _______________
**测试人员：** _______________

**后端测试结果：**
- 启动状态：[ ] 成功 [ ] 失败
- API测试：[ ] 通过 [ ] 失败
- 问题记录：_______________________

**Android测试结果：**
- 编译状态：[ ] 成功 [ ] 失败
- 功能测试：[ ] 通过 [ ] 失败
- 问题记录：_______________________

**总体评价：**
[ ] ✅ 完全通过 - 所有功能正常
[ ] ⚠️ 部分通过 - 有小问题但可用
[ ] ❌ 未通过 - 有严重问题

## 🎉 测试通过后的下一步

恭喜！MVP测试通过后，你可以：

1. **继续开发更多功能**
   - 练习题答题功能（任务8）
   - 错题库功能（任务9）
   - AI答疑功能（任务10）

2. **优化现有功能**
   - 改进UI设计
   - 添加动画效果
   - 优化性能

3. **添加测试**
   - 编写单元测试
   - 编写属性测试
   - 编写集成测试

## 📚 相关文档

- `TEST_MVP.md` - 详细测试指南
- `MVP_CHECKLIST.md` - 完整检查清单
- `MVP_GUIDE.md` - 功能使用指南
- `QUICK_START.md` - 快速启动指南

## 🆘 需要帮助？

如果遇到问题：
1. 查看上面的"常见问题"部分
2. 检查后端控制台日志
3. 检查Android Logcat日志
4. 查看详细文档
5. 记录错误信息寻求帮助

---

**祝测试顺利！🚀**
