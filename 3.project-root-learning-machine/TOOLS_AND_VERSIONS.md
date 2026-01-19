# 🛠️ 工具和版本快速参考

这个文档列出了项目所需的所有工具、版本和下载链接。

---

## 📥 必需工具下载清单

| 工具 | 版本 | 用途 | 下载链接 | 安装优先级 |
|------|------|------|----------|-----------|
| **JDK** | 17 | 运行后端和 Android 构建 | https://adoptium.net/ | ⭐⭐⭐ 必需 |
| **PostgreSQL** | 18 | 数据库 | https://www.postgresql.org/download/ | ⭐⭐⭐ 必需 |
| **IntelliJ IDEA** | 最新稳定版 | 后端开发 | https://www.jetbrains.com/idea/download/ | ⭐⭐⭐ 必需 |
| **Android Studio** | 最新稳定版 | Android 开发 | https://developer.android.com/studio | ⭐⭐⭐ 必需 |
| **Git** | 最新版 | 版本控制 | https://git-scm.com/ | ⭐⭐ 推荐 |
| **Node.js** | 18.x 或 20.x LTS | Web 前端（可选） | https://nodejs.org/ | ⭐ 可选 |
| **VS Code** | 最新版 | Web 前端开发（可选） | https://code.visualstudio.com/ | ⭐ 可选 |

---

## 🔧 详细工具说明

### 1. JDK 17

#### 为什么需要？
- Spring Boot 3.x 需要 Java 17+
- Android Gradle 构建需要 Java 17
- Kotlin 编译需要 JDK

#### 推荐版本
- **Eclipse Temurin JDK 17** (推荐)
- **Oracle JDK 17**
- **OpenJDK 17**

#### 下载方式
**方式 1：通过 IDE 自动下载（推荐）**
- IntelliJ IDEA: File → Project Structure → SDK → Add SDK → Download JDK
- Android Studio: File → Settings → Build Tools → Gradle → Gradle JDK → Download JDK

**方式 2：手动下载**
- 访问：https://adoptium.net/
- 选择：Java 17 (LTS)
- 选择操作系统：Windows
- 下载并安装

#### 验证安装
```bash
java -version
```
应该显示：`openjdk version "17.x.x"` 或 `java version "17.x.x"`

---

### 2. PostgreSQL 18

#### 为什么需要？
- 后端数据存储
- 用户、课程、学习记录等数据持久化

#### 推荐版本
- **PostgreSQL 18.x** (最新稳定版)

#### 下载方式
- 访问：https://www.postgresql.org/download/windows/
- 下载 Windows 安装程序
- 运行安装程序

#### 安装配置
- **端口**：5432（默认，不要修改）
- **超级用户**：postgres（默认）
- **密码**：自己设置，记住这个密码！
- **区域设置**：Chinese, China 或 English, United States

#### 组件选择
- [x] PostgreSQL Server（必需）
- [x] pgAdmin 4（推荐，图形化管理工具）
- [x] Command Line Tools（可选）
- [ ] Stack Builder（不需要）

#### 验证安装
**方式 1：通过 pgAdmin**
- 打开 pgAdmin 4
- 左侧应该看到 "PostgreSQL 18" 服务器

**方式 2：通过命令行**
```bash
psql --version
```
应该显示：`psql (PostgreSQL) 18.x`

---

### 3. IntelliJ IDEA

#### 为什么需要？
- 开发和运行 Spring Boot 后端
- Kotlin 开发支持
- 数据库工具集成

#### 版本选择
- **Community Edition**（免费，足够用）
- **Ultimate Edition**（付费，功能更多）

#### 下载方式
- 访问：https://www.jetbrains.com/idea/download/
- 选择 Windows 版本
- 下载 Community 或 Ultimate

#### 必需插件
- **Kotlin**（通常已内置）
- **Spring Boot**（Ultimate 版本内置，Community 版本可选）
- **Database Tools**（Ultimate 版本内置）

#### 首次配置
1. 启动 IDEA
2. 选择主题（Darcula 或 Light）
3. 跳过插件安装（后续可以安装）
4. 完成向导

---

### 4. Android Studio

#### 为什么需要？
- 开发和运行 Android 应用
- Android SDK 管理
- 模拟器管理

#### 推荐版本
- **最新稳定版**（Hedgehog 或更新）

#### 下载方式
- 访问：https://developer.android.com/studio
- 下载 Windows 版本
- 运行安装程序

#### 首次配置向导
1. **欢迎界面**：选择 "Standard" 安装类型
2. **SDK 组件**：确保选中：
   - [x] Android SDK
   - [x] Android SDK Platform
   - [x] Android Virtual Device
3. **下载组件**：等待下载完成（可能需要 10-30 分钟）

#### 必需 SDK 组件
打开 SDK Manager (Tools → SDK Manager)：

**SDK Platforms 标签**：
- [x] Android 14.0 (API 34) - 推荐
- [x] Android 13.0 (API 33) - 推荐

**SDK Tools 标签**：
- [x] Android SDK Build-Tools 34.0.0
- [x] Android Emulator
- [x] Android SDK Platform-Tools
- [x] Android SDK Tools

#### 创建模拟器
1. Tools → Device Manager
2. Create Device
3. 选择 **Pixel 5**
4. 选择系统镜像：**Android 13 (API 33)** 或 **Android 14 (API 34)**
5. 配置：
   - RAM: 2048 MB
   - Internal Storage: 2048 MB
6. Finish

---

### 5. Git（可选但推荐）

#### 为什么需要？
- 版本控制
- 从 Git 仓库克隆项目
- 代码备份和协作

#### 推荐版本
- **最新稳定版**

#### 下载方式
- 访问：https://git-scm.com/download/win
- 下载 Windows 版本
- 运行安装程序

#### 安装选项
- 编辑器：选择你喜欢的（推荐 Vim 或 Nano）
- PATH 环境：选择 "Git from the command line and also from 3rd-party software"
- HTTPS 传输：选择 "Use the OpenSSL library"
- 行尾转换：选择 "Checkout Windows-style, commit Unix-style line endings"
- 终端模拟器：选择 "Use MinTTY"
- 其他选项：保持默认

#### 验证安装
```bash
git --version
```
应该显示：`git version 2.x.x`

---

### 6. Node.js（可选，仅用于 Web 前端）

#### 为什么需要？
- 运行 Web 管理后台（如果需要开发 Web 部分）
- npm 包管理

#### 推荐版本
- **Node.js 20.x LTS**（长期支持版本）

#### 下载方式
- 访问：https://nodejs.org/
- 下载 LTS 版本（推荐）
- 运行安装程序

#### 验证安装
```bash
node --version
npm --version
```

---

### 7. VS Code（可选，仅用于 Web 前端）

#### 为什么需要？
- 开发 Web 管理后台
- 轻量级代码编辑器

#### 推荐版本
- **最新稳定版**

#### 下载方式
- 访问：https://code.visualstudio.com/
- 下载 Windows 版本
- 运行安装程序

#### 推荐插件
- **ESLint**：JavaScript 代码检查
- **Prettier**：代码格式化
- **TypeScript and JavaScript Language Features**：TypeScript 支持
- **Vite**：Vite 项目支持

---

## 📦 项目依赖版本

### 后端依赖

| 依赖 | 版本 | 说明 |
|------|------|------|
| Spring Boot | 3.2.0 | 核心框架 |
| Kotlin | 1.9.20 | 编程语言 |
| PostgreSQL Driver | 42.7.1 | 数据库驱动 |
| Flyway | 9.22.3 | 数据库迁移 |
| JWT | 0.12.3 | 认证令牌 |
| Spring Security | (随 Spring Boot) | 安全框架 |
| Spring Data JPA | (随 Spring Boot) | ORM 框架 |
| Gradle | 8.5+ | 构建工具 |

### Android 依赖

| 依赖 | 版本 | 说明 |
|------|------|------|
| Compose BOM | 2023.10.01 | Compose 版本管理 |
| Material3 | (随 Compose BOM) | UI 组件库 |
| Navigation Compose | 2.7.5 | 导航框架 |
| Lifecycle | 2.6.2 | 生命周期管理 |
| Retrofit | 2.9.0 | HTTP 客户端 |
| OkHttp | 4.12.0 | HTTP 引擎 |
| Koin | 3.5.0 | 依赖注入 |
| Coil | 2.5.0 | 图片加载 |
| Coroutines | 1.7.3 | 协程支持 |
| Gradle | 8.5+ | 构建工具 |

### Web 前端依赖（可选）

| 依赖 | 版本 | 说明 |
|------|------|------|
| React | 18.x | UI 框架 |
| TypeScript | 5.x | 类型系统 |
| Vite | 5.x | 构建工具 |
| Node.js | 20.x LTS | 运行环境 |

---

## 💾 磁盘空间需求

| 组件 | 所需空间 | 说明 |
|------|----------|------|
| JDK 17 | ~300 MB | Java 运行环境 |
| PostgreSQL 18 | ~200 MB | 数据库 |
| IntelliJ IDEA | ~1.5 GB | IDE + 缓存 |
| Android Studio | ~3 GB | IDE + SDK + 模拟器 |
| 项目文件 | ~500 MB | 源代码 + 依赖 |
| Gradle 缓存 | ~1 GB | 构建缓存 |
| **总计** | **~6.5 GB** | 建议预留 10 GB |

---

## 🌐 网络要求

### 首次安装需要下载
- JDK: ~200 MB
- PostgreSQL: ~150 MB
- IntelliJ IDEA: ~800 MB
- Android Studio: ~1 GB
- Android SDK 组件: ~2 GB
- Gradle 依赖（后端）: ~200 MB
- Gradle 依赖（Android）: ~500 MB

**总下载量**: ~5 GB

**建议**：
- 使用稳定的网络连接
- 首次构建可能需要 30-60 分钟
- 如果在中国，考虑配置镜像加速

---

## 🔄 版本兼容性

### 操作系统
- ✅ Windows 10/11 (64-bit)
- ✅ macOS 10.14+
- ✅ Linux (Ubuntu 20.04+)

### JDK 版本
- ✅ JDK 17 (推荐)
- ✅ JDK 18, 19, 20, 21 (兼容)
- ❌ JDK 11 或更低 (不兼容)

### PostgreSQL 版本
- ✅ PostgreSQL 18 (推荐)
- ✅ PostgreSQL 15, 16, 17 (兼容)
- ⚠️ PostgreSQL 14 或更低 (可能兼容，未测试)

### Android SDK
- ✅ API 34 (Android 14) - 推荐
- ✅ API 33 (Android 13) - 推荐
- ✅ API 32 (Android 12L) - 兼容
- ⚠️ API 31 或更低 - 可能需要调整 minSdk

---

## 📝 安装顺序建议

**推荐按以下顺序安装**：

1. **JDK 17** - 其他工具依赖它
2. **PostgreSQL 18** - 后端需要数据库
3. **IntelliJ IDEA** - 开发后端
4. **Android Studio** - 开发 Android 应用
5. **Git** - 版本控制（可选）
6. **Node.js** - Web 前端（可选）
7. **VS Code** - Web 前端（可选）

---

## 🎯 最小化安装（仅核心功能）

如果只想运行项目，不做开发：

**必需**：
- JDK 17
- PostgreSQL 18
- IntelliJ IDEA（运行后端）
- Android Studio（运行 Android 应用）

**不需要**：
- Git（如果直接复制项目文件）
- Node.js（如果不开发 Web 前端）
- VS Code（如果不开发 Web 前端）

---

## 🚀 快速验证命令

安装完所有工具后，运行这些命令验证：

```bash
# 验证 Java
java -version

# 验证 PostgreSQL
psql --version

# 验证 Git
git --version

# 验证 Node.js（可选）
node --version
npm --version
```

---

**文档版本**：1.0  
**最后更新**：2025-12-23
