# 🎯 本地 Mock 版本部署指南（完全免费）

## 目标
在本地运行 AI 试卷拍照测评工具的 Mock 版本，不需要任何外部 API，完全免费。

**预计时间**: 15-30 分钟  
**预计成本**: ¥0（完全免费）

---

## 📋 准备工作

### 需要的软件

- [ ] Docker Desktop（Windows/Mac）或 Docker（Linux）
- [ ] Git（用于克隆代码）
- [ ] Android Studio（如果要测试 Android 应用）

### 不需要的东西

- ❌ 不需要 AWS 账号
- ❌ 不需要百度 OCR API
- ❌ 不需要 DeepSeek API
- ❌ 不需要阿里云 OSS
- ❌ 不需要短信服务
- ❌ 不需要信用卡

---

## 🚀 第一步：安装 Docker

### Windows 用户

1. 下载 Docker Desktop：https://www.docker.com/products/docker-desktop
2. 安装并启动 Docker Desktop
3. 验证安装：
   ```powershell
   docker --version
   docker-compose --version
   ```

### Mac 用户

1. 下载 Docker Desktop：https://www.docker.com/products/docker-desktop
2. 安装并启动 Docker Desktop
3. 验证安装：
   ```bash
   docker --version
   docker-compose --version
   ```

### Linux 用户

```bash
# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 验证安装
docker --version
docker-compose --version
```

---

## 📂 第二步：准备项目

### 2.1 进入项目目录

```bash
# 在项目根目录
cd /path/to/your/project
```

### 2.2 创建 Mock 环境配置

创建 `.env.mock` 文件：

```bash
# 复制示例文件
cp .env.example .env.mock
```

编辑 `.env.mock` 文件，使用以下配置：

```bash
# 数据库配置
POSTGRES_USER=examai
POSTGRES_PASSWORD=mock_password_123
POSTGRES_DB=examai
DATABASE_URL=postgresql://examai:mock_password_123@postgres:5432/examai

# Redis 配置
REDIS_PASSWORD=mock_redis_123
REDIS_URL=redis://:mock_redis_123@redis:6379/0

# 应用配置
SECRET_KEY=mock_secret_key_for_development_only_12345678
JWT_SECRET_KEY=mock_jwt_secret_key_for_development_only_12345678
ENVIRONMENT=development
LOG_LEVEL=debug

# Mock 模式（重要！）
USE_MOCK_SERVICES=true

# Mock API 密钥（随便填，不会真正使用）
BAIDU_OCR_API_KEY=mock_baidu_key
BAIDU_OCR_SECRET_KEY=mock_baidu_secret
DEEPSEEK_API_KEY=mock_deepseek_key
ALIYUN_OSS_ACCESS_KEY=mock_oss_key
ALIYUN_OSS_SECRET_KEY=mock_oss_secret
ALIYUN_OSS_BUCKET=mock_bucket
ALIYUN_OSS_ENDPOINT=mock_endpoint

# Grafana 配置
GRAFANA_USER=admin
GRAFANA_PASSWORD=admin
```

---

## 🐳 第三步：创建 Mock Docker Compose 配置

创建 `docker-compose.mock.yml` 文件：

```yaml
version: '3.8'

services:
  # PostgreSQL 数据库
  postgres:
    image: postgres:15-alpine
    container_name: exam_assessment_db_mock
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-examai}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB:-examai}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data_mock:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-examai}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app_network

  # Redis 缓存和队列
  redis:
    image: redis:7-alpine
    container_name: exam_assessment_redis_mock
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    ports:
      - "6379:6379"
    volumes:
      - redis_data_mock:/data
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app_network

  # FastAPI 后端（Mock 模式）
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: exam_assessment_backend_mock
    environment:
      - DATABASE_URL=postgresql+asyncpg://${POSTGRES_USER:-examai}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB:-examai}
      - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379/0
      - CELERY_BROKER_URL=redis://:${REDIS_PASSWORD}@redis:6379/1
      - CELERY_RESULT_BACKEND=redis://:${REDIS_PASSWORD}@redis:6379/2
      - SECRET_KEY=${SECRET_KEY}
      - JWT_SECRET_KEY=${JWT_SECRET_KEY}
      - ENVIRONMENT=development
      - LOG_LEVEL=debug
      - USE_MOCK_SERVICES=true
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
      - upload_files_mock:/app/uploads
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
    networks:
      - app_network

  # Celery Worker（Mock 模式）
  celery_worker:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: exam_assessment_celery_mock
    command: celery -A app.tasks.celery_app worker --loglevel=info --concurrency=2
    environment:
      - DATABASE_URL=postgresql+asyncpg://${POSTGRES_USER:-examai}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB:-examai}
      - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379/0
      - CELERY_BROKER_URL=redis://:${REDIS_PASSWORD}@redis:6379/1
      - CELERY_RESULT_BACKEND=redis://:${REDIS_PASSWORD}@redis:6379/2
      - SECRET_KEY=${SECRET_KEY}
      - ENVIRONMENT=development
      - USE_MOCK_SERVICES=true
    depends_on:
      - postgres
      - redis
    volumes:
      - ./backend:/app
      - upload_files_mock:/app/uploads
    networks:
      - app_network

volumes:
  postgres_data_mock:
  redis_data_mock:
  upload_files_mock:

networks:
  app_network:
    driver: bridge
```

---

## 🎭 第四步：创建 Mock 服务实现

### 4.1 创建 Mock OCR 服务

创建 `backend/app/services/ocr/mock_provider.py`：

```python
"""Mock OCR Provider for local development"""
from typing import List
import random
from .base import OCRProvider, OCRResult, TextRegion, BoundingBox


class MockOCRProvider(OCRProvider):
    """Mock OCR provider that returns simulated results"""
    
    def __init__(self):
        self.provider_name = "mock"
    
    async def recognize_text(self, image_path: str, detect_handwriting: bool = False) -> OCRResult:
        """Return mock OCR results"""
        
        # 模拟试卷文本
        mock_text = """
        2023-2024学年第一学期期末考试
        数学试卷
        年级：高一
        总分：150分
        
        一、选择题（每题5分，共50分）
        1. 下列函数中，在区间(0,+∞)上单调递增的是（  ）
        A. y = -x²  B. y = 1/x  C. y = 2^x  D. y = log₀.₅x
        
        2. 已知集合A={1,2,3}，B={2,3,4}，则A∩B=（  ）
        A. {1}  B. {2,3}  C. {1,2,3,4}  D. ∅
        
        二、填空题（每题5分，共30分）
        11. 函数f(x)=x²-2x+1的最小值为______
        
        12. 若log₂x=3，则x=______
        
        三、解答题（共70分）
        21. （15分）解方程：x²-5x+6=0
        
        22. （20分）已知函数f(x)=2x+1，求f(3)的值
        """
        
        # 模拟文本区域
        regions = []
        lines = mock_text.strip().split('\n')
        y_offset = 100
        
        for line in lines:
            if line.strip():
                regions.append(TextRegion(
                    text=line.strip(),
                    confidence=random.uniform(0.85, 0.99),
                    bounding_box=BoundingBox(
                        x=50,
                        y=y_offset,
                        width=800,
                        height=30
                    ),
                    text_type="printed" if not detect_handwriting else "handwritten"
                ))
                y_offset += 40
        
        return OCRResult(
            full_text=mock_text.strip(),
            regions=regions,
            confidence=random.uniform(0.90, 0.98),
            provider=self.provider_name
        )
```

### 4.2 创建 Mock DeepSeek 服务

创建 `backend/app/services/mock_deepseek_service.py`：

```python
"""Mock DeepSeek Service for local development"""
import random
from typing import Dict, Any, List


class MockDeepSeekService:
    """Mock DeepSeek service that returns simulated AI responses"""
    
    async def call_deepseek(self, prompt: str, **kwargs) -> Dict[str, Any]:
        """Return mock AI analysis results"""
        
        # 根据 prompt 类型返回不同的模拟结果
        if "知识点" in prompt or "knowledge" in prompt.lower():
            return self._mock_knowledge_points()
        elif "难度" in prompt or "difficulty" in prompt.lower():
            return self._mock_difficulty()
        elif "评分" in prompt or "score" in prompt.lower():
            return self._mock_scoring()
        elif "诊断" in prompt or "diagnostic" in prompt.lower():
            return self._mock_diagnostic()
        else:
            return self._mock_generic_response()
    
    def _mock_knowledge_points(self) -> Dict[str, Any]:
        """模拟知识点标注"""
        knowledge_points = [
            "函数单调性",
            "集合运算",
            "二次函数",
            "对数运算",
            "方程求解"
        ]
        return {
            "knowledge_points": random.sample(knowledge_points, k=random.randint(2, 4)),
            "confidence": random.uniform(0.85, 0.95)
        }
    
    def _mock_difficulty(self) -> Dict[str, Any]:
        """模拟难度估算"""
        difficulties = ["easy", "medium", "hard"]
        return {
            "difficulty": random.choice(difficulties),
            "score": random.uniform(0.3, 0.9),
            "reasoning": "基于题目类型和知识点复杂度的综合评估"
        }
    
    def _mock_scoring(self) -> Dict[str, Any]:
        """模拟主观题评分"""
        return {
            "score": random.randint(0, 20),
            "max_score": 20,
            "feedback": "解题思路正确，步骤完整，但部分计算有误",
            "confidence": random.uniform(0.75, 0.90)
        }
    
    def _mock_diagnostic(self) -> Dict[str, Any]:
        """模拟诊断分析"""
        return {
            "capability_dimensions": {
                "understanding": random.uniform(0.6, 0.9),
                "application": random.uniform(0.5, 0.85),
                "analysis": random.uniform(0.55, 0.88),
                "synthesis": random.uniform(0.5, 0.82),
                "evaluation": random.uniform(0.6, 0.87)
            },
            "surface_issues": [
                {
                    "issue": "计算粗心",
                    "frequency": random.randint(2, 5),
                    "evidence": ["第3题计算错误", "第7题符号错误"]
                },
                {
                    "issue": "审题不清",
                    "frequency": random.randint(1, 3),
                    "evidence": ["第5题理解偏差"]
                }
            ],
            "deep_issues": [
                {
                    "issue": "函数概念理解不深",
                    "severity": "medium",
                    "evidence": ["多道函数题失分", "单调性判断错误"],
                    "recommendation": "加强函数基础概念学习"
                },
                {
                    "issue": "逻辑推理能力欠缺",
                    "severity": "high",
                    "evidence": ["证明题思路不清", "推理过程跳跃"],
                    "recommendation": "系统训练逻辑推理"
                }
            ],
            "target_school_gap": {
                "current_level": "中等",
                "target_level": "重点",
                "gap_score": random.randint(15, 30),
                "improvement_areas": ["函数", "几何", "逻辑推理"]
            }
        }
    
    def _mock_generic_response(self) -> Dict[str, Any]:
        """通用模拟响应"""
        return {
            "result": "模拟分析结果",
            "confidence": random.uniform(0.80, 0.95),
            "details": "这是一个模拟的 AI 响应"
        }
```

### 4.3 创建 Mock 图片存储服务

创建 `backend/app/services/mock_storage_service.py`：

```python
"""Mock Storage Service for local development"""
import os
import shutil
from pathlib import Path


class MockStorageService:
    """Mock storage service that stores files locally"""
    
    def __init__(self, base_path: str = "/app/uploads"):
        self.base_path = Path(base_path)
        self.base_path.mkdir(parents=True, exist_ok=True)
    
    async def upload_file(self, file_path: str, destination: str) -> str:
        """Store file locally and return mock URL"""
        dest_path = self.base_path / destination
        dest_path.parent.mkdir(parents=True, exist_ok=True)
        
        # 复制文件
        shutil.copy2(file_path, dest_path)
        
        # 返回模拟 URL
        return f"http://localhost:8000/uploads/{destination}"
    
    async def download_file(self, url: str, local_path: str) -> str:
        """Download file from mock storage"""
        # 从 URL 提取文件路径
        file_path = url.replace("http://localhost:8000/uploads/", "")
        source_path = self.base_path / file_path
        
        if source_path.exists():
            shutil.copy2(source_path, local_path)
            return local_path
        else:
            raise FileNotFoundError(f"File not found: {url}")
    
    async def delete_file(self, url: str) -> bool:
        """Delete file from mock storage"""
        file_path = url.replace("http://localhost:8000/uploads/", "")
        full_path = self.base_path / file_path
        
        if full_path.exists():
            full_path.unlink()
            return True
        return False
```

### 4.4 创建 Mock 短信服务

创建 `backend/app/services/mock_sms_service.py`：

```python
"""Mock SMS Service for local development"""
import random
from typing import Dict


class MockSMSService:
    """Mock SMS service that simulates sending verification codes"""
    
    # 存储验证码（仅用于开发）
    _verification_codes: Dict[str, str] = {}
    
    async def send_verification_code(self, phone: str) -> str:
        """Generate and 'send' verification code"""
        # 生成固定验证码方便测试
        code = "123456"
        
        # 存储验证码
        self._verification_codes[phone] = code
        
        print(f"📱 Mock SMS: 发送验证码 {code} 到 {phone}")
        print(f"💡 提示：在开发模式下，所有手机号的验证码都是 123456")
        
        return code
    
    async def verify_code(self, phone: str, code: str) -> bool:
        """Verify the code"""
        stored_code = self._verification_codes.get(phone)
        
        # 开发模式：接受 123456 作为万能验证码
        if code == "123456":
            return True
        
        return stored_code == code
```

---

## 🔧 第五步：修改配置以支持 Mock 模式

### 5.1 更新配置文件

编辑 `backend/app/core/config.py`，添加 Mock 模式支持：

```python
# 在 Settings 类中添加
class Settings(BaseSettings):
    # ... 现有配置 ...
    
    # Mock 模式配置
    USE_MOCK_SERVICES: bool = False
    
    @property
    def is_mock_mode(self) -> bool:
        """Check if running in mock mode"""
        return self.USE_MOCK_SERVICES or self.ENVIRONMENT == "development"
```

### 5.2 更新服务工厂

创建 `backend/app/services/service_factory.py`：

```python
"""Service Factory for creating real or mock services"""
from app.core.config import settings
from app.services.ocr.ocr_service import OCRService
from app.services.ocr.mock_provider import MockOCRProvider
from app.services.ocr.baidu_provider import BaiduOCRProvider
from app.services.mock_deepseek_service import MockDeepSeekService
from app.services.deepseek_service import DeepSeekService
from app.services.mock_storage_service import MockStorageService
from app.services.mock_sms_service import MockSMSService


def get_ocr_service() -> OCRService:
    """Get OCR service (real or mock)"""
    if settings.is_mock_mode:
        provider = MockOCRProvider()
    else:
        provider = BaiduOCRProvider()
    
    return OCRService(provider)


def get_deepseek_service():
    """Get DeepSeek service (real or mock)"""
    if settings.is_mock_mode:
        return MockDeepSeekService()
    else:
        return DeepSeekService()


def get_storage_service():
    """Get storage service (real or mock)"""
    if settings.is_mock_mode:
        return MockStorageService()
    else:
        # 返回真实的 OSS 服务
        from app.services.oss_service import OSSService
        return OSSService()


def get_sms_service():
    """Get SMS service (real or mock)"""
    if settings.is_mock_mode:
        return MockSMSService()
    else:
        # 返回真实的短信服务
        from app.services.sms_service import SMSService
        return SMSService()
```

---

## 🚀 第六步：启动服务

### 6.1 启动 Docker 服务

```bash
# 使用 Mock 配置启动
docker-compose --env-file .env.mock -f docker-compose.mock.yml up -d

# 查看日志
docker-compose -f docker-compose.mock.yml logs -f
```

### 6.2 运行数据库迁移

```bash
# 进入后端容器
docker-compose -f docker-compose.mock.yml exec backend bash

# 运行迁移
alembic upgrade head

# 退出容器
exit
```

### 6.3 验证服务

```bash
# 检查服务状态
docker-compose -f docker-compose.mock.yml ps

# 测试 API
curl http://localhost:8000/health

# 访问 API 文档
# 浏览器打开：http://localhost:8000/docs
```

---

## 📱 第七步：配置 Android 应用

### 7.1 修改 Android 配置

编辑 Android 项目中的 API 配置：

```kotlin
// android/app/src/main/java/com/examai/data/remote/api/ApiConfig.kt
object ApiConfig {
    // 本地开发使用
    const val BASE_URL = "http://10.0.2.2:8000/"  // Android 模拟器
    // const val BASE_URL = "http://localhost:8000/"  // 真机（需要在同一网络）
}
```

### 7.2 编译并运行

1. 打开 Android Studio
2. 打开项目：`android/`
3. 运行应用（Shift + F10）
4. 在模拟器或真机上测试

---

## 🎮 第八步：测试 Mock 功能

### 8.1 测试用户注册

```bash
# 使用 curl 测试
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "13800138000",
    "password": "test123456",
    "verification_code": "123456"
  }'
```

**提示**：在 Mock 模式下，所有验证码都是 `123456`

### 8.2 测试图片上传

```bash
# 上传测试图片
curl -X POST http://localhost:8000/api/v1/exams/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test_exam.jpg"
```

### 8.3 在 Android 应用中测试

1. 注册账号（验证码输入 `123456`）
2. 登录
3. 拍照或选择图片
4. 上传试卷
5. 查看模拟的分析报告

---

## 🎯 Mock 模式的特点

### ✅ 优点

1. **完全免费**：不需要任何外部 API
2. **快速响应**：本地处理，无网络延迟
3. **稳定可靠**：不受外部服务影响
4. **易于调试**：可以自定义返回数据
5. **离线工作**：不需要网络连接

### ⚠️ 限制

1. **OCR 结果固定**：返回预设的模拟文本
2. **AI 分析简化**：返回随机生成的分析结果
3. **不适合生产**：仅用于开发和测试

---

## 🔄 切换到真实 API

当你准备好使用真实 API 时：

1. 获取真实的 API 密钥
2. 修改 `.env` 文件，设置 `USE_MOCK_SERVICES=false`
3. 填写真实的 API 密钥
4. 重启服务

```bash
# 停止 Mock 服务
docker-compose -f docker-compose.mock.yml down

# 使用真实配置启动
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🛠️ 常见问题

### Q1: Docker 启动失败？
```bash
# 检查 Docker 是否运行
docker ps

# 查看日志
docker-compose -f docker-compose.mock.yml logs
```

### Q2: 端口被占用？
```bash
# 修改 docker-compose.mock.yml 中的端口
ports:
  - "8001:8000"  # 改成其他端口
```

### Q3: Android 连接不上后端？
- 模拟器使用：`http://10.0.2.2:8000/`
- 真机使用：`http://你的电脑IP:8000/`
- 确保防火墙允许 8000 端口

### Q4: 想要自定义 Mock 数据？
编辑 `backend/app/services/ocr/mock_provider.py` 和其他 Mock 服务文件，修改返回的数据。

---

## 📞 需要帮助？

如果遇到问题，告诉我：
1. 在哪一步遇到问题
2. 错误信息是什么
3. 运行了什么命令

我会帮你解决！

---

**Mock 版本部署完成！** 🎉

现在你可以完全免费地在本地测试所有功能了！
