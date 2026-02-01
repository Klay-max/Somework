# 📋 如何查看 EAS 构建日志

## 🎯 目的

查看 Android APK 构建失败的详细错误信息，找出问题根源。

---

## 🌐 方法 1：通过浏览器访问（推荐）

### 步骤 1：打开构建页面

**最新构建的链接**：

1. **Build #2**（删除 android 目录后）：
   ```
   https://expo.dev/accounts/klay215/projects/anfudao/builds/46cdfb44-5297-4293-916d-61b12c0fcae0
   ```

2. **Build #1**（有 android 目录）：
   ```
   https://expo.dev/accounts/klay215/projects/anfudao/builds/cd76f0dd-8286-4b54-861e-3d6af4153ef7
   ```

### 步骤 2：登录 Expo 账号

如果还没登录，会提示你登录：
- **邮箱**：darwin152140@gmail.com
- **密码**：（你的密码）

### 步骤 3：查看构建详情

页面会显示：
- ✅ 构建状态（成功/失败）
- 📊 构建时间
- 📝 构建日志
- 🔧 构建配置

### 步骤 4：找到错误信息

1. **滚动到失败的阶段**
   - 通常是 "Run gradlew" 阶段
   - 会显示红色的 ❌ 标记

2. **展开日志**
   - 点击失败的阶段
   - 查看完整的错误输出

3. **查找关键错误**
   - 搜索 "ERROR"
   - 搜索 "FAILURE"
   - 搜索 "Exception"

### 步骤 5：复制错误信息

- 选中错误文本
- 复制（Ctrl+C）
- 发给我分析

---

## 💻 方法 2：通过命令行查看

### 使用 EAS CLI

```bash
# 查看最新构建的日志
eas build:view

# 查看特定构建的日志
eas build:view --id 46cdfb44-5297-4293-916d-61b12c0fcae0
```

### 查看所有构建

```bash
# 列出所有构建
eas build:list

# 查看 Android 构建
eas build:list --platform android
```

---

## 🔍 常见错误类型

### 1. Gradle 配置错误

**特征**：
```
FAILURE: Build failed with an exception.
* What went wrong:
...
```

**可能原因**：
- Gradle 版本不兼容
- 依赖版本冲突
- 配置文件错误

### 2. 依赖下载失败

**特征**：
```
Could not resolve all dependencies
Could not download ...
```

**可能原因**：
- 网络问题
- 依赖不存在
- 版本号错误

### 3. 编译错误

**特征**：
```
Compilation failed
error: ...
```

**可能原因**：
- 代码语法错误
- 类型不匹配
- 缺少导入

### 4. 内存不足

**特征**：
```
OutOfMemoryError
Java heap space
```

**可能原因**：
- 项目太大
- Gradle 内存配置不足

---

## 📸 截图指南

如果你想发截图给我：

### 需要截图的内容

1. **构建概览**
   - 显示构建状态的页面
   - 包含构建 ID 和时间

2. **失败阶段**
   - "Run gradlew" 阶段的完整日志
   - 红色错误信息

3. **错误详情**
   - 具体的错误堆栈
   - 前后几行的上下文

### 截图技巧

- 使用 Windows 截图工具（Win + Shift + S）
- 确保文字清晰可读
- 包含足够的上下文信息

---

## 🎯 快速操作指南

### 现在就查看日志

1. **打开浏览器**

2. **访问这个链接**：
   ```
   https://expo.dev/accounts/klay215/projects/anfudao/builds/46cdfb44-5297-4293-916d-61b12c0fcae0
   ```

3. **登录账号**（如果需要）

4. **找到 "Run gradlew" 阶段**

5. **展开查看完整日志**

6. **复制错误信息**

7. **发给我分析**

---

## 📝 我需要的信息

请提供以下信息：

### 1. 错误类型
```
例如：
- Gradle build failed
- Dependency resolution failed
- Compilation error
```

### 2. 错误信息
```
完整的错误堆栈，例如：
FAILURE: Build failed with an exception.

* What went wrong:
Execution failed for task ':app:mergeReleaseResources'.
> ...
```

### 3. 失败阶段
```
例如：
- Install dependencies
- Run gradlew
- Upload artifacts
```

### 4. 构建配置
```
- Expo SDK 版本
- React Native 版本
- 使用的构建配置（preview/development/production）
```

---

## 🔧 根据错误类型的解决方案

### 如果是 Gradle 版本问题

**解决方案**：
1. 更新 `android/gradle/wrapper/gradle-wrapper.properties`
2. 或者在 `eas.json` 中指定 Gradle 版本

### 如果是依赖冲突

**解决方案**：
1. 运行 `npx expo-doctor`
2. 更新不兼容的依赖
3. 或者降级到稳定版本

### 如果是内存不足

**解决方案**：
1. 在 `eas.json` 中增加构建资源
2. 或者使用 `large` 构建类型

### 如果是代码错误

**解决方案**：
1. 修复代码中的错误
2. 确保所有导入正确
3. 运行本地测试

---

## 💡 提示

### 快速定位错误

1. **搜索关键词**
   - 在日志中搜索 "ERROR"
   - 搜索 "FAILURE"
   - 搜索 "Exception"

2. **查看最后几行**
   - 错误通常在日志末尾
   - 向上滚动查看完整堆栈

3. **注意红色文本**
   - EAS 会用红色标记错误
   - 重点关注这些部分

### 常用搜索词

```
ERROR
FAILURE
Exception
failed
error:
Could not
Unable to
```

---

## 📞 需要帮助？

如果你：
- 找不到构建页面
- 看不懂错误信息
- 不知道如何修复

**请告诉我**：
1. 你看到了什么错误
2. 错误出现在哪个阶段
3. 完整的错误信息（复制粘贴）

我会帮你分析并提供解决方案！

---

## 🎯 下一步

查看日志后，我们可以：

1. **分析错误原因**
2. **制定修复方案**
3. **调整构建配置**
4. **重新构建 APK**

---

**现在就去查看吧！** 👆

打开这个链接：
```
https://expo.dev/accounts/klay215/projects/anfudao/builds/46cdfb44-5297-4293-916d-61b12c0fcae0
```

找到错误信息后告诉我！
