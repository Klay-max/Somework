# 🎓 学习应用 - Learning App

一个功能完整的学习平台，包含Android学生端、Spring Boot后端服务和React管理后台。

## 📱 项目概述

这是一个基于现代技术栈的智能学习应用，支持：
- 📚 课程浏览和学习
- 📊 学习进度跟踪
- 🎯 练习题和错题库
- 🤖 AI智能答疑（规划中）
- 📴 离线学习（规划中）

## 🚀 快速开始

### ⚡ 三步启动

1. **启动后端**
   ```bash
   # 确保PostgreSQL已运行
   # 创建数据库：CREATE DATABASE learningapp;
   cd backend
   gradle bootRun
   ```

2. **配置Android**
   ```kotlin
   // 更新 NetworkModule.kt 中的BASE_URL
   private const val BASE_URL = "http://10.0.2.2:8080/" // 模拟器
   ```

3. **运行应用**
   - 在Android Studio中打开 `android-app`
   - 运行应用
   - 使用测试账号登录：`student` / `password123`

### 📚 详细文档

- **[QUICK_START.md](QUICK_START.md)** ⭐ 快速启动指南（推荐从这里开始）
- **[MVP_GUIDE.md](MVP_GUIDE.md)** - MVP功能说明
- **[MVP_CHECKLIST.md](MVP_CHECKLIST.md)** - 完整检查清单

## 🏗️ 技术栈

| 层级 | 技术 |
|------|------|
| **后端** | Spring Boot 3.x, Kotlin, PostgreSQL, JWT |
| **Android** | Jetpack Compose, Kotlin Coroutines, Room, Retrofit, Koin |
| **Web** | React 18, TypeScript, Ant Design |

## ✅ 功能状态

### 已完成 (MVP)
- ✅ 用户认证
- ✅ 课程浏览
- ✅ 学习内容展示
- ✅ 进度跟踪

### 开发中
- 🔄 练习题功能
- 🔄 错题库

### 规划中
- 📋 AI答疑
- 📋 离线学习
- 📋 通知推送

## 🧪 测试账号

| 用户名 | 密码 | 角色 |
|--------|------|------|
| student | password123 | 学生 |
| admin | password123 | 管理员 |

## 📂 项目结构

```
├── backend/          # Spring Boot后端
├── android-app/      # Android应用
├── web-admin/        # React管理后台
└── .kiro/specs/      # 项目文档
```

## 📖 文档导航

- 🚀 [快速启动](QUICK_START.md) - 从这里开始
- 📋 [MVP指南](MVP_GUIDE.md) - 功能说明
- ✅ [检查清单](MVP_CHECKLIST.md) - 启动步骤
- 📝 [需求文档](.kiro/specs/learning-app/requirements.md)
- 🎨 [设计文档](.kiro/specs/learning-app/design.md)
- 📊 [任务列表](.kiro/specs/learning-app/tasks.md)

## 🎯 核心流程

```
登录 → 浏览课程 → 查看详情 → 开始学习 → 标记完成
```

## 🛠️ 开发命令

```bash
# 后端
cd backend && gradle bootRun

# Android
cd android-app && ./gradlew assembleDebug

# Web
cd web-admin && npm run dev
```

## 📄 许可证

MIT License

---

**立即开始：** 查看 [QUICK_START.md](QUICK_START.md) 🚀
