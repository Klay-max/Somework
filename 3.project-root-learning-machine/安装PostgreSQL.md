# 📦 安装PostgreSQL指南

## ⚠️ 当前状态
PostgreSQL未安装。需要先安装PostgreSQL才能继续测试。

---

## 🔽 下载PostgreSQL

### 方式1：官方安装包（推荐）

1. **访问下载页面**：
   ```
   https://www.postgresql.org/download/windows/
   ```

2. **点击 "Download the installer"**

3. **选择版本**：
   - 推荐：PostgreSQL 15 或 16
   - 选择 Windows x86-64 版本

4. **下载完成后，双击安装包**

---

## 📝 安装步骤

### 步骤1：启动安装程序
- 双击下载的 `.exe` 文件
- 点击 "Next"

### 步骤2：选择安装目录
- 默认路径：`C:\Program Files\PostgreSQL\15`
- 可以保持默认，点击 "Next"

### 步骤3：选择组件
**全部勾选**（推荐）：
- ✅ PostgreSQL Server（数据库服务器）
- ✅ pgAdmin 4（图形化管理工具）
- ✅ Stack Builder（可选）
- ✅ Command Line Tools（命令行工具）

点击 "Next"

### 步骤4：选择数据目录
- 默认路径：`C:\Program Files\PostgreSQL\15\data`
- 保持默认，点击 "Next"

### 步骤5：设置密码 ⚠️ 重要！
- **输入密码**：`klay9873210`（与项目配置一致）
- **确认密码**：`klay9873210`
- **记住这个密码！**

点击 "Next"

### 步骤6：设置端口
- 默认端口：`5432`
- 保持默认，点击 "Next"

### 步骤7：选择区域设置
- 默认：`[Default locale]`
- 保持默认，点击 "Next"

### 步骤8：确认安装
- 检查所有设置
- 点击 "Next" 开始安装

### 步骤9：等待安装
- 安装过程需要3-5分钟
- 不要关闭窗口

### 步骤10：完成安装
- 取消勾选 "Launch Stack Builder at exit"（可选）
- 点击 "Finish"

---

## ✅ 验证安装

### 方法1：使用pgAdmin（图形界面）

1. **打开pgAdmin 4**
   - 在开始菜单搜索 "pgAdmin"
   - 双击打开

2. **首次启动设置**
   - 设置主密码（可以与PostgreSQL密码相同）
   - 点击 "OK"

3. **连接到服务器**
   - 左侧展开 "Servers"
   - 点击 "PostgreSQL 15"
   - 输入密码：`klay9873210`
   - 勾选 "Save password"
   - 点击 "OK"

4. **如果成功连接** → PostgreSQL安装成功！✅

### 方法2：使用命令行

1. **打开新的PowerShell窗口**（重要：必须是新窗口）

2. **执行命令**：
   ```powershell
   psql --version
   ```

3. **应该显示**：
   ```
   psql (PostgreSQL) 15.x
   ```

**如果还是报错**：
- 关闭所有PowerShell窗口
- 重新打开PowerShell
- 再次执行 `psql --version`

**如果仍然报错**：需要手动添加环境变量（见下方）

---

## 🔧 配置环境变量（如果命令行不工作）

### 步骤1：打开环境变量设置
1. 右键 "此电脑" → "属性"
2. 点击 "高级系统设置"
3. 点击 "环境变量"

### 步骤2：编辑Path变量
1. 在 "系统变量" 中找到 "Path"
2. 点击 "编辑"
3. 点击 "新建"
4. 添加：`C:\Program Files\PostgreSQL\15\bin`
5. 点击 "确定"
6. 点击 "确定"
7. 点击 "确定"

### 步骤3：重启PowerShell
- 关闭所有PowerShell窗口
- 重新打开PowerShell
- 执行：`psql --version`

---

## 📊 创建数据库

安装完成后，创建项目需要的数据库：

### 方法1：使用pgAdmin（推荐，简单）

1. **打开pgAdmin 4**
2. **连接到PostgreSQL服务器**（输入密码：klay9873210）
3. **右键点击 "Databases"**
4. **选择 "Create" → "Database..."**
5. **输入数据库名称**：`learningapp`
6. **点击 "Save"**

✅ 数据库创建成功！

### 方法2：使用命令行

```powershell
# 连接到PostgreSQL
psql -U postgres

# 输入密码：klay9873210

# 创建数据库
CREATE DATABASE learningapp;

# 查看数据库列表
\l

# 退出
\q
```

---

## 🎯 完成后的下一步

PostgreSQL安装并创建数据库后：

1. ✅ **验证安装**：
   ```powershell
   psql --version
   ```

2. ✅ **验证数据库**：
   - 打开pgAdmin
   - 查看是否有 `learningapp` 数据库

3. ✅ **继续MVP测试**：
   - 返回 `开始测试.md`
   - 从 **步骤3️⃣** 开始（启动后端）

---

## ❌ 常见问题

### 问题1：安装失败 - 端口被占用

**错误**：Port 5432 is already in use

**解决**：
1. 可能已经安装了PostgreSQL
2. 检查服务：Win+R → 输入 `services.msc`
3. 查找 "postgresql" 服务
4. 如果存在，右键 → 启动

### 问题2：无法连接到服务器

**错误**：Connection refused

**解决**：
1. 打开服务管理器：Win+R → `services.msc`
2. 找到 "postgresql-x64-15" 服务
3. 右键 → 启动
4. 设置为自动启动

### 问题3：忘记密码

**解决**：
1. 需要重新安装PostgreSQL
2. 或者修改配置文件（较复杂）

---

## 📞 需要帮助？

如果安装过程中遇到问题：
1. 截图错误信息
2. 记录具体的错误提示
3. 检查是否有杀毒软件阻止安装

---

## ⏭️ 安装完成后

完成PostgreSQL安装和数据库创建后，请告诉我：

✅ "PostgreSQL安装完成"

然后我们继续进行后端启动测试！

