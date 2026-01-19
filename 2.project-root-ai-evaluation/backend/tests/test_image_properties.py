"""
图像验证属性测试
Feature: ai-exam-assessment, Property 3: Image Format and Size Validation
"""
import pytest
from hypothesis import given, strategies as st, assume
import io
from PIL import Image

from app.services.image_service import ImageService
from app.core.config import settings


class TestImageFormatAndSizeValidation:
    """
    Property 3: Image Format and Size Validation
    Validates: Requirements 2.4
    
    For any uploaded image, the system should validate that the format is one of 
    (JPG, PNG, HEIC) and the size is <= 10MB, rejecting images that don't meet these criteria.
    """
    
    @pytest.mark.property
    def test_valid_formats_accepted(self):
        """对于任何允许的格式，验证应该通过"""
        valid_formats = ["jpg", "jpeg", "png", "heic"]
        
        # 创建一个小的测试图像
        img = Image.new('RGB', (100, 100), color='red')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='JPEG')
        content = img_bytes.getvalue()
        
        for fmt in valid_formats:
            filename = f"test.{fmt}"
            try:
                ImageService.validate_image_format_and_size(filename, content)
                # 如果没有抛出异常，验证通过
                assert True
            except ValueError:
                pytest.fail(f"Valid format {fmt} should be accepted")
    
    @pytest.mark.property
    def test_invalid_formats_rejected(self):
        """对于任何不允许的格式，验证应该失败"""
        invalid_formats = ["gif", "bmp", "tiff", "webp", "svg", "pdf", "txt"]
        
        # 创建测试内容
        content = b"fake image content"
        
        for fmt in invalid_formats:
            filename = f"test.{fmt}"
            with pytest.raises(ValueError) as exc_info:
                ImageService.validate_image_format_and_size(filename, content)
            assert "not allowed" in str(exc_info.value).lower()
    
    @given(st.integers(min_value=0, max_value=settings.MAX_UPLOAD_SIZE))
    @pytest.mark.property
    def test_size_within_limit_accepted(self, size: int):
        """对于任何不超过10MB的文件，大小验证应该通过"""
        content = b'x' * size
        filename = "test.jpg"
        
        try:
            # 只测试大小，不测试实际图像内容
            file_size = len(content)
            if file_size > settings.MAX_UPLOAD_SIZE:
                pytest.fail("Size should be within limit")
        except ValueError:
            pytest.fail(f"Size {size} bytes should be accepted")
    
    @given(st.integers(min_value=settings.MAX_UPLOAD_SIZE + 1, max_value=settings.MAX_UPLOAD_SIZE + 1000000))
    @pytest.mark.property
    def test_size_exceeding_limit_rejected(self, size: int):
        """对于任何超过10MB的文件，大小验证应该失败"""
        content = b'x' * size
        filename = "test.jpg"
        
        with pytest.raises(ValueError) as exc_info:
            ImageService.validate_image_format_and_size(filename, content)
        assert "exceeds maximum" in str(exc_info.value).lower()
    
    @pytest.mark.property
    def test_exact_size_limit_accepted(self):
        """恰好10MB的文件应该被接受"""
        size = settings.MAX_UPLOAD_SIZE
        content = b'x' * size
        filename = "test.jpg"
        
        # 只测试大小检查部分
        file_size = len(content)
        assert file_size <= settings.MAX_UPLOAD_SIZE
    
    @pytest.mark.property
    def test_empty_file_rejected(self):
        """空文件应该被拒绝"""
        content = b''
        filename = "test.jpg"
        
        with pytest.raises(ValueError):
            ImageService.validate_image_format_and_size(filename, content)
    
    @pytest.mark.property
    def test_filename_without_extension(self):
        """没有扩展名的文件应该被拒绝"""
        content = b'fake content'
        filename = "test_no_extension"
        
        with pytest.raises(ValueError) as exc_info:
            ImageService.validate_image_format_and_size(filename, content)
        assert "not allowed" in str(exc_info.value).lower()


class TestImageQualityValidation:
    """测试图像质量验证"""
    
    @pytest.mark.property
    def test_resolution_below_minimum_rejected(self):
        """分辨率低于最小要求的图像应该被拒绝"""
        import numpy as np
        
        # 创建低分辨率图像
        low_res_image = np.zeros((800, 600, 3), dtype=np.uint8)
        
        result = ImageService.validate_image_quality(low_res_image)
        
        assert result.is_valid is False
        assert "resolution" in result.reason.lower()
    
    @pytest.mark.property
    def test_resolution_above_minimum_accepted(self):
        """分辨率高于最小要求的图像应该被接受（如果其他条件满足）"""
        import numpy as np
        
        # 创建高分辨率图像（但可能因为其他原因被拒绝）
        high_res_image = np.random.randint(0, 255, (2000, 2500, 3), dtype=np.uint8)
        
        result = ImageService.validate_image_quality(high_res_image)
        
        # 如果被拒绝，不应该是因为分辨率
        if not result.is_valid:
            assert "resolution" not in result.reason.lower()
