# 学习应用项目架构文档

## 📋 项目概述

这是一个完整的学习管理系统，包含：
- **后端**：Spring Boot + Kotlin + PostgreSQL
- **Android 应用**：Jetpack Compose + Kotlin
- **Web 管理后台**：React + TypeScript + Vite

---

## 📁 项目文件结构

```
project-root-learning-machine/
│
├── .kiro/                          # Kiro IDE 配置和规范文档
│   └── specs/
│       └── learning-app/
│           ├── requirements.md     # 需求文档
│           ├── design.md          # 设计文档
│           └── tasks.md           # 任务列表
│
├── backend/                        # Spring Boot 后端服务
│   ├── src/
│   │   ├── main/
│   │   │   ├── kotlin/
│   │   │   │   └── com/learningapp/
│   │   │   │       ├── api/
│   │   │   │       │   ├── controller/    # REST API 控制器
│   │   │   │       │   └── dto/          # 数据传输对象
│   │   │   │       ├── config/           # 配置类（Security, CORS等）
│   │   │   │       ├── domain/
│   │   │   │       │   ├── model/        # 数据库实体
│   │   │   │       │   └── repository/   # JPA Repository
│   │   │   │       ├── security/         # JWT 认证
│   │   │   │       ├── service/          # 业务逻辑层
│   │   │   │       └── LearningAppApplication.kt  # 主启动类
│   │   │   └── resources/
│   │   │       ├── application.yml       # 应用配置
│   │   │       └── db/migration/         # Flyway 数据库迁移脚本
│   │   │           ├── V1__Initial_schema.sql
│   │   │           └── V2__Insert_test_data.sql
│   │   └── test/                         # 测试代码
│   ├── build.gradle.kts                  # Gradle 构建配置
│   └── settings.gradle.kts
│
├── android-app/                    # Android 移动应用
│   ├── app/
│   │   ├── src/
│   │   │   └── main/
│   │   │       ├── java/com/learningapp/
│   │   │       │   ├── data/
│   │   │       │   │   ├── local/        # 本地存储（TokenManager）
│   │   │       │   │   ├── model/        # 数据模型
│   │   │       │   │   ├── remote/       # 网络层（Retrofit, ApiService）
│   │   │       │   │   └── repository/   # 数据仓库层
│   │   │       │   ├── di/              # 依赖注入（Koin）
│   │   │       │   ├── navigation/      # 导航配置
│   │   │       │   ├── ui/
│   │   │       │   │   ├── screen/      # Compose UI 界面
│   │   │       │   │   ├── theme/       # Material3 主题
│   │   │       │   │   └── viewmodel/   # ViewModel
│   │   │       │   └── MainActivity.kt
│   │   │       ├── AndroidManifest.xml
│   │   │       └── res/                 # 资源文件
│   │   └── build.gradle.kts             # 应用级 Gradle 配置
│   ├── gradle/
│   │   └── wrapper/
│   │       └── gradle-wrapper.properties
│   ├── gradle.properties                # Gradle 属性配置
│   ├── build.gradle.kts                 # 项目级 Gradle 配置
│   └── settings.gradle.kts
│
├── web-admin/                      # Web 管理后台（未完全实现）
│   ├── src/
│   │   ├── pages/                      # React 页面组件
│   │   └── ...
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── .gitignore                      # Git 忽略文件配置
├── README.md                       # 项目说明文档
├── QUICK_START.md                  # 快速开始指南
├── MVP_GUIDE.md                    # MVP 测试指南
├── 安装PostgreSQL.md               # PostgreSQL 安装指南
├── 开始测试.md                     # 测试步骤文档
└── start-backend.bat               # Windows 后端启动脚本
```

---

## 🛠️ 必需的开发工具和环境

### 1. 基础开发环境

#### Java 开发工具包
- **JDK 17**
  - 用途：运行 Spring Boot 后端和 Android Gradle 构建
  - 下载：通过 IntelliJ IDEA 或 Android Studio 自动下载
  - 或手动下载：https://adoptium.net/

#### 数据库
- **PostgreSQL 18**
  - 用途：后端数据存储
  - 下载：https://www.postgresql.org/download/
  - 配置：
    - 端口：5432（默认）
    - 用户名：postgres
    - 密码：klay9873210（或自定义）
    - 数据库名：learningapp

#### 版本控制
- **Git**
  - 用途：代码版本管理
  - 下载：https://git-scm.com/

---

### 2. 后端开发工具

#### IntelliJ IDEA
- **版本**：Community Edition 或 Ultimate
- **用途**：开发和运行 Spring Boot 后端
- **下载**：https://www.jetbrains.com/idea/download/
- **必需插件**：
  - Kotlin（通常已内置）
  - Spring Boot（Ultimate 版本内置）
  - Database Tools（查看数据库）

#### Gradle
- **版本**：8.5+
- **用途**：后端项目构建工具
- **说明**：通过 Gradle Wrapper 自动管理，无需手动安装

---

### 3. Android 开发工具

#### Android Studio
- **版本**：最新稳定版（推荐 Hedgehog 或更新）
- **用途**：开发和运行 Android 应用
- **下载**：https://developer.android.com/studio
- **必需组件**：
  - Android SDK Platform 34（API Level 34）
  - Android SDK Build-Tools 34.0.0
  - Android Emulator
  - Android SDK Platform-Tools
  - Android SDK Tools

#### Android 模拟器配置
- **推荐配置**：
  - 设备：Pixel 5
  - 系统镜像：Android 13 (API 33) 或 Android 14 (API 34)
  - RAM：2048 MB 或更多
  - 存储：2 GB 或更多

#### Gradle
- **版本**：8.5+（通过 Gradle Wrapper 管理）
- **说明**：Android Studio 会自动处理

---

### 4. Web 开发工具（可选）

#### Node.js
- **版本**：18.x 或 20.x LTS
- **用途**：运行 Web 管理后台
- **下载**：https://nodejs.org/
- **包管理器**：npm（随 Node.js 安装）

#### 代码编辑器
- **VS Code**（推荐）
  - 下载：https://code.visualstudio.com/
  - 推荐插件：
    - ESLint
    - Prettier
    - TypeScript and JavaScript Language Features

---

### 5. 数据库管理工具

#### pgAdmin 4
- **用途**：PostgreSQL 图形化管理工具
- **下载**：随 PostgreSQL 安装包一起安装
- **功能**：
  - 查看数据库表结构
  - 执行 SQL 查询
  - 管理用户和权限

#### 或使用 IntelliJ IDEA Database Tools
- **用途**：在 IDE 内直接管理数据库
- **优点**：无需切换工具

---

## 🔧 项目技术栈详解

### 后端技术栈

#### 核心框架
- **Spring Boot 3.2.0**
  - Web MVC：REST API 开发
  - Data JPA：数据库 ORM
  - Security：认证和授权
  - Actuator：健康检查和监控

#### 编程语言
- **Kotlin 1.9.20**
  - 简洁的语法
  - 空安全
  - 协程支持

#### 数据库
- **PostgreSQL 18**
  - 关系型数据库
  - 支持 JSON 数据类型
  - 强大的查询能力

#### 数据库迁移
- **Flyway**
  - 版本化数据库迁移
  - 自动执行 SQL 脚本

#### 安全认证
- **JWT (JSON Web Token)**
  - 无状态认证
  - Token 过期管理

#### 构建工具
- **Gradle 8.5+ (Kotlin DSL)**
  - 依赖管理
  - 多模块构建

---

### Android 技术栈

#### UI 框架
- **Jetpack Compose**
  - 声明式 UI
  - Material3 设计
  - 响应式编程

#### 架构组件
- **ViewModel**：UI 状态管理
- **Navigation Compose**：页面导航
- **Lifecycle**：生命周期管理

#### 网络请求
- **Retrofit 2.9.0**
  - REST API 客户端
  - Gson 转换器
- **OkHttp 4.12.0**
  - HTTP 客户端
  - 日志拦截器

#### 依赖注入
- **Koin 3.5.0**
  - 轻量级 DI 框架
  - Kotlin 友好

#### 图片加载
- **Coil 2.5.0**
  - Compose 原生支持
  - 异步图片加载

#### 本地存储
- **SharedPreferences**
  - Token 存储
  - 简单键值对存储

#### 协程
- **Kotlin Coroutines**
  - 异步编程
  - 挂起函数

---

### Web 前端技术栈（可选）

#### 框架
- **React 18**
  - 组件化开发
  - Hooks API

#### 语言
- **TypeScript**
  - 类型安全
  - 更好的 IDE 支持

#### 构建工具
- **Vite**
  - 快速开发服务器
  - 优化的生产构建

---

## 📦 项目依赖版本总结

### 后端依赖（backend/build.gradle.kts）
```kotlin
- Spring Boot: 3.2.0
- Kotlin: 1.9.20
- PostgreSQL Driver: 42.7.1
- Flyway: 9.22.3
- JWT: 0.12.3
- Spring Security: (随 Spring Boot)
- Spring Data JPA: (随 Spring Boot)
```

### Android 依赖（android-app/app/build.gradle.kts）
```kotlin
- Compose BOM: 2023.10.01
- Material3: (随 Compose BOM)
- Navigation Compose: 2.7.5
- Lifecycle: 2.6.2
- Retrofit: 2.9.0
- OkHttp: 4.12.0
- Koin: 3.5.0
- Coil: 2.5.0
- Coroutines: 1.7.3
```

---

## 🚀 在新电脑上复刻项目的步骤

### 第一步：安装必需工具

1. **安装 JDK 17**
   - 下载并安装 JDK 17
   - 配置 JAVA_HOME 环境变量

2. **安装 PostgreSQL 18**
   - 下载并安装 PostgreSQL
   - 记住设置的密码
   - 安装 pgAdmin（可选）

3. **安装 IntelliJ IDEA**
   - 下载 Community 或 Ultimate 版本
   - 安装 Kotlin 插件（通常已内置）

4. **安装 Android Studio**
   - 下载最新稳定版
   - 安装 Android SDK 和模拟器组件

5. **安装 Git**（如果需要克隆项目）

---

### 第二步：配置数据库

1. **创建数据库**
   ```sql
   CREATE DATABASE learningapp;
   ```

2. **配置后端数据库连接**
   - 编辑 `backend/src/main/resources/application.yml`
   - 修改数据库密码为你设置的密码：
   ```yaml
   spring:
     datasource:
       url: jdbc:postgresql://localhost:5432/learningapp
       username: postgres
       password: 你的密码
   ```

---

### 第三步：复制项目文件

1. **复制整个项目文件夹**
   - 将 `project-root-learning-machine` 文件夹复制到新电脑

2. **或使用 Git 克隆**（如果项目已上传到 Git）
   ```bash
   git clone <repository-url>
   ```

---

### 第四步：启动后端

1. **打开 IntelliJ IDEA**
2. **Open** → 选择 `backend` 文件夹
3. **等待 Gradle 同步**（首次需要下载依赖，5-10分钟）
4. **运行应用**：
   - 找到 `LearningAppApplication.kt`
   - 右键 → Run
5. **验证启动**：
   - 浏览器访问 `http://localhost:8080/actuator/health`

---

### 第五步：运行 Android 应用

1. **打开 Android Studio**
2. **Open** → 选择 `android-app` 文件夹
3. **等待 Gradle 同步**（首次需要下载依赖，10-20分钟）
4. **创建模拟器**：
   - Device Manager → Create Device
   - 选择 Pixel 5 + Android 13/14
5. **运行应用**：
   - 点击绿色运行按钮 ▶️
6. **测试功能**：
   - 查看课程列表
   - 点击课程查看详情

---

## 🔑 重要配置说明

### 后端配置文件

#### application.yml
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/learningapp
    username: postgres
    password: klay9873210  # 修改为你的密码
  
  jpa:
    hibernate:
      ddl-auto: validate  # 使用 Flyway 管理数据库
    show-sql: true
  
  flyway:
    enabled: true
    baseline-on-migrate: true

server:
  port: 8080

jwt:
  secret: your-secret-key-here-make-it-long-and-secure
  expiration: 86400000  # 24小时
```

---

### Android 配置

#### NetworkModule.kt
```kotlin
private const val BASE_URL = "http://10.0.2.2:8080/"  
// 10.0.2.2 是 Android 模拟器访问主机 localhost 的地址
```

#### gradle.properties
```properties
android.overridePathCheck=true  # 允许非 ASCII 路径
```

---

## 📝 常见问题和解决方案

### 1. 后端启动失败 - 数据库连接错误
**问题**：`Connection refused` 或 `database does not exist`

**解决**：
- 确保 PostgreSQL 服务正在运行
- 确保数据库 `learningapp` 已创建
- 检查 `application.yml` 中的密码是否正确

---

### 2. Android Gradle 同步失败
**问题**：下载依赖超时或失败

**解决**：
- 检查网络连接
- 配置 Gradle 镜像（如阿里云镜像）
- 在 `gradle.properties` 中添加：
  ```properties
  systemProp.http.proxyHost=mirrors.aliyun.com
  systemProp.http.proxyPort=80
  ```

---

### 3. Android 应用无法连接后端
**问题**：获取课程列表失败

**解决**：
- 确保后端正在运行（访问 `http://localhost:8080/actuator/health`）
- 确认 BASE_URL 配置为 `http://10.0.2.2:8080/`
- 检查 SecurityConfig 是否允许公开访问 `/api/courses/**`

---

### 4. 路径包含中文字符导致构建失败
**问题**：Android Gradle 构建失败

**解决**：
- 在 `android-app/gradle.properties` 中添加：
  ```properties
  android.overridePathCheck=true
  ```

---

## 📚 学习资源

### Spring Boot
- 官方文档：https://spring.io/projects/spring-boot
- Kotlin + Spring：https://spring.io/guides/tutorials/spring-boot-kotlin/

### Android Jetpack Compose
- 官方文档：https://developer.android.com/jetpack/compose
- Compose 教程：https://developer.android.com/courses/pathways/compose

### PostgreSQL
- 官方文档：https://www.postgresql.org/docs/

---

## 🎯 项目核心功能

### 已实现功能
- ✅ 用户注册和登录（JWT 认证）
- ✅ 课程列表展示
- ✅ 课程详情查看
- ✅ 学习单元浏览
- ✅ 学习进度跟踪
- ✅ 数据库迁移和测试数据

### 待实现功能
- ⏳ 练习题功能
- ⏳ AI 答疑
- ⏳ 学习记录统计
- ⏳ Web 管理后台完善
- ⏳ 错题本功能

---

## 📞 技术支持

如果在复刻项目时遇到问题：
1. 检查本文档的"常见问题和解决方案"部分
2. 查看项目中的其他文档（QUICK_START.md, MVP_GUIDE.md 等）
3. 检查 IDE 控制台的错误日志
4. 查看 Android Logcat 日志

---

**文档版本**：1.0  
**最后更新**：2025-12-23  
**项目状态**：MVP 已完成，核心功能可运行
