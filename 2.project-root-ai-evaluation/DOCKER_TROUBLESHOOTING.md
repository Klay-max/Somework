# 🔧 Docker 网络问题解决方案

## 问题诊断

你遇到的错误表明 Docker 无法从 Docker Hub 下载镜像。这通常是由于网络连接问题。

---

## 解决方案

### 方案 1：配置 Docker 镜像加速器（推荐）

#### 1.1 打开 Docker Desktop 设置

1. 右键点击任务栏的 Docker 图标
2. 选择 "Settings"（设置）
3. 选择 "Docker Engine"

#### 1.2 添加镜像加速器

在 JSON 配置中添加以下内容：

```json
{
  "registry-mirrors": [
    "https://docker.m.daocloud.io",
    "https://docker.1panel.live",
    "https://hub.rat.dev"
  ]
}
```

#### 1.3 应用并重启

1. 点击 "Apply & Restart"
2. 等待 Docker 重启完成

#### 1.4 重新启动服务

```cmd
docker-compose --env-file .env.mock -f docker-compose.mock.yml up -d
```

---

### 方案 2：使用预构建的镜像

如果镜像加速器仍然无法解决问题，我们可以使用已经构建好的镜像。

#### 2.1 修改 docker-compose.mock.yml

将 `build` 部分改为使用预构建镜像：

```yaml
# 原来的配置
backend:
  build:
    context: ./backend
    dockerfile: Dockerfile

# 改为
backend:
  image: python:3.11-slim
  command: sh -c "pip install -r requirements.txt && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
```

---

### 方案 3：检查网络连接

#### 3.1 测试 Docker Hub 连接

```cmd
ping docker.io
```

#### 3.2 检查代理设置

如果你使用代理，需要在 Docker Desktop 中配置：

1. 打开 Docker Desktop 设置
2. 选择 "Resources" → "Proxies"
3. 配置你的代理服务器

---

### 方案 4：手动拉取镜像

尝试手动拉取所需的镜像：

```cmd
docker pull postgres:15-alpine
docker pull redis:7-alpine
docker pull python:3.11-slim
```

如果成功，再运行：

```cmd
docker-compose --env-file .env.mock -f docker-compose.mock.yml up -d
```

---

## 快速测试

配置完成后，测试 Docker 是否能正常拉取镜像：

```cmd
docker pull hello-world
docker run hello-world
```

如果看到 "Hello from Docker!" 消息，说明配置成功。

---

## 仍然无法解决？

如果以上方案都无法解决，可以考虑：

1. **使用本地 Python 运行**
   - 查看 `LOCAL_PYTHON_SETUP.md`
   - 不需要 Docker，直接在本地运行

2. **使用云端部署**
   - 查看 `AWS_EC2_DEPLOYMENT_GUIDE.md`
   - 在云端运行，避免本地网络问题

---

## 常见错误

### 错误 1: "dial tcp: i/o timeout"
**原因**：网络连接超时
**解决**：配置镜像加速器（方案 1）

### 错误 2: "failed to fetch oauth token"
**原因**：无法连接到 Docker Hub
**解决**：检查网络连接和代理设置（方案 3）

### 错误 3: "EOF"
**原因**：下载中断
**解决**：重试或使用镜像加速器

---

## 下一步

1. 选择一个方案尝试
2. 配置完成后重新运行启动命令
3. 如果成功，继续访问 http://localhost:8000/docs

需要帮助？告诉我你遇到的具体错误！
