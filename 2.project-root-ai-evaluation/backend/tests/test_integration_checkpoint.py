"""
Checkpoint 集成测试
验证认证和上传功能的完整流程
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
import io
from PIL import Image

from main import app
from app.services.auth_service import AuthService


@pytest.fixture
async def client():
    """创建测试客户端"""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac


@pytest.fixture
async def authenticated_client(client: AsyncClient):
    """创建已认证的测试客户端"""
    # 注册用户
    phone = "13900000001"
    code = await AuthService.send_sms_code(phone)
    
    register_response = await client.post(
        "/api/v1/auth/register",
        json={
            "phone": phone,
            "verification_code": code,
            "password": "test123456"
        }
    )
    
    assert register_response.status_code == 200
    token = register_response.json()["token"]
    
    # 设置认证头
    client.headers["Authorization"] = f"Bearer {token}"
    
    return client


class TestCheckpointIntegration:
    """Checkpoint 集成测试"""
    
    @pytest.mark.asyncio
    async def test_complete_auth_flow(self, client: AsyncClient):
        """测试完整的认证流程"""
        phone = "13900000002"
        
        # 1. 发送验证码
        code_response = await client.post(
            "/api/v1/auth/send-code",
            json={"phone": phone}
        )
        assert code_response.status_code == 200
        assert code_response.json()["success"] is True
        
        # 2. 获取验证码（开发环境）
        code = await AuthService.send_sms_code(phone)
        
        # 3. 注册
        register_response = await client.post(
            "/api/v1/auth/register",
            json={
                "phone": phone,
                "verification_code": code,
                "password": "password123"
            }
        )
        assert register_response.status_code == 200
        register_data = register_response.json()
        assert "user_id" in register_data
        assert "token" in register_data
        
        token = register_data["token"]
        
        # 4. 使用 token 获取用户信息
        me_response = await client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert me_response.status_code == 200
        me_data = me_response.json()
        assert me_data["phone"] == phone
        
        # 5. 登出后重新登录
        login_response = await client.post(
            "/api/v1/auth/login",
            json={
                "phone": phone,
                "password": "password123"
            }
        )
        assert login_response.status_code == 200
        assert "token" in login_response.json()
    
    @pytest.mark.asyncio
    async def test_complete_upload_flow(self, authenticated_client: AsyncClient):
        """测试完整的图像上传流程"""
        # 1. 创建测试图像
        img = Image.new('RGB', (2000, 2000), color='white')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='JPEG')
        img_bytes.seek(0)
        
        # 2. 上传图像
        files = {"file": ("test_exam.jpg", img_bytes, "image/jpeg")}
        upload_response = await authenticated_client.post(
            "/api/v1/exams/upload",
            files=files
        )
        
        assert upload_response.status_code == 200
        upload_data = upload_response.json()
        assert "exam_id" in upload_data
        assert upload_data["status"] == "uploaded"
        
        exam_id = upload_data["exam_id"]
        
        # 3. 查询试卷状态
        status_response = await authenticated_client.get(
            f"/api/v1/exams/{exam_id}/status"
        )
        assert status_response.status_code == 200
        status_data = status_response.json()
        assert status_data["exam_id"] == exam_id
        assert status_data["status"] in ["uploaded", "processing", "completed"]
        
        # 4. 获取试卷详情
        detail_response = await authenticated_client.get(
            f"/api/v1/exams/{exam_id}"
        )
        assert detail_response.status_code == 200
        detail_data = detail_response.json()
        assert detail_data["exam_id"] == exam_id
        assert detail_data["original_image_url"] is not None
        
        # 5. 查看历史记录
        history_response = await authenticated_client.get(
            "/api/v1/exams/history"
        )
        assert history_response.status_code == 200
        history_data = history_response.json()
        assert history_data["total"] >= 1
        assert len(history_data["exams"]) >= 1
    
    @pytest.mark.asyncio
    async def test_auth_required_for_upload(self, client: AsyncClient):
        """测试上传需要认证"""
        img = Image.new('RGB', (100, 100), color='red')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='JPEG')
        img_bytes.seek(0)
        
        files = {"file": ("test.jpg", img_bytes, "image/jpeg")}
        response = await client.post(
            "/api/v1/exams/upload",
            files=files
        )
        
        # 应该返回 403 Forbidden（未认证）
        assert response.status_code == 403
    
    @pytest.mark.asyncio
    async def test_invalid_image_rejected(self, authenticated_client: AsyncClient):
        """测试无效图像被拒绝"""
        # 创建一个非图像文件
        fake_file = io.BytesIO(b"This is not an image")
        
        files = {"file": ("fake.jpg", fake_file, "image/jpeg")}
        response = await authenticated_client.post(
            "/api/v1/exams/upload",
            files=files
        )
        
        # 应该返回 400 Bad Request
        assert response.status_code == 400
        assert "invalid" in response.json()["detail"].lower()
    
    @pytest.mark.asyncio
    async def test_oversized_image_rejected(self, authenticated_client: AsyncClient):
        """测试超大图像被拒绝"""
        # 创建一个超过 10MB 的文件
        large_content = b'x' * (11 * 1024 * 1024)  # 11MB
        fake_file = io.BytesIO(large_content)
        
        files = {"file": ("large.jpg", fake_file, "image/jpeg")}
        response = await authenticated_client.post(
            "/api/v1/exams/upload",
            files=files
        )
        
        # 应该返回 400 Bad Request
        assert response.status_code == 400
        assert "exceeds" in response.json()["detail"].lower()


class TestHealthCheck:
    """测试健康检查"""
    
    @pytest.mark.asyncio
    async def test_health_endpoint(self, client: AsyncClient):
        """测试健康检查端点"""
        response = await client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "version" in data


class TestAPIDocumentation:
    """测试 API 文档"""
    
    @pytest.mark.asyncio
    async def test_openapi_docs_available(self, client: AsyncClient):
        """测试 OpenAPI 文档可访问"""
        response = await client.get("/docs")
        assert response.status_code == 200
    
    @pytest.mark.asyncio
    async def test_openapi_json_available(self, client: AsyncClient):
        """测试 OpenAPI JSON 可访问"""
        response = await client.get("/openapi.json")
        assert response.status_code == 200
        data = response.json()
        assert "openapi" in data
        assert "paths" in data
