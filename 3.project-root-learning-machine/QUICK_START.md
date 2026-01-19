# 🚀 快速启动指南

## 当前状态

✅ **代码已完成** - MVP所有功能已实现
⚠️ **需要配置环境** - 需要设置数据库和依赖

## 前置条件检查

### 1. 安装必需软件

- [ ] **Java 17+** 
  ```bash
  java -version
  ```
  如果没有，下载：https://adoptium.net/

- [ ] **PostgreSQL**
  ```bash
  psql --version
  ```
  如果没有，下载：https://www.postgresql.org/download/

- [ ] **Gradle** (可选，可以使用wrapper)
  ```bash
  gradle -version
  ```

### 2. 设置数据库

```sql
-- 1. 启动PostgreSQL服务
-- Windows: 在服务中启动PostgreSQL
-- Mac: brew services start postgresql
-- Linux: sudo systemctl start postgresql

-- 2. 创建数据库
psql -U postgres
CREATE DATABASE learningapp;
\q
```

### 3. 配置后端

编辑 `backend/src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/learningapp
    username: postgres
    password: your_password  # 改成你的PostgreSQL密码
```

## 启动步骤

### 方式1: 使用IDE (推荐)

#### IntelliJ IDEA / Android Studio
1. 打开 `backend` 目录
2. 等待Gradle同步
3. 找到 `LearningAppApplication.kt`
4. 右键 → Run 'LearningAppApplication'

### 方式2: 命令行

```bash
cd backend

# Windows
gradlew.bat bootRun

# Mac/Linux
./gradlew bootRun

# 或使用系统gradle
gradle bootRun
```

### 验证后端启动

访问：http://localhost:8080/actuator/health

应该看到：
```json
{"status":"UP"}
```

## 测试API

### 1. 登录获取Token

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"student\",\"password\":\"password123\"}"
```

### 2. 获取课程列表

```bash
curl http://localhost:8080/api/courses?status=PUBLISHED
```

## Android应用配置

### 1. 更新网络地址

编辑 `android-app/app/src/main/java/com/learningapp/data/remote/NetworkModule.kt`:

```kotlin
// 模拟器
private const val BASE_URL = "http://10.0.2.2:8080/"

// 真机 - 替换为你的电脑IP
// private const val BASE_URL = "http://192.168.1.100:8080/"
```

**获取电脑IP:**
```bash
# Windows
ipconfig

# Mac/Linux
ifconfig
```

### 2. 在Android Studio中运行

1. 打开 `android-app` 目录
2. 等待Gradle同步
3. 连接模拟器或真机
4. 点击运行按钮 ▶️

## 测试账号

| 用户名 | 密码 | 角色 |
|--------|------|------|
| student | password123 | 学生 |
| admin | password123 | 管理员 |

## 常见问题

### ❌ 数据库连接失败

**错误信息:** `Connection refused` 或 `database "learningapp" does not exist`

**解决方案:**
1. 确保PostgreSQL服务正在运行
2. 检查数据库名称是否为 `learningapp`
3. 检查用户名密码是否正确
4. 尝试手动连接：`psql -U postgres -d learningapp`

### ❌ 端口8080被占用

**错误信息:** `Port 8080 is already in use`

**解决方案:**
```bash
# Windows - 查找占用进程
netstat -ano | findstr :8080
taskkill /PID <进程ID> /F

# 或修改端口
# 在 application.yml 中修改 server.port
```

### ❌ Gradle构建失败

**解决方案:**
```bash
# 清理并重新构建
cd backend
gradle clean build

# 或删除 .gradle 文件夹后重试
```

### ❌ Android应用无法连接

**解决方案:**
1. 确保后端已启动（访问 http://localhost:8080/actuator/health）
2. 检查BASE_URL配置
3. 模拟器必须使用 `10.0.2.2`
4. 真机必须使用电脑的局域网IP
5. 检查防火墙是否阻止了8080端口

## 简化启动（跳过数据库）

如果你只想快速查看代码结构，可以：

1. **查看后端代码:**
   - 打开 `backend/src/main/kotlin/com/learningapp`
   - 查看各个Service、Controller、Repository

2. **查看Android代码:**
   - 打开 `android-app/app/src/main/java/com/learningapp`
   - 查看UI界面、ViewModel、Repository

3. **查看设计文档:**
   - `.kiro/specs/learning-app/design.md` - 系统设计
   - `.kiro/specs/learning-app/requirements.md` - 需求文档
   - `.kiro/specs/learning-app/tasks.md` - 任务列表

## 下一步

✅ 后端启动成功后：
1. 测试API端点
2. 运行Android应用
3. 测试完整流程：登录 → 浏览课程 → 学习内容

📚 查看完整文档：
- `MVP_GUIDE.md` - 详细使用指南
- `MVP_CHECKLIST.md` - 完整检查清单

## 需要帮助？

如果遇到问题：
1. 检查上面的"常见问题"部分
2. 查看后端日志输出
3. 查看Android Logcat输出
4. 确保所有前置条件都已满足
