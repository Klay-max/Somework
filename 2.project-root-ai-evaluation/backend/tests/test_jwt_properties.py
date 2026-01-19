"""
JWT Token 属性测试
Feature: ai-exam-assessment, Property 2: JWT Token Expiration Accuracy
"""
import pytest
from hypothesis import given, strategies as st
from jose import jwt
from datetime import datetime
import uuid

from app.services.auth_service import AuthService
from app.core.config import settings


class TestJWTTokenExpirationProperty:
    """
    Property 2: JWT Token Expiration Accuracy
    Validates: Requirements 1.4
    
    For any successful login, the issued JWT token should have an expiration time 
    exactly 7 days (604800 seconds) from the issue time.
    """
    
    @given(st.uuids())
    @pytest.mark.property
    def test_token_expiration_exactly_7_days(self, user_id: uuid.UUID):
        """
        对于任何用户 ID，生成的 JWT token 应该在恰好 7 天后过期
        """
        # 生成 token
        token = AuthService.generate_jwt(str(user_id))
        
        # 解码 token（不验证签名，只获取 payload）
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        
        # 获取签发时间和过期时间
        iat = payload['iat']
        exp = payload['exp']
        
        # 计算时间差（秒）
        time_diff = exp - iat
        
        # 7 天 = 604800 秒
        expected_seconds = 7 * 24 * 60 * 60
        
        assert time_diff == expected_seconds, \
            f"Token should expire exactly 7 days (604800 seconds) after issue, got {time_diff} seconds"
    
    @given(st.uuids())
    @pytest.mark.property
    def test_token_contains_user_id(self, user_id: uuid.UUID):
        """
        对于任何用户 ID，生成的 token 应该包含该用户 ID
        """
        user_id_str = str(user_id)
        token = AuthService.generate_jwt(user_id_str)
        
        # 验证 token 并获取用户 ID
        verified_user_id = AuthService.verify_jwt(token)
        
        assert verified_user_id == user_id_str, \
            f"Token should contain user_id {user_id_str}, got {verified_user_id}"
    
    @given(st.uuids())
    @pytest.mark.property
    def test_token_verification_round_trip(self, user_id: uuid.UUID):
        """
        对于任何用户 ID，生成 token 后验证应该返回相同的用户 ID（round trip）
        """
        user_id_str = str(user_id)
        
        # 生成 token
        token = AuthService.generate_jwt(user_id_str)
        
        # 验证 token
        verified_user_id = AuthService.verify_jwt(token)
        
        assert verified_user_id == user_id_str, \
            f"Round trip should preserve user_id: {user_id_str} != {verified_user_id}"
    
    @pytest.mark.property
    def test_invalid_token_verification(self):
        """
        对于任何无效的 token，验证应该返回 None
        """
        invalid_tokens = [
            "invalid.token.here",
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature",
            "",
            "not-a-jwt-token",
            "Bearer token",
        ]
        
        for token in invalid_tokens:
            result = AuthService.verify_jwt(token)
            assert result is None, f"Invalid token {token} should return None"
    
    @given(st.uuids())
    @pytest.mark.property
    def test_token_has_required_claims(self, user_id: uuid.UUID):
        """
        对于任何生成的 token，应该包含必需的声明（sub, exp, iat）
        """
        token = AuthService.generate_jwt(str(user_id))
        
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        
        # 检查必需的声明
        assert 'sub' in payload, "Token should contain 'sub' claim"
        assert 'exp' in payload, "Token should contain 'exp' claim"
        assert 'iat' in payload, "Token should contain 'iat' claim"
        
        # 检查 sub 是用户 ID
        assert payload['sub'] == str(user_id), "Token 'sub' should be user_id"
        
        # 检查 exp 和 iat 都是时间戳
        assert isinstance(payload['exp'], (int, float)), "Token 'exp' should be a timestamp"
        assert isinstance(payload['iat'], (int, float)), "Token 'iat' should be a timestamp"
        
        # 检查 exp 大于 iat
        assert payload['exp'] > payload['iat'], "Token 'exp' should be greater than 'iat'"


class TestPasswordHashing:
    """测试密码哈希"""
    
    @given(st.text(min_size=6, max_size=100))
    @pytest.mark.property
    def test_password_hash_round_trip(self, password: str):
        """
        对于任何密码，哈希后验证应该成功（round trip）
        """
        hashed = AuthService.hash_password(password)
        
        # 验证密码
        result = AuthService.verify_password(password, hashed)
        
        assert result is True, f"Password verification should succeed for original password"
    
    @given(st.text(min_size=6, max_size=100))
    @pytest.mark.property
    def test_password_hash_is_different(self, password: str):
        """
        对于任何密码，哈希后的值应该与原密码不同
        """
        hashed = AuthService.hash_password(password)
        
        assert hashed != password, "Hashed password should be different from original"
    
    @given(st.text(min_size=6, max_size=100))
    @pytest.mark.property
    def test_wrong_password_fails(self, password: str):
        """
        对于任何密码，使用错误的密码验证应该失败
        """
        hashed = AuthService.hash_password(password)
        wrong_password = password + "wrong"
        
        result = AuthService.verify_password(wrong_password, hashed)
        
        assert result is False, "Wrong password should fail verification"
    
    @given(st.text(min_size=6, max_size=100))
    @pytest.mark.property
    def test_same_password_different_hashes(self, password: str):
        """
        对于同一个密码，多次哈希应该产生不同的结果（salt）
        """
        hash1 = AuthService.hash_password(password)
        hash2 = AuthService.hash_password(password)
        
        # 由于使用了 salt，两次哈希结果应该不同
        assert hash1 != hash2, "Same password should produce different hashes due to salt"
        
        # 但两个哈希都应该能验证原密码
        assert AuthService.verify_password(password, hash1) is True
        assert AuthService.verify_password(password, hash2) is True
