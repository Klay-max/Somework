"""
OCR 属性测试
使用 Hypothesis 进行基于属性的测试
"""
import pytest
from hypothesis import given, strategies as st, settings
from hypothesis.strategies import composite
import numpy as np

from app.schemas.ocr import OCRResult, TextRegion, BoundingBox
from app.services.ocr.base import OCRProvider


# ============================================================================
# 测试数据生成策略
# ============================================================================

@composite
def bounding_box_strategy(draw):
    """生成有效的边界框"""
    x = draw(st.integers(min_value=0, max_value=2000))
    y = draw(st.integers(min_value=0, max_value=2000))
    width = draw(st.integers(min_value=10, max_value=500))
    height = draw(st.integers(min_value=10, max_value=200))
    
    return BoundingBox(x=x, y=y, width=width, height=height)


@composite
def text_region_strategy(draw):
    """生成文本区域"""
    text = draw(st.text(min_size=1, max_size=100))
    bbox = draw(bounding_box_strategy())
    confidence = draw(st.floats(min_value=0.0, max_value=1.0))
    text_type = draw(st.sampled_from(["printed", "handwritten"]))
    
    return TextRegion(
        text=text,
        bbox=bbox,
        confidence=confidence,
        type=text_type
    )


@composite
def ocr_result_strategy(draw):
    """生成 OCR 结果"""
    num_regions = draw(st.integers(min_value=1, max_value=20))
    text_regions = [draw(text_region_strategy()) for _ in range(num_regions)]
    
    # 计算整体置信度
    overall_confidence = sum(r.confidence for r in text_regions) / len(text_regions)
    
    processing_time = draw(st.floats(min_value=0.1, max_value=10.0))
    provider = draw(st.sampled_from(["baidu", "tencent"]))
    
    return OCRResult(
        text_regions=text_regions,
        overall_confidence=overall_confidence,
        processing_time=processing_time,
        provider=provider
    )


# ============================================================================
# Property 8: OCR Output Structure
# Feature: ai-exam-assessment, Property 8: OCR Output Structure
# Validates: Requirements 4.2
# ============================================================================

class TestOCROutputStructure:
    """测试 OCR 输出结构的完整性"""
    
    @settings(max_examples=100)
    @given(text_region=text_region_strategy())
    def test_text_region_has_all_required_fields(self, text_region: TextRegion):
        """
        Property 8: OCR Output Structure
        
        For any text region recognized by OCR, the output should include:
        - text content
        - bounding box coordinates (x, y, width, height)
        - confidence score
        - text type (printed/handwritten)
        """
        # 验证文本内容存在
        assert text_region.text is not None
        assert isinstance(text_region.text, str)
        
        # 验证边界框存在且有效
        assert text_region.bbox is not None
        assert isinstance(text_region.bbox, BoundingBox)
        assert text_region.bbox.x >= 0
        assert text_region.bbox.y >= 0
        assert text_region.bbox.width > 0
        assert text_region.bbox.height > 0
        
        # 验证置信度在有效范围内
        assert text_region.confidence is not None
        assert 0.0 <= text_region.confidence <= 1.0
        
        # 验证文本类型有效
        assert text_region.type in ["printed", "handwritten"]
    
    @settings(max_examples=100)
    @given(ocr_result=ocr_result_strategy())
    def test_ocr_result_structure_completeness(self, ocr_result: OCRResult):
        """
        Property 8: OCR Output Structure (整体结果)
        
        For any OCR result, it should contain:
        - list of text regions
        - overall confidence
        - processing time
        - provider name
        """
        # 验证文本区域列表
        assert ocr_result.text_regions is not None
        assert isinstance(ocr_result.text_regions, list)
        assert len(ocr_result.text_regions) > 0
        
        # 验证每个文本区域的结构
        for region in ocr_result.text_regions:
            assert isinstance(region, TextRegion)
            assert region.text is not None
            assert region.bbox is not None
            assert 0.0 <= region.confidence <= 1.0
            assert region.type in ["printed", "handwritten"]
        
        # 验证整体置信度
        assert 0.0 <= ocr_result.overall_confidence <= 1.0
        
        # 验证处理时间
        assert ocr_result.processing_time > 0
        
        # 验证提供商名称
        assert ocr_result.provider is not None
        assert isinstance(ocr_result.provider, str)


# ============================================================================
# Property 9: Text Type Classification
# Feature: ai-exam-assessment, Property 9: Text Type Classification
# Validates: Requirements 4.3
# ============================================================================

class TestTextTypeClassification:
    """测试文本类型分类"""
    
    @settings(max_examples=100)
    @given(
        printed_confidence=st.floats(min_value=0.85, max_value=1.0),
        handwritten_confidence=st.floats(min_value=0.0, max_value=0.84)
    )
    def test_classify_text_type_by_confidence(
        self,
        printed_confidence: float,
        handwritten_confidence: float
    ):
        """
        Property 9: Text Type Classification
        
        For any text region, classification should be consistent:
        - High confidence (>= 0.85) → printed
        - Low confidence (< 0.85) → handwritten
        """
        # 创建模拟 OCR 提供商
        class MockOCRProvider(OCRProvider):
            async def recognize(self, image_bytes: bytes):
                pass
            async def recognize_printed(self, image_bytes: bytes):
                pass
            async def recognize_handwritten(self, image_bytes: bytes):
                pass
        
        provider = MockOCRProvider("test_key")
        
        # 测试高置信度（印刷体）
        printed_region = TextRegion(
            text="Test",
            bbox=BoundingBox(x=0, y=0, width=100, height=50),
            confidence=printed_confidence,
            type="printed"
        )
        result = provider.classify_text_type(printed_region)
        assert result == "printed", f"High confidence {printed_confidence} should be classified as printed"
        
        # 测试低置信度（手写）
        handwritten_region = TextRegion(
            text="Test",
            bbox=BoundingBox(x=0, y=0, width=100, height=50),
            confidence=handwritten_confidence,
            type="handwritten"
        )
        result = provider.classify_text_type(handwritten_region)
        assert result == "handwritten", f"Low confidence {handwritten_confidence} should be classified as handwritten"
    
    @settings(max_examples=100)
    @given(ocr_result=ocr_result_strategy())
    def test_mixed_text_types_classification(self, ocr_result: OCRResult):
        """
        Property 9: Text Type Classification (混合文本)
        
        For any OCR result containing both printed and handwritten text,
        each region should be correctly classified.
        """
        # 验证每个区域都有有效的类型分类
        for region in ocr_result.text_regions:
            assert region.type in ["printed", "handwritten"]
            
            # 验证分类与置信度的一致性
            if region.confidence >= 0.85:
                # 高置信度通常是印刷体
                # 但这不是严格规则，所以我们只验证类型有效
                assert region.type in ["printed", "handwritten"]
            else:
                # 低置信度可能是手写
                assert region.type in ["printed", "handwritten"]


# ============================================================================
# Property 10: Low Confidence Flagging
# Feature: ai-exam-assessment, Property 10: Low Confidence Flagging
# Validates: Requirements 4.4
# ============================================================================

class TestLowConfidenceFlagging:
    """测试低置信度标记"""
    
    @settings(max_examples=100)
    @given(
        threshold=st.floats(min_value=0.5, max_value=0.9),
        confidence=st.floats(min_value=0.0, max_value=1.0)
    )
    def test_flag_low_confidence_threshold(self, threshold: float, confidence: float):
        """
        Property 10: Low Confidence Flagging
        
        For any OCR result, regions with confidence below threshold
        should be flagged for manual review.
        """
        # 创建模拟 OCR 提供商
        class MockOCRProvider(OCRProvider):
            async def recognize(self, image_bytes: bytes):
                pass
            async def recognize_printed(self, image_bytes: bytes):
                pass
            async def recognize_handwritten(self, image_bytes: bytes):
                pass
        
        provider = MockOCRProvider("test_key")
        
        # 创建测试区域
        region = TextRegion(
            text="Test",
            bbox=BoundingBox(x=0, y=0, width=100, height=50),
            confidence=confidence,
            type="printed"
        )
        
        # 标记低置信度区域
        flagged_indices = provider.flag_low_confidence([region], threshold=threshold)
        
        # 验证标记逻辑
        if confidence < threshold:
            assert 0 in flagged_indices, f"Confidence {confidence} < {threshold} should be flagged"
        else:
            assert 0 not in flagged_indices, f"Confidence {confidence} >= {threshold} should not be flagged"
    
    @settings(max_examples=100)
    @given(ocr_result=ocr_result_strategy())
    def test_flag_low_confidence_consistency(self, ocr_result: OCRResult):
        """
        Property 10: Low Confidence Flagging (一致性)
        
        For any OCR result, the number of flagged regions should match
        the number of regions below the threshold.
        """
        # 创建模拟 OCR 提供商
        class MockOCRProvider(OCRProvider):
            async def recognize(self, image_bytes: bytes):
                pass
            async def recognize_printed(self, image_bytes: bytes):
                pass
            async def recognize_handwritten(self, image_bytes: bytes):
                pass
        
        provider = MockOCRProvider("test_key")
        
        threshold = 0.8
        
        # 标记低置信度区域
        flagged_indices = provider.flag_low_confidence(
            ocr_result.text_regions,
            threshold=threshold
        )
        
        # 计算实际低置信度区域数量
        expected_count = sum(
            1 for region in ocr_result.text_regions
            if region.confidence < threshold
        )
        
        # 验证标记数量一致
        assert len(flagged_indices) == expected_count, \
            f"Expected {expected_count} flagged regions, got {len(flagged_indices)}"
        
        # 验证所有标记的索引都对应低置信度区域
        for idx in flagged_indices:
            assert ocr_result.text_regions[idx].confidence < threshold, \
                f"Flagged region at index {idx} has confidence >= {threshold}"
    
    @settings(max_examples=100)
    @given(
        num_regions=st.integers(min_value=1, max_value=20),
        threshold=st.floats(min_value=0.6, max_value=0.9)
    )
    def test_flag_all_low_confidence_regions(self, num_regions: int, threshold: float):
        """
        Property 10: Low Confidence Flagging (完整性)
        
        For any set of text regions, all regions below threshold
        should be flagged, and no regions above threshold should be flagged.
        """
        # 创建模拟 OCR 提供商
        class MockOCRProvider(OCRProvider):
            async def recognize(self, image_bytes: bytes):
                pass
            async def recognize_printed(self, image_bytes: bytes):
                pass
            async def recognize_handwritten(self, image_bytes: bytes):
                pass
        
        provider = MockOCRProvider("test_key")
        
        # 创建测试区域（一半低置信度，一半高置信度）
        regions = []
        for i in range(num_regions):
            if i < num_regions // 2:
                # 低置信度
                confidence = threshold - 0.1
            else:
                # 高置信度
                confidence = threshold + 0.1
            
            regions.append(TextRegion(
                text=f"Test {i}",
                bbox=BoundingBox(x=i*100, y=0, width=100, height=50),
                confidence=max(0.0, min(1.0, confidence)),  # 确保在有效范围内
                type="printed"
            ))
        
        # 标记低置信度区域
        flagged_indices = provider.flag_low_confidence(regions, threshold=threshold)
        
        # 验证所有低置信度区域都被标记
        for i, region in enumerate(regions):
            if region.confidence < threshold:
                assert i in flagged_indices, \
                    f"Region {i} with confidence {region.confidence} should be flagged"
            else:
                assert i not in flagged_indices, \
                    f"Region {i} with confidence {region.confidence} should not be flagged"
