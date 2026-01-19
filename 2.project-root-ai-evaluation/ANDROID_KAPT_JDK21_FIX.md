# Android KAPT JDK 21 兼容性修复

## 问题描述
KAPT (Kotlin Annotation Processing Tool) 与 JDK 17+ 的模块系统不兼容，导致编译失败：
```
java.lang.IllegalAccessError: class org.jetbrains.kotlin.kapt3.base.javac.KaptJavaCompiler 
cannot access class com.sun.tools.javac.main.JavaCompiler because module jdk.compiler 
does not export com.sun.tools.javac.main to unnamed module
```

## 根本原因
- Android Studio 使用 JDK 21
- KAPT 需要访问 JDK 内部 API (`com.sun.tools.javac.*`)
- JDK 17+ 的模块系统默认不允许访问这些内部 API

## 解决方案

### 方法 1：在 Android Studio 中配置（推荐）

1. **打开 Gradle 设置**
   - File → Settings → Build, Execution, Deployment → Build Tools → Gradle

2. **配置 Gradle JVM 参数**
   - 在 "Gradle JVM" 下方找到 "Gradle VM options"
   - 添加以下参数：
   ```
   --add-opens=jdk.compiler/com.sun.tools.javac.main=ALL-UNNAMED
   --add-opens=jdk.compiler/com.sun.tools.javac.code=ALL-UNNAMED
   --add-opens=jdk.compiler/com.sun.tools.javac.comp=ALL-UNNAMED
   --add-opens=jdk.compiler/com.sun.tools.javac.file=ALL-UNNAMED
   --add-opens=jdk.compiler/com.sun.tools.javac.jvm=ALL-UNNAMED
   --add-opens=jdk.compiler/com.sun.tools.javac.parser=ALL-UNNAMED
   --add-opens=jdk.compiler/com.sun.tools.javac.processing=ALL-UNNAMED
   --add-opens=jdk.compiler/com.sun.tools.javac.tree=ALL-UNNAMED
   --add-opens=jdk.compiler/com.sun.tools.javac.util=ALL-UNNAMED
   ```

3. **重启 Gradle Daemon**
   - 在 Terminal 中运行：
   ```powershell
   cd android
   .\gradlew --stop
   ```

4. **同步项目**
   - 点击 "Sync Project with Gradle Files"

### 方法 2：使用命令行构建

如果你想通过命令行构建，可以使用以下命令：

```powershell
cd android
$env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"
.\gradlew clean assembleDebug
```

### 方法 3：迁移到 KSP（长期解决方案）

KAPT 已被 Google 标记为维护模式，推荐迁移到 KSP (Kotlin Symbol Processing)：

1. **更新 `build.gradle.kts`**
   ```kotlin
   plugins {
       // 移除: kotlin("kapt")
       id("com.google.devtools.ksp") version "1.9.20-1.0.14"
   }
   
   dependencies {
       // 将所有 kapt() 改为 ksp()
       ksp("com.google.dagger:hilt-compiler:2.48")
       ksp("androidx.room:room-compiler:2.6.1")
       ksp("androidx.hilt:hilt-compiler:1.1.0")
   }
   ```

2. **移除 KAPT 配置**
   ```kotlin
   // 删除这个块
   kapt {
       correctErrorTypes = true
   }
   ```

## 验证修复

修复后，运行以下命令验证：

```powershell
cd android
.\gradlew assembleDebug
```

应该看到：
```
BUILD SUCCESSFUL in Xs
```

## 当前状态

- ✅ JVM 参数已添加到 `android/gradle.properties`
- ⚠️ 需要在 Android Studio 中手动配置或重启 Gradle Daemon
- 📝 建议：考虑迁移到 KSP 以获得更好的性能和兼容性

## 参考资料

- [KAPT JDK 16+ 兼容性问题](https://youtrack.jetbrains.com/issue/KT-45545)
- [迁移到 KSP](https://developer.android.com/studio/build/migrate-to-ksp)
- [Hilt KSP 支持](https://dagger.dev/dev-guide/ksp)
