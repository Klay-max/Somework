"""
书写分析服务的属性测试
使用 Hypothesis 进行基于属性的测试
"""
import pytest
from hypothesis import given, strategies as st, settings

from app.services.handwriting_service import HandwritingService
from app.schemas.ocr import TextRegion, BoundingBox


# ============================================================================
# Property 17: Handwriting Score Range
# ============================================================================
# 验证凌乱度分数在有效范围内
# Validates: Requirements 8.1

@given(
    region_count=st.integers(min_value=1, max_value=20),
    confidence=st.floats(min_value=0.0, max_value=1.0)
)
@settings(max_examples=100)
def test_property_17_handwriting_score_range(region_count: int, confidence: float):
    """
    Property 17: 凌乱度分数范围
    
    验证：
    1. 凌乱度分数在 [0, 1] 范围内
    2. 分数是有效的浮点数
    """
    # 创建测试文本区域
    text_regions = []
    for i in range(region_count):
        region = TextRegion(
            text=f"测试文本{i}",
            bbox=BoundingBox(x=100 + i * 50, y=100, width=40, height=30),
            confidence=confidence,
            type="handwritten"
        )
        text_regions.append(region)
    
    # 计算凌乱度
    messy_score = HandwritingService.compute_messy_score(text_regions)
    
    # 验证范围
    assert 0.0 <= messy_score <= 1.0, \
        f"凌乱度分数 {messy_score} 超出范围 [0, 1]"
    
    # 验证是有效数字
    assert isinstance(messy_score, float), \
        f"凌乱度分数应该是 float 类型，实际是 {type(messy_score)}"


# ============================================================================
# Property 18: Modification Count Accuracy
# ============================================================================
# 验证涂改计数的准确性
# Validates: Requirements 8.2

@given(
    cross_out_markers=st.lists(
        st.sampled_from(['×', '✗', '╳', '']),
        min_size=1,
        max_size=10
    )
)
@settings(max_examples=100)
def test_property_18_modification_count_accuracy(cross_out_markers: list):
    """
    Property 18: 涂改计数准确性
    
    验证：
    1. 涂改计数是非负整数
    2. 包含涂改标记的文本被正确识别
    """
    # 创建测试文本区域
    text_regions = []
    expected_count = sum(1 for m in cross_out_markers if m)  # 非空标记
    
    for i, marker in enumerate(cross_out_markers):
        text = f"测试{marker}文本" if marker else f"测试文本{i}"
        region = TextRegion(
            text=text,
            bbox=BoundingBox(x=100 + i * 50, y=100, width=40, height=30),
            confidence=0.9,
            type="handwritten"
        )
        text_regions.append(region)
    
    # 检测涂改
    cross_out_count = HandwritingService.detect_cross_outs(text_regions)
    
    # 验证计数是非负整数
    assert isinstance(cross_out_count, int), \
        f"涂改计数应该是 int 类型，实际是 {type(cross_out_count)}"
    assert cross_out_count >= 0, \
        f"涂改计数 {cross_out_count} 不应该是负数"
    
    # 验证至少检测到一些涂改（如果有标记的话）
    if expected_count > 0:
        assert cross_out_count > 0, \
            f"应该检测到涂改，但计数为 {cross_out_count}"


# ============================================================================
# Additional Property Tests
# ============================================================================

@given(
    x_positions=st.lists(
        st.integers(min_value=-100, max_value=2100),
        min_size=1,
        max_size=10
    ),
    page_width=st.integers(min_value=1000, max_value=3000)
)
@settings(max_examples=100)
def test_alignment_check_consistency(x_positions: list, page_width: int):
    """
    验证对齐检查的一致性
    
    规则：
    - x < 0 或 x + width > page_width 时有对齐问题
    """
    # 创建测试文本区域
    text_regions = []
    has_violation = False
    
    for i, x in enumerate(x_positions):
        width = 100
        region = TextRegion(
            text=f"文本{i}",
            bbox=BoundingBox(x=x, y=100, width=width, height=30),
            confidence=0.9,
            type="handwritten"
        )
        text_regions.append(region)
        
        # 检查是否有违规
        if x < 0 or x + width > page_width:
            has_violation = True
    
    # 检查对齐
    alignment_issue = HandwritingService.check_alignment(text_regions, page_width)
    
    # 验证结果
    if has_violation:
        assert alignment_issue, \
            "存在边界违规时应该检测到对齐问题"
    else:
        assert not alignment_issue, \
            "不存在边界违规时不应该检测到对齐问题"


@given(
    messy_score=st.floats(min_value=0.0, max_value=1.0),
    cross_out_count=st.integers(min_value=0, max_value=10),
    alignment_issue=st.booleans(),
    avg_confidence=st.floats(min_value=0.0, max_value=1.0)
)
@settings(max_examples=100)
def test_misread_risk_estimation_consistency(
    messy_score: float,
    cross_out_count: int,
    alignment_issue: bool,
    avg_confidence: float
):
    """
    验证误读风险评估的一致性
    
    规则：
    - 返回值应该是 "low", "medium", "high" 之一
    - 风险因素越多，风险等级越高
    """
    risk = HandwritingService.estimate_misread_risk(
        messy_score, cross_out_count, alignment_issue, avg_confidence
    )
    
    # 验证返回值
    assert risk in ["low", "medium", "high"], \
        f"风险等级 {risk} 不在有效值中"
    
    # 验证高风险情况
    if (messy_score > 0.7 and cross_out_count > 5 and 
        alignment_issue and avg_confidence < 0.7):
        assert risk == "high", \
            "所有风险因素都很高时，应该返回 high"


@given(
    region_count=st.integers(min_value=2, max_value=20)
)
@settings(max_examples=100)
def test_spacing_consistency_calculation(region_count: int):
    """
    验证间距一致性计算
    
    规则：
    - 间距完全一致时，一致性应该接近 1.0
    - 间距差异大时，一致性应该较低
    """
    # 创建间距一致的文本区域
    consistent_regions = []
    spacing = 50  # 固定间距
    
    for i in range(region_count):
        region = TextRegion(
            text=f"文本{i}",
            bbox=BoundingBox(
                x=100 + i * (40 + spacing),  # 固定宽度 + 固定间距
                y=100,
                width=40,
                height=30
            ),
            confidence=0.9,
            type="handwritten"
        )
        consistent_regions.append(region)
    
    # 计算一致性
    consistency = HandwritingService._compute_spacing_consistency(consistent_regions)
    
    # 验证一致性较高
    assert consistency > 0.8, \
        f"间距一致时，一致性 {consistency} 应该 > 0.8"


@given(
    heights=st.lists(
        st.integers(min_value=20, max_value=40),
        min_size=2,
        max_size=10
    )
)
@settings(max_examples=100)
def test_size_consistency_calculation(heights: list):
    """
    验证大小一致性计算
    
    规则：
    - 高度完全相同时，一致性应该是 1.0
    - 高度差异大时，一致性应该较低
    """
    # 创建测试文本区域
    text_regions = []
    
    for i, height in enumerate(heights):
        region = TextRegion(
            text=f"文本{i}",
            bbox=BoundingBox(x=100 + i * 50, y=100, width=40, height=height),
            confidence=0.9,
            type="handwritten"
        )
        text_regions.append(region)
    
    # 计算一致性
    consistency = HandwritingService._compute_size_consistency(text_regions)
    
    # 验证范围
    assert 0.0 <= consistency <= 1.0, \
        f"大小一致性 {consistency} 超出范围 [0, 1]"
    
    # 如果所有高度相同，一致性应该是 1.0
    if len(set(heights)) == 1:
        assert consistency == 1.0, \
            f"所有高度相同时，一致性应该是 1.0，实际是 {consistency}"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
