# 学习应用 MVP 测试指南

## 概述

这是一个最小可行产品(MVP)，包含以下核心功能：
- ✅ 用户认证（注册/登录）
- ✅ 课程列表浏览
- ✅ 课程详情查看
- ✅ 学习内容展示（文本、图片、视频）
- ✅ 学习进度跟踪
- ✅ Web管理后台（课程管理）

## 快速开始

### 1. 启动后端服务

```bash
cd backend
./gradlew bootRun
```

后端将在 `http://localhost:8080` 启动

### 2. 启动Web管理后台（可选）

```bash
cd web-admin
npm install
npm run dev
```

Web管理后台将在 `http://localhost:5173` 启动

### 3. 运行Android应用

1. 在Android Studio中打开 `android-app` 目录
2. 等待Gradle同步完成
3. 更新 `NetworkModule.kt` 中的BASE_URL为你的电脑IP地址
4. 运行应用到模拟器或真机

## 测试账号

系统已预置测试数据：

**学生账号：**
- 用户名: `student`
- 密码: `password123`

**管理员账号：**
- 用户名: `admin`
- 密码: `password123`

## 测试数据

系统包含3个测试课程：
1. **Kotlin编程入门** - 初级课程，3个学习单元
2. **Android开发实战** - 中级课程，2个学习单元
3. **Spring Boot微服务** - 高级课程，1个学习单元

## MVP功能测试流程

### Android应用测试

1. **登录**
   - 打开应用
   - 使用测试账号登录

2. **浏览课程**
   - 查看课程列表
   - 下拉刷新
   - 滚动加载更多

3. **查看课程详情**
   - 点击任意课程
   - 查看课程信息和学习单元列表

4. **开始学习**
   - 点击"开始学习"或选择特定单元
   - 查看学习内容（文本、图片）
   - 如果有视频URL，会显示视频播放器

5. **学习进度**
   - 点击"标记完成"保存进度
   - 点击"下一单元"继续学习
   - 进度会自动保存到本地和服务器

### Web管理后台测试

1. **登录**
   - 访问 http://localhost:5173
   - 使用管理员账号登录

2. **课程管理**
   - 查看课程列表
   - 创建新课程
   - 编辑课程信息
   - 发布/下架课程

3. **学习单元管理**
   - 为课程添加学习单元
   - 编辑单元内容
   - 调整单元顺序

4. **练习题管理**
   - 添加练习题
   - 编辑题目和选项
   - 设置正确答案和解析

## API端点

### 认证
- POST `/api/auth/register` - 用户注册
- POST `/api/auth/login` - 用户登录

### 课程
- GET `/api/courses` - 获取课程列表
- GET `/api/courses/{id}` - 获取课程详情
- GET `/api/courses/{id}/units` - 获取学习单元

### 学习记录
- POST `/api/learning/progress` - 保存学习进度
- GET `/api/learning/records` - 获取学习记录
- POST `/api/learning/units/{id}/complete` - 标记单元完成

### 管理端
- POST `/api/admin/courses` - 创建课程
- PUT `/api/admin/courses/{id}` - 更新课程
- POST `/api/admin/courses/{id}/publish` - 发布课程

## 配置说明

### Android应用配置

编辑 `android-app/app/src/main/java/com/learningapp/data/remote/NetworkModule.kt`:

```kotlin
private const val BASE_URL = "http://10.0.2.2:8080/" // 模拟器
// 或
private const val BASE_URL = "http://YOUR_IP:8080/" // 真机
```

### 后端配置

编辑 `backend/src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/learning_app
    username: postgres
    password: your_password
```

## 已知限制（MVP阶段）

1. ❌ 视频播放需要有效的视频URL
2. ❌ 没有实现练习题功能
3. ❌ 没有实现AI功能
4. ❌ 没有实现错题库
5. ❌ 没有实现离线下载
6. ❌ 没有实现通知功能

## 下一步开发

完成MVP测试后，可以继续实现：
1. 练习题答题功能
2. 错题库
3. AI答疑
4. 学习报告
5. 离线学习

## 故障排除

### 后端无法启动
- 检查PostgreSQL是否运行
- 检查数据库连接配置
- 查看控制台错误日志

### Android应用无法连接
- 检查BASE_URL配置
- 确保后端服务已启动
- 检查网络权限

### 数据库错误
- 运行 `./gradlew flywayClean flywayMigrate` 重置数据库
- 检查Flyway迁移脚本

## 技术栈

**后端：**
- Spring Boot 3.x
- Kotlin
- PostgreSQL
- JWT认证

**Android：**
- Jetpack Compose
- Kotlin Coroutines
- Room数据库
- Retrofit
- Koin依赖注入

**Web管理后台：**
- React
- TypeScript
- Ant Design
- Axios
