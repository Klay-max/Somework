# 🚀 AWS EC2 部署完整指南

## 目标
将 AI 试卷拍照测评工具部署到 AWS EC2，让 Android 手机可以直接使用。

**预计时间**: 30-60 分钟  
**预计成本**: $30-40/月（约 ¥200-280/月）

---

## 💡 重要提示

**如果你想先免费测试，不想花钱购买 API 服务**，请查看 `LOCAL_MOCK_DEPLOYMENT_GUIDE.md`，那里有完整的本地 Mock 版本部署指南，完全免费！

本指南适用于需要部署到云端、使用真实 API 的场景。

---

## 📋 准备工作

### 1. 需要的账号和密钥

**必需**：
- [ ] AWS 账号（需要信用卡）
- [ ] 百度 OCR API 密钥（或腾讯云 OCR）
- [ ] DeepSeek API 密钥
- [ ] 阿里云 OSS 配置（或 AWS S3）

**可选**：
- [ ] 短信服务密钥（阿里云/腾讯云）
- [ ] 域名（可选，用 IP 也行）

**💰 成本说明**：
- AWS EC2 (t3.medium): 约 ¥240/月
- API 服务（小规模使用）: 约 ¥40/月
- 总计: 约 ¥280/月

### 2. 本地工具

- [ ] SSH 客户端（Windows 自带，或用 PuTTY）
- [ ] 文本编辑器（记事本就行）

---

## 🎬 第一步：创建 AWS 账号

### 1.1 注册 AWS 账号

1. 访问：https://aws.amazon.com/
2. 点击 "创建 AWS 账户"
3. 填写邮箱、密码、账户名称
4. 填写联系信息（可以用中文）
5. 绑定信用卡（会扣 $1 验证，之后退回）
6. 选择支持计划：选择 "基本支持 - 免费"

**注意**：
- 新用户有 12 个月免费额度（t2.micro）
- 我们会用 t3.medium（更稳定），约 $30-40/月

### 1.2 登录 AWS 控制台

1. 访问：https://console.aws.amazon.com/
2. 输入邮箱和密码登录
3. 选择区域：右上角选择 "亚太地区（新加坡）" 或 "亚太地区（东京）"
   - 新加坡：延迟低，适合中国用户
   - 东京：速度快，但稍贵

---

## 🖥️ 第二步：创建 EC2 实例

### 2.1 启动 EC2 实例

1. 在 AWS 控制台搜索 "EC2"
2. 点击 "启动实例"（Launch Instance）

### 2.2 配置实例

**步骤 1：选择名称和标签**
- 名称：`exam-ai-backend`

**步骤 2：选择操作系统**
- 应用程序和操作系统映像：选择 **Ubuntu Server 22.04 LTS**
- 架构：64 位 (x86)

**步骤 3：选择实例类型**
- 实例类型：选择 **t3.medium**
  - 2 vCPU
  - 4 GB 内存
  - 约 $30-40/月

**为什么不用免费的 t2.micro？**
- t2.micro 只有 1GB 内存，运行 Docker 会很卡
- t3.medium 性能稳定，适合生产使用

**步骤 4：密钥对（重要！）**
- 点击 "创建新密钥对"
- 密钥对名称：`exam-ai-key`
- 密钥对类型：RSA
- 私有密钥文件格式：`.pem`（Mac/Linux）或 `.ppk`（Windows PuTTY）
- 点击 "创建密钥对"
- **重要**：下载的 `.pem` 文件保存好，丢了就连不上服务器了！

**步骤 5：网络设置**
- 防火墙（安全组）：创建新的安全组
- 安全组名称：`exam-ai-security-group`
- 勾选以下选项：
  - ✅ 允许来自互联网的 SSH 流量
  - ✅ 允许来自互联网的 HTTPS 流量
  - ✅ 允许来自互联网的 HTTP 流量

**步骤 6：配置存储**
- 大小：**30 GB**（免费额度内）
- 卷类型：gp3（通用型 SSD）

**步骤 7：高级详细信息**
- 保持默认即可

### 2.3 启动实例

1. 点击右侧 "启动实例"
2. 等待 2-3 分钟，实例状态变为 "正在运行"
3. 记录实例的 **公有 IPv4 地址**（例如：`3.1.123.45`）

---

## 🔐 第三步：连接到 EC2 实例

### 3.1 Windows 用户

**方法 1：使用 Windows 自带 SSH（推荐）**

1. 打开 PowerShell 或 CMD
2. 找到下载的 `.pem` 文件路径
3. 运行以下命令：

```powershell
# 设置密钥文件权限（只需要第一次）
icacls "C:\path\to\exam-ai-key.pem" /inheritance:r
icacls "C:\path\to\exam-ai-key.pem" /grant:r "%username%:R"

# 连接到 EC2（替换 IP 地址）
ssh -i "C:\path\to\exam-ai-key.pem" ubuntu@3.1.123.45
```

**方法 2：使用 PuTTY**

1. 下载 PuTTY：https://www.putty.org/
2. 使用 PuTTYgen 转换 `.pem` 到 `.ppk`
3. 在 PuTTY 中配置：
   - Host Name: `ubuntu@3.1.123.45`
   - Port: 22
   - Connection → SSH → Auth → Private key: 选择 `.ppk` 文件
4. 点击 "Open" 连接

### 3.2 Mac/Linux 用户

```bash
# 设置密钥文件权限（只需要第一次）
chmod 400 ~/Downloads/exam-ai-key.pem

# 连接到 EC2（替换 IP 地址）
ssh -i ~/Downloads/exam-ai-key.pem ubuntu@3.1.123.45
```

### 3.3 首次连接

- 看到提示 "Are you sure you want to continue connecting?"
- 输入 `yes` 并回车
- 成功连接后，你会看到 Ubuntu 的欢迎信息

---

## 📦 第四步：安装 Docker 和 Docker Compose

连接到 EC2 后，依次运行以下命令：

### 4.1 更新系统

```bash
sudo apt update
sudo apt upgrade -y
```

### 4.2 安装 Docker

```bash
# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 将当前用户添加到 docker 组
sudo usermod -aG docker ubuntu

# 启动 Docker
sudo systemctl start docker
sudo systemctl enable docker

# 验证安装
docker --version
```

### 4.3 安装 Docker Compose

```bash
# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# 添加执行权限
sudo chmod +x /usr/local/bin/docker-compose

# 验证安装
docker-compose --version
```

### 4.4 重新登录

```bash
# 退出当前会话
exit

# 重新连接（使用之前的 SSH 命令）
ssh -i "path/to/exam-ai-key.pem" ubuntu@3.1.123.45
```

---

## 📂 第五步：上传项目代码

### 5.1 在本地打包项目

**Windows 用户**：
```powershell
# 在项目根目录
tar -czf exam-ai-backend.tar.gz backend docker-compose.prod.yml nginx scripts .env.example
```

**Mac/Linux 用户**：
```bash
# 在项目根目录
tar -czf exam-ai-backend.tar.gz backend docker-compose.prod.yml nginx scripts .env.example
```

### 5.2 上传到 EC2

**Windows 用户**：
```powershell
scp -i "C:\path\to\exam-ai-key.pem" exam-ai-backend.tar.gz ubuntu@3.1.123.45:~
```

**Mac/Linux 用户**：
```bash
scp -i ~/Downloads/exam-ai-key.pem exam-ai-backend.tar.gz ubuntu@3.1.123.45:~
```

### 5.3 在 EC2 上解压

```bash
# 连接到 EC2
ssh -i "path/to/exam-ai-key.pem" ubuntu@3.1.123.45

# 解压文件
tar -xzf exam-ai-backend.tar.gz

# 查看文件
ls -la
```

---

## ⚙️ 第六步：配置环境变量

### 6.1 创建 .env 文件

```bash
# 复制示例文件
cp .env.example .env

# 编辑配置文件
nano .env
```

### 6.2 填写配置（重要！）

在 nano 编辑器中，修改以下内容：

```bash
# 数据库配置
POSTGRES_USER=examai
POSTGRES_PASSWORD=your_strong_password_here  # 改成强密码
POSTGRES_DB=examai
DATABASE_URL=postgresql://examai:your_strong_password_here@postgres:5432/examai

# Redis 配置
REDIS_PASSWORD=your_redis_password_here  # 改成强密码
REDIS_URL=redis://:your_redis_password_here@redis:6379/0

# 应用配置
SECRET_KEY=your_secret_key_here  # 改成随机字符串（至少32位）
JWT_SECRET_KEY=your_jwt_secret_here  # 改成随机字符串（至少32位）

# API 密钥（必需）
BAIDU_OCR_API_KEY=your_baidu_api_key  # 百度 OCR API Key
BAIDU_OCR_SECRET_KEY=your_baidu_secret_key  # 百度 OCR Secret Key
DEEPSEEK_API_KEY=your_deepseek_api_key  # DeepSeek API Key

# 阿里云 OSS（必需）
ALIYUN_OSS_ACCESS_KEY_ID=your_oss_access_key
ALIYUN_OSS_ACCESS_KEY_SECRET=your_oss_secret_key
ALIYUN_OSS_BUCKET=your_bucket_name
ALIYUN_OSS_ENDPOINT=oss-cn-hangzhou.aliyuncs.com

# 短信服务（可选）
SMS_ACCESS_KEY_ID=your_sms_access_key
SMS_ACCESS_KEY_SECRET=your_sms_secret_key
```

**保存文件**：
- 按 `Ctrl + X`
- 按 `Y` 确认
- 按 `Enter` 保存

### 6.3 生成随机密钥

如果不知道怎么生成随机密钥，运行：

```bash
# 生成 SECRET_KEY
openssl rand -hex 32

# 生成 JWT_SECRET_KEY
openssl rand -hex 32
```

复制输出的字符串，粘贴到 `.env` 文件中。

---

## 🚀 第七步：启动服务

### 7.1 启动 Docker Compose

```bash
# 启动所有服务
docker-compose -f docker-compose.prod.yml up -d

# 查看服务状态
docker-compose -f docker-compose.prod.yml ps
```

### 7.2 查看日志

```bash
# 查看所有服务日志
docker-compose -f docker-compose.prod.yml logs -f

# 查看特定服务日志
docker-compose -f docker-compose.prod.yml logs -f backend
```

### 7.3 运行数据库迁移

```bash
# 进入后端容器
docker-compose -f docker-compose.prod.yml exec backend bash

# 运行迁移
cd /app
alembic upgrade head

# 退出容器
exit
```

---

## ✅ 第八步：验证部署

### 8.1 检查服务状态

```bash
# 检查所有容器是否运行
docker-compose -f docker-compose.prod.yml ps

# 应该看到以下服务都是 "Up" 状态：
# - nginx
# - backend (3个副本)
# - postgres
# - redis
# - celery-worker
# - celery-beat
# - prometheus
# - grafana
```

### 8.2 测试 API

```bash
# 测试健康检查
curl http://localhost/health

# 应该返回：{"status":"ok"}
```

### 8.3 从外部访问

在浏览器中访问：
- API: `http://你的EC2公网IP/health`
- Grafana: `http://你的EC2公网IP:3000`（用户名：admin，密码：admin）

---

## 📱 第九步：配置 Android 应用

### 9.1 修改 Android 配置

在 Android 项目中，找到 API 配置文件，修改 BASE_URL：

```kotlin
// android/app/src/main/java/com/examai/data/remote/api/ApiConfig.kt
object ApiConfig {
    const val BASE_URL = "http://你的EC2公网IP/"  // 改成你的 EC2 IP
}
```

### 9.2 编译 APK

1. 打开 Android Studio
2. 打开项目：`android/`
3. 菜单：Build → Build Bundle(s) / APK(s) → Build APK(s)
4. 等待编译完成
5. APK 位置：`android/app/build/outputs/apk/debug/app-debug.apk`

### 9.3 安装到手机

1. 将 APK 传输到手机
2. 在手机上安装 APK
3. 打开应用，开始使用！

---

## 🔒 第十步：配置 HTTPS（可选但推荐）

### 10.1 获取域名

如果你有域名，可以配置 HTTPS：

1. 在域名提供商添加 A 记录
2. 指向你的 EC2 公网 IP

### 10.2 安装 SSL 证书

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取证书（替换你的域名）
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

---

## 💰 成本估算

### 每月成本

**EC2 实例**：
- t3.medium: ~$30-40/月

**存储**：
- 30 GB EBS: ~$3/月

**流量**：
- 前 1 GB 免费
- 之后 $0.09/GB

**总计**：约 $35-45/月（¥240-310/月）

### 节省成本的方法

1. **使用预留实例**：提前付费，节省 30-40%
2. **使用 Spot 实例**：便宜 70%，但可能被中断
3. **关闭不用的服务**：Grafana、Prometheus 可以按需启动

---

## 🛠️ 常见问题

### Q1: 连接不上 EC2？
- 检查安全组是否开放 22 端口（SSH）
- 检查密钥文件权限是否正确
- 检查 IP 地址是否正确

### Q2: Docker 启动失败？
- 检查 `.env` 文件配置是否正确
- 查看日志：`docker-compose logs`
- 检查磁盘空间：`df -h`

### Q3: Android 连接不上后端？
- 检查安全组是否开放 80 端口（HTTP）
- 检查 EC2 公网 IP 是否正确
- 检查后端服务是否运行：`docker-compose ps`

### Q4: 成本太高？
- 可以用 t3.small（$15-20/月）
- 关闭不必要的监控服务
- 使用 Spot 实例

---

## 📞 需要帮助？

如果遇到问题，告诉我：
1. 在哪一步遇到问题
2. 错误信息是什么
3. 运行了什么命令

我会帮你解决！

---

**部署完成！** 🎉

现在你的 AI 试卷拍照测评工具已经在云端运行了，可以用手机直接使用！
