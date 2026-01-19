# MVP 启动检查清单

## 前置条件

### 必需软件
- [ ] Java 17+ 已安装
- [ ] PostgreSQL 已安装并运行
- [ ] Android Studio 已安装
- [ ] Node.js 16+ 已安装（如果要运行Web管理后台）

### 数据库配置
- [ ] PostgreSQL 服务已启动
- [ ] 创建数据库：`CREATE DATABASE learning_app;`
- [ ] 更新 `backend/src/main/resources/application.yml` 中的数据库密码

## 启动步骤

### 1. 启动后端 ✅

**Windows:**
```bash
start-backend.bat
```

**Mac/Linux:**
```bash
chmod +x start-backend.sh
./start-backend.sh
```

**或手动启动:**
```bash
cd backend
./gradlew bootRun
```

**验证:**
- [ ] 访问 http://localhost:8080/actuator/health
- [ ] 应该看到 `{"status":"UP"}`

### 2. 配置Android应用 📱

**更新网络配置:**

编辑 `android-app/app/src/main/java/com/learningapp/data/remote/NetworkModule.kt`:

```kotlin
// 使用模拟器
private const val BASE_URL = "http://10.0.2.2:8080/"

// 或使用真机（替换为你的电脑IP）
// private const val BASE_URL = "http://192.168.1.100:8080/"
```

**获取电脑IP地址:**
- Windows: `ipconfig`
- Mac/Linux: `ifconfig` 或 `ip addr`

### 3. 运行Android应用 🚀

1. [ ] 在Android Studio中打开 `android-app` 目录
2. [ ] 等待Gradle同步完成
3. [ ] 连接模拟器或真机
4. [ ] 点击运行按钮

### 4. 测试核心流程 🧪

#### 登录测试
- [ ] 打开应用
- [ ] 输入用户名: `student`
- [ ] 输入密码: `password123`
- [ ] 点击登录
- [ ] 应该成功进入课程列表

#### 课程浏览测试
- [ ] 看到3个测试课程
- [ ] 下拉刷新正常工作
- [ ] 点击任意课程进入详情

#### 课程详情测试
- [ ] 看到课程信息
- [ ] 看到学习单元列表
- [ ] 点击"开始学习"

#### 学习内容测试
- [ ] 看到学习内容（文本/图片）
- [ ] 点击"标记完成"
- [ ] 点击"下一单元"（如果有）
- [ ] 返回按钮正常工作

## 常见问题排查

### 后端无法启动

**问题: 数据库连接失败**
```
Solution:
1. 检查PostgreSQL是否运行
2. 检查数据库名称是否为 learning_app
3. 检查用户名密码是否正确
```

**问题: 端口8080被占用**
```
Solution:
1. 找到占用进程: netstat -ano | findstr :8080 (Windows)
2. 或修改 application.yml 中的端口
```

### Android应用无法连接

**问题: 网络请求失败**
```
Solution:
1. 检查BASE_URL配置
2. 确保后端已启动
3. 模拟器使用 10.0.2.2
4. 真机使用电脑的局域网IP
5. 检查防火墙设置
```

**问题: 编译错误**
```
Solution:
1. File -> Invalidate Caches / Restart
2. 删除 .gradle 文件夹
3. ./gradlew clean build
```

### 数据问题

**问题: 没有测试数据**
```
Solution:
1. 检查 V2__Insert_test_data.sql 是否执行
2. 手动执行: psql -d learning_app -f backend/src/main/resources/db/migration/V2__Insert_test_data.sql
3. 或使用 ./gradlew flywayMigrate
```

## 测试数据

### 用户账号
| 角色 | 用户名 | 密码 | 用途 |
|------|--------|------|------|
| 学生 | student | password123 | Android应用测试 |
| 管理员 | admin | password123 | Web后台测试 |

### 测试课程
1. **Kotlin编程入门** (course-1)
   - 3个学习单元
   - 2个练习题
   - 难度: 初级

2. **Android开发实战** (course-2)
   - 2个学习单元
   - 1个练习题
   - 难度: 中级

3. **Spring Boot微服务** (course-3)
   - 1个学习单元
   - 0个练习题
   - 难度: 高级

## API测试

使用Postman或curl测试API:

### 登录
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"student","password":"password123"}'
```

### 获取课程列表
```bash
curl http://localhost:8080/api/courses?status=PUBLISHED
```

### 获取课程详情
```bash
curl http://localhost:8080/api/courses/course-1
```

## 下一步

MVP测试通过后，可以继续开发：
- [ ] 练习题答题功能
- [ ] 错题库
- [ ] AI答疑
- [ ] 离线学习
- [ ] 通知功能

## 需要帮助？

查看详细文档:
- `MVP_GUIDE.md` - 完整使用指南
- `README.md` - 项目说明
- `.kiro/specs/learning-app/` - 需求和设计文档
