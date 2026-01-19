"""
认证服务属性测试
Feature: ai-exam-assessment, Property 1: Phone Number Validation Consistency
"""
import pytest
from hypothesis import given, strategies as st, assume

from app.services.auth_service import AuthService


class TestPhoneValidationProperty:
    """
    Property 1: Phone Number Validation Consistency
    Validates: Requirements 1.2
    
    For any phone number input during registration, the system should correctly 
    validate the format according to Chinese phone number rules (11 digits starting with 1),
    rejecting invalid formats and accepting valid ones.
    """
    
    @given(st.text(min_size=11, max_size=11, alphabet=st.characters(whitelist_categories=('Nd',))))
    @pytest.mark.property
    def test_valid_phone_starting_with_1(self, phone: str):
        """
        对于任何以1开头的11位数字，如果第二位是3-9，应该验证通过
        """
        # 只测试以1开头且第二位是3-9的号码
        assume(phone[0] == '1' and phone[1] in '3456789')
        
        result = AuthService.validate_phone(phone)
        assert result is True, f"Valid phone {phone} should pass validation"
    
    @given(st.text(min_size=11, max_size=11, alphabet=st.characters(whitelist_categories=('Nd',))))
    @pytest.mark.property
    def test_invalid_phone_not_starting_with_1(self, phone: str):
        """
        对于任何不以1开头的11位数字，应该验证失败
        """
        assume(phone[0] != '1')
        
        result = AuthService.validate_phone(phone)
        assert result is False, f"Phone {phone} not starting with 1 should fail validation"
    
    @given(st.text(min_size=11, max_size=11, alphabet=st.characters(whitelist_categories=('Nd',))))
    @pytest.mark.property
    def test_invalid_phone_second_digit_0_1_2(self, phone: str):
        """
        对于以1开头但第二位是0、1、2的11位数字，应该验证失败
        """
        assume(phone[0] == '1' and phone[1] in '012')
        
        result = AuthService.validate_phone(phone)
        assert result is False, f"Phone {phone} with invalid second digit should fail validation"
    
    @given(st.text(min_size=1, max_size=50))
    @pytest.mark.property
    def test_invalid_length(self, phone: str):
        """
        对于任何长度不是11位的字符串，应该验证失败
        """
        assume(len(phone) != 11)
        
        result = AuthService.validate_phone(phone)
        assert result is False, f"Phone {phone} with invalid length should fail validation"
    
    @given(st.text(min_size=11, max_size=11))
    @pytest.mark.property
    def test_non_digit_characters(self, phone: str):
        """
        对于任何包含非数字字符的11位字符串，应该验证失败
        """
        assume(not phone.isdigit())
        
        result = AuthService.validate_phone(phone)
        assert result is False, f"Phone {phone} with non-digit characters should fail validation"
    
    @pytest.mark.property
    def test_known_valid_phones(self):
        """测试已知的有效手机号"""
        valid_phones = [
            "13800138000",
            "13912345678",
            "14712345678",
            "15012345678",
            "16612345678",
            "17712345678",
            "18812345678",
            "19912345678"
        ]
        
        for phone in valid_phones:
            result = AuthService.validate_phone(phone)
            assert result is True, f"Known valid phone {phone} should pass validation"
    
    @pytest.mark.property
    def test_known_invalid_phones(self):
        """测试已知的无效手机号"""
        invalid_phones = [
            "12345678901",  # 以1开头但第二位是2
            "10012345678",  # 第二位是0
            "11012345678",  # 第二位是1
            "23800138000",  # 不以1开头
            "138001380",    # 长度不足
            "138001380000", # 长度过长
            "1380013800a",  # 包含字母
            "138-0013-8000", # 包含特殊字符
            "",             # 空字符串
            "abcdefghijk",  # 全是字母
        ]
        
        for phone in invalid_phones:
            result = AuthService.validate_phone(phone)
            assert result is False, f"Known invalid phone {phone} should fail validation"


class TestVerificationCodeGeneration:
    """测试验证码生成"""
    
    @given(st.integers(min_value=4, max_value=8))
    @pytest.mark.property
    def test_code_length(self, length: int):
        """
        对于任何指定的长度，生成的验证码应该是该长度
        """
        code = AuthService.generate_verification_code(length)
        assert len(code) == length, f"Code length should be {length}, got {len(code)}"
    
    @given(st.integers(min_value=4, max_value=8))
    @pytest.mark.property
    def test_code_all_digits(self, length: int):
        """
        对于任何生成的验证码，所有字符都应该是数字
        """
        code = AuthService.generate_verification_code(length)
        assert code.isdigit(), f"Code {code} should contain only digits"
    
    @pytest.mark.property
    def test_code_randomness(self):
        """
        生成多个验证码，它们应该不完全相同（测试随机性）
        """
        codes = [AuthService.generate_verification_code(6) for _ in range(100)]
        unique_codes = set(codes)
        
        # 至少应该有50个不同的验证码（允许一些重复）
        assert len(unique_codes) >= 50, f"Generated codes should be random, got {len(unique_codes)} unique codes out of 100"
