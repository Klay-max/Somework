# 🧪 MVP测试指南

## 当前状态
✅ 所有代码已完成
⏳ 等待环境配置和测试

## 测试前准备

### 0. 安装必需软件

#### 0.1 安装Java 17+
后端需要Java 17或更高版本。

**下载地址：**
- Oracle JDK: https://www.oracle.com/java/technologies/downloads/
- OpenJDK: https://adoptium.net/ (推荐，免费)

**安装后验证：**
```bash
java -version
# 应该显示 17 或更高版本
```

**配置环境变量（如果需要）：**
1. 右键"此电脑" -> 属性 -> 高级系统设置 -> 环境变量
2. 新建系统变量 `JAVA_HOME`，值为Java安装路径（如 `C:\Program Files\Java\jdk-17`）
3. 编辑 `Path` 变量，添加 `%JAVA_HOME%\bin`
4. 重启命令行窗口

#### 0.2 安装PostgreSQL
**下载地址：** https://www.postgresql.org/download/windows/

安装时记住你设置的密码（默认用户是postgres）。

**验证安装：**
```bash
psql --version
```

#### 0.3 安装IntelliJ IDEA (推荐)
**下载地址：** https://www.jetbrains.com/idea/download/
- Community版本（免费）就足够了

#### 0.4 安装Android Studio
**下载地址：** https://developer.android.com/studio

### 1. 检查PostgreSQL
```bash
# 检查PostgreSQL是否运行
# Windows: 打开服务管理器，查找PostgreSQL服务
# 或运行：
psql --version
```

### 2. 创建数据库
```bash
# 方式1: 使用psql命令行
psql -U postgres
# 输入密码后执行：
CREATE DATABASE learningapp;
\q

# 方式2: 使用pgAdmin (PostgreSQL自带的图形界面)
# 1. 打开pgAdmin
# 2. 连接到PostgreSQL服务器
# 3. 右键 Databases -> Create -> Database
# 4. 输入名称: learningapp
# 5. 点击Save
```

### 3. 更新数据库密码
编辑 `backend/src/main/resources/application.yml`:
```yaml
spring:
  datasource:
    password: your_actual_password  # 改成你的PostgreSQL密码
```

## 测试步骤

### 测试1: 后端API测试

#### 1.1 启动后端

**⚠️ 重要：请确保PostgreSQL已安装并运行，数据库"learningapp"已创建**

**方式1: 使用IntelliJ IDEA (强烈推荐)**
1. 用IntelliJ IDEA打开 `backend` 目录
2. 等待Gradle同步完成（首次可能需要几分钟下载依赖）
3. 找到 `src/main/kotlin/com/learningapp/LearningAppApplication.kt`
4. 右键点击文件 -> Run 'LearningAppApplicationKt'
5. 查看控制台输出，等待看到 "Started LearningAppApplication"

**方式2: 使用命令行**
```bash
cd backend

# Windows (如果有Java 17+)
# 首先确保JAVA_HOME已设置
java -version

# 如果项目根目录有gradlew.bat
..\gradlew.bat bootRun

# 或者如果系统安装了gradle
gradle bootRun
```

**方式3: 使用start-backend.bat脚本**
```bash
# 在项目根目录运行
start-backend.bat
```

#### 1.2 验证后端启动
打开浏览器访问：
```
http://localhost:8080/actuator/health
```

应该看到：
```json
{"status":"UP"}
```

#### 1.3 测试登录API
```bash
# 使用curl测试
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"student\",\"password\":\"password123\"}"
```

应该返回包含token的JSON响应。

#### 1.4 测试课程列表API
```bash
curl http://localhost:8080/api/courses?status=PUBLISHED
```

应该返回3个测试课程。

### 测试2: Android应用测试

#### 2.1 配置网络地址
编辑 `android-app/app/src/main/java/com/learningapp/data/remote/NetworkModule.kt`:

```kotlin
// 如果使用模拟器
private const val BASE_URL = "http://10.0.2.2:8080/"

// 如果使用真机，替换为你的电脑IP
// private const val BASE_URL = "http://192.168.1.100:8080/"
```

**获取电脑IP地址：**
```bash
# Windows
ipconfig
# 查找 IPv4 地址

# Mac/Linux
ifconfig
# 或
ip addr
```

#### 2.2 在Android Studio中运行
1. 打开 `android-app` 目录
2. 等待Gradle同步完成（可能需要几分钟）
3. 连接Android模拟器或真机
4. 点击运行按钮 ▶️

#### 2.3 测试登录
- 用户名：`student`
- 密码：`password123`
- 点击登录

#### 2.4 测试核心流程
1. ✅ 登录成功后应该看到课程列表
2. ✅ 下拉刷新应该正常工作
3. ✅ 点击任意课程进入详情
4. ✅ 点击"开始学习"
5. ✅ 查看学习内容
6. ✅ 点击"标记完成"
7. ✅ 点击"下一单元"（如果有）

## 预期结果

### ✅ 成功标志
- [ ] 后端启动无错误
- [ ] 健康检查返回UP
- [ ] 登录API返回token
- [ ] 课程列表返回3个课程
- [ ] Android应用成功登录
- [ ] 可以浏览课程列表
- [ ] 可以查看课程详情
- [ ] 可以查看学习内容
- [ ] 进度保存成功

### ❌ 常见问题

#### 问题1: 后端启动失败 - 数据库连接错误
```
错误: Connection refused
```
**解决方案:**
1. 确保PostgreSQL服务正在运行
2. 检查数据库名称是否为 `learningapp`
3. 检查用户名密码是否正确
4. 尝试手动连接：`psql -U postgres -d learningapp`

#### 问题2: 后端启动失败 - 端口被占用
```
错误: Port 8080 is already in use
```
**解决方案:**
```bash
# Windows - 查找并关闭占用进程
netstat -ano | findstr :8080
taskkill /PID <进程ID> /F

# 或修改端口
# 在 application.yml 中修改 server.port: 8081
```

#### 问题3: Android应用无法连接后端
```
错误: Failed to connect / Connection refused
```
**解决方案:**
1. 确保后端已启动（访问 http://localhost:8080/actuator/health）
2. 检查BASE_URL配置
3. 模拟器必须使用 `10.0.2.2`，不能用 `localhost`
4. 真机必须使用电脑的局域网IP
5. 检查防火墙是否阻止了8080端口

#### 问题4: Android编译错误
```
错误: Gradle sync failed
```
**解决方案:**
1. File -> Invalidate Caches / Restart
2. 删除 `.gradle` 文件夹
3. 重新同步Gradle

#### 问题5: 没有测试数据
```
课程列表为空
```
**解决方案:**
1. 检查 `V2__Insert_test_data.sql` 是否执行
2. 查看后端日志确认Flyway迁移是否成功
3. 手动执行SQL：
```bash
psql -U postgres -d learningapp -f backend/src/main/resources/db/migration/V2__Insert_test_data.sql
```

## 测试数据

### 用户账号
| 用户名 | 密码 | 角色 |
|--------|------|------|
| student | password123 | 学生 |
| admin | password123 | 管理员 |

### 测试课程
1. **Kotlin编程入门** (course-1)
   - 3个学习单元
   - 难度：初级

2. **Android开发实战** (course-2)
   - 2个学习单元
   - 难度：中级

3. **Spring Boot微服务** (course-3)
   - 1个学习单元
   - 难度：高级

## 测试报告模板

完成测试后，记录结果：

```
测试日期：____________________
测试人员：____________________

后端测试：
[ ] 后端启动成功
[ ] 健康检查通过
[ ] 登录API正常
[ ] 课程列表API正常
[ ] 学习记录API正常

Android测试：
[ ] 应用编译成功
[ ] 登录功能正常
[ ] 课程列表显示正常
[ ] 课程详情显示正常
[ ] 学习内容显示正常
[ ] 进度保存正常
[ ] 导航流程正常

发现的问题：
1. ____________________
2. ____________________
3. ____________________

总体评价：
[ ] 通过 - 所有功能正常
[ ] 部分通过 - 有小问题但可用
[ ] 未通过 - 有严重问题
```

## 下一步

### 如果测试通过 ✅
恭喜！MVP已经可以正常工作了。你可以：
1. 继续开发更多功能（练习题、AI等）
2. 优化现有功能
3. 添加更多测试数据
4. 改进UI设计

### 如果测试失败 ❌
不要担心，按照以下步骤：
1. 查看上面的"常见问题"部分
2. 检查后端日志输出
3. 检查Android Logcat输出
4. 确保所有前置条件都满足
5. 如果还有问题，记录错误信息寻求帮助

## 快速命令参考

```bash
# 检查PostgreSQL
psql --version

# 创建数据库
psql -U postgres -c "CREATE DATABASE learningapp;"

# 启动后端
cd backend && gradle bootRun

# 测试健康检查
curl http://localhost:8080/actuator/health

# 测试登录
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"student","password":"password123"}'

# 测试课程列表
curl http://localhost:8080/api/courses?status=PUBLISHED

# 获取电脑IP (Windows)
ipconfig

# 获取电脑IP (Mac/Linux)
ifconfig
```

## 需要帮助？

查看其他文档：
- `QUICK_START.md` - 详细启动指南
- `MVP_CHECKLIST.md` - 完整检查清单
- `MVP_GUIDE.md` - 功能使用指南
- `README.md` - 项目概览
