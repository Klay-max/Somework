"""
认证 API 单元测试
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.main import app
from app.models.user import User
from app.services.auth_service import AuthService


@pytest.fixture
async def client():
    """创建测试客户端"""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac


@pytest.fixture
async def test_user(db_session: AsyncSession):
    """创建测试用户"""
    user = User(
        phone="13800138000",
        password_hash=AuthService.hash_password("password123"),
        role="student"
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


class TestSendVerificationCode:
    """测试发送验证码"""
    
    @pytest.mark.asyncio
    async def test_send_code_success(self, client: AsyncClient):
        """测试成功发送验证码"""
        response = await client.post(
            "/api/v1/auth/send-code",
            json={"phone": "13912345678"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["expires_in"] == 300
    
    @pytest.mark.asyncio
    async def test_send_code_invalid_phone(self, client: AsyncClient):
        """测试无效手机号"""
        invalid_phones = [
            "12345678901",  # 不以1开头
            "138001380",    # 长度不足
            "1380013800a",  # 包含字母
        ]
        
        for phone in invalid_phones:
            response = await client.post(
                "/api/v1/auth/send-code",
                json={"phone": phone}
            )
            assert response.status_code == 422  # Validation error


class TestRegister:
    """测试用户注册"""
    
    @pytest.mark.asyncio
    async def test_register_success(self, client: AsyncClient):
        """测试成功注册"""
        # 先发送验证码
        phone = "13912345678"
        code = await AuthService.send_sms_code(phone)
        
        # 注册
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "phone": phone,
                "verification_code": code,
                "password": "password123"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "user_id" in data
        assert "token" in data
        assert "expires_at" in data
    
    @pytest.mark.asyncio
    async def test_register_invalid_code(self, client: AsyncClient):
        """测试无效验证码"""
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "phone": "13912345678",
                "verification_code": "000000",
                "password": "password123"
            }
        )
        
        assert response.status_code == 400
        assert "Invalid or expired verification code" in response.json()["detail"]
    
    @pytest.mark.asyncio
    async def test_register_duplicate_phone(self, client: AsyncClient, test_user: User):
        """测试重复手机号注册"""
        # 先发送验证码
        code = await AuthService.send_sms_code(test_user.phone)
        
        # 尝试注册已存在的手机号
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "phone": test_user.phone,
                "verification_code": code,
                "password": "password123"
            }
        )
        
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"]
    
    @pytest.mark.asyncio
    async def test_register_weak_password(self, client: AsyncClient):
        """测试弱密码"""
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "phone": "13912345678",
                "verification_code": "123456",
                "password": "123"  # 少于6位
            }
        )
        
        assert response.status_code == 422  # Validation error


class TestLogin:
    """测试用户登录"""
    
    @pytest.mark.asyncio
    async def test_login_success(self, client: AsyncClient, test_user: User):
        """测试成功登录"""
        response = await client.post(
            "/api/v1/auth/login",
            json={
                "phone": test_user.phone,
                "password": "password123"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "user_id" in data
        assert "token" in data
        assert "expires_at" in data
        assert data["user_id"] == str(test_user.user_id)
    
    @pytest.mark.asyncio
    async def test_login_wrong_password(self, client: AsyncClient, test_user: User):
        """测试错误密码"""
        response = await client.post(
            "/api/v1/auth/login",
            json={
                "phone": test_user.phone,
                "password": "wrongpassword"
            }
        )
        
        assert response.status_code == 401
        assert "Invalid phone number or password" in response.json()["detail"]
    
    @pytest.mark.asyncio
    async def test_login_nonexistent_user(self, client: AsyncClient):
        """测试不存在的用户"""
        response = await client.post(
            "/api/v1/auth/login",
            json={
                "phone": "13999999999",
                "password": "password123"
            }
        )
        
        assert response.status_code == 401
        assert "Invalid phone number or password" in response.json()["detail"]


class TestGetCurrentUser:
    """测试获取当前用户信息"""
    
    @pytest.mark.asyncio
    async def test_get_current_user_success(self, client: AsyncClient, test_user: User):
        """测试成功获取当前用户信息"""
        # 先登录获取 token
        login_response = await client.post(
            "/api/v1/auth/login",
            json={
                "phone": test_user.phone,
                "password": "password123"
            }
        )
        token = login_response.json()["token"]
        
        # 获取用户信息
        response = await client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["user_id"] == str(test_user.user_id)
        assert data["phone"] == test_user.phone
        assert data["role"] == test_user.role.value
    
    @pytest.mark.asyncio
    async def test_get_current_user_no_token(self, client: AsyncClient):
        """测试未提供 token"""
        response = await client.get("/api/v1/auth/me")
        
        assert response.status_code == 403  # Forbidden (no auth header)
    
    @pytest.mark.asyncio
    async def test_get_current_user_invalid_token(self, client: AsyncClient):
        """测试无效 token"""
        response = await client.get(
            "/api/v1/auth/me",
            headers={"Authorization": "Bearer invalid_token"}
        )
        
        assert response.status_code == 401
        assert "Invalid or expired token" in response.json()["detail"]


class TestTokenExpiration:
    """测试 token 过期处理"""
    
    @pytest.mark.asyncio
    async def test_expired_token(self, client: AsyncClient):
        """测试过期的 token"""
        # 创建一个已过期的 token（这里需要手动构造）
        from jose import jwt
        from datetime import datetime, timedelta
        from app.core.config import settings
        
        # 创建一个已过期的 payload
        expired_payload = {
            "sub": "test-user-id",
            "exp": datetime.utcnow() - timedelta(days=1),  # 昨天过期
            "iat": datetime.utcnow() - timedelta(days=8)
        }
        
        expired_token = jwt.encode(
            expired_payload,
            settings.SECRET_KEY,
            algorithm=settings.ALGORITHM
        )
        
        # 尝试使用过期 token
        response = await client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {expired_token}"}
        )
        
        assert response.status_code == 401
