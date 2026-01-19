# Android 构建失败 - 路径中文字符问题

## 问题根源

你的项目路径包含中文字符：
```
D:\桌面文件\作品集\project-root-ai evaluation
```

Kotlin 编译器在处理路径时将中文字符转义成 Unicode（`\u684Cu9762u6587u4EF6`），导致无法找到源文件。

## 解决方案

### 方案 1：移动项目到英文路径（推荐）

1. **创建新的英文路径目录**：
   ```
   D:\Projects\ai-exam-assessment
   ```

2. **复制整个项目**：
   - 打开文件资源管理器
   - 复制当前项目文件夹
   - 粘贴到 `D:\Projects\ai-exam-assessment`

3. **在新路径中打开 Android Studio**：
   - 关闭当前 Android Studio
   - 打开 Android Studio
   - 选择 "Open" → 选择 `D:\Projects\ai-exam-assessment\android`

4. **构建项目**：
   ```cmd
   cd D:\Projects\ai-exam-assessment\android
   gradlew assembleDebug
   ```

### 方案 2：使用 subst 命令创建虚拟驱动器

如果不想移动项目，可以创建一个虚拟驱动器：

1. **创建虚拟驱动器**（以管理员身份运行 CMD）：
   ```cmd
   subst P: "D:\桌面文件\作品集\project-root-ai evaluation"
   ```

2. **使用虚拟驱动器路径**：
   ```cmd
   cd P:\android
   gradlew assembleDebug
   ```

3. **在 Android Studio 中打开**：
   - 关闭当前项目
   - 打开 `P:\android`

4. **删除虚拟驱动器**（完成后）：
   ```cmd
   subst P: /d
   ```

## 为什么会出现这个问题？

1. **Kotlin 编译器的限制**：Kotlin 编译器在处理文件路径时，会将非 ASCII 字符转义
2. **Gradle 的路径处理**：Gradle 在传递路径给编译器时，中文字符被转义成 `\uXXXX` 格式
3. **文件系统查找失败**：转义后的路径无法匹配实际的文件系统路径

## 推荐做法

**始终使用纯英文路径**用于开发项目，避免：
- 中文字符
- 特殊字符（除了 `-` 和 `_`）
- 空格（虽然通常可以工作，但可能导致其他问题）

良好的路径示例：
```
C:\Projects\my-app
D:\Dev\ai-exam-assessment
E:\workspace\android-projects
```

避免的路径示例：
```
D:\桌面文件\项目
C:\Users\用户名\Documents
D:\My Projects\App (空格可能有问题)
```

## 下一步

选择方案 1 或方案 2，然后重新构建项目。构建成功后，你就可以在 Android Studio 中运行应用了。
