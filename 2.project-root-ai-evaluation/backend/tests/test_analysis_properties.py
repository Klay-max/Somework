"""
学生作答分析服务的属性测试
使用 Hypothesis 进行基于属性的测试
"""
import pytest
from hypothesis import given, strategies as st, settings
from app.services.analysis_service import AnalysisService
from app.schemas.parser import Question
from app.schemas.ocr import OCRResult, TextRegion, BoundingBox


# ============================================================================
# Property 14: Objective Answer Matching
# ============================================================================
# 验证客观题答案匹配的一致性和准确性
# Validates: Requirements 6.2

@given(
    correct_answer=st.sampled_from(["A", "B", "C", "D"]),
    noise=st.sampled_from(["", " ", "  ", ".", "、", "选项"])
)
@settings(max_examples=100)
def test_property_14_objective_answer_matching_exact(correct_answer: str, noise: str):
    """
    Property 14: 客观题答案匹配 - 精确匹配
    
    验证：
    1. 相同答案应该匹配成功
    2. 添加噪声后仍能匹配
    3. 大小写不敏感
    """
    # 测试精确匹配
    assert AnalysisService.match_objective_answer(correct_answer, correct_answer)
    
    # 测试添加噪声
    student_answer = noise + correct_answer + noise
    assert AnalysisService.match_objective_answer(student_answer, correct_answer)
    
    # 测试大小写
    assert AnalysisService.match_objective_answer(
        correct_answer.lower(), correct_answer.upper()
    )


@given(
    correct_answer=st.sampled_from(["A", "B", "C", "D"]),
    wrong_answer=st.sampled_from(["A", "B", "C", "D"])
)
@settings(max_examples=100)
def test_property_14_objective_answer_matching_wrong(correct_answer: str, wrong_answer: str):
    """
    Property 14: 客观题答案匹配 - 错误答案
    
    验证：
    1. 不同答案应该匹配失败
    """
    if correct_answer != wrong_answer:
        assert not AnalysisService.match_objective_answer(wrong_answer, correct_answer)


@given(
    answer=st.sampled_from(["A", "B", "C", "D"]),
    prefix=st.sampled_from(["选", "答案是", "我选择", "应该选"]),
    suffix=st.sampled_from(["", "项", "选项"])
)
@settings(max_examples=100)
def test_property_14_objective_answer_matching_with_text(answer: str, prefix: str, suffix: str):
    """
    Property 14: 客观题答案匹配 - 带文字描述
    
    验证：
    1. 能从文字描述中提取选项字母
    2. 匹配成功
    """
    student_answer = f"{prefix}{answer}{suffix}"
    assert AnalysisService.match_objective_answer(student_answer, answer)


# ============================================================================
# Property 15: Review Flagging Threshold
# ============================================================================
# 验证低置信度答案标记为待审核的阈值
# Validates: Requirements 6.5

@given(
    ocr_confidence=st.floats(min_value=0.0, max_value=1.0),
    answer_clarity=st.floats(min_value=0.0, max_value=1.0),
    question_type=st.sampled_from(["objective", "subjective"])
)
@settings(max_examples=100)
def test_property_15_review_flagging_threshold(
    ocr_confidence: float,
    answer_clarity: float,
    question_type: str
):
    """
    Property 15: 审核标记阈值
    
    验证：
    1. 置信度 >= 0.8 时，状态为 "ai_confident"
    2. 置信度 < 0.8 时，状态为 "ai_pending_review"
    3. 置信度计算的一致性
    """
    # 计算置信度
    confidence = AnalysisService.compute_confidence(
        ocr_confidence, answer_clarity, question_type
    )
    
    # 确定审核状态
    review_status = AnalysisService.determine_review_status(confidence)
    
    # 验证阈值
    if confidence >= 0.8:
        assert review_status == "ai_confident", \
            f"置信度 {confidence:.2f} >= 0.8，应该是 ai_confident"
    else:
        assert review_status == "ai_pending_review", \
            f"置信度 {confidence:.2f} < 0.8，应该是 ai_pending_review"


@given(
    ocr_confidence=st.floats(min_value=0.9, max_value=1.0),
    answer_clarity=st.floats(min_value=0.9, max_value=1.0)
)
@settings(max_examples=100)
def test_property_15_high_confidence_objective(ocr_confidence: float, answer_clarity: float):
    """
    Property 15: 高置信度客观题
    
    验证：
    1. 高 OCR 置信度 + 高答案清晰度 -> ai_confident
    """
    confidence = AnalysisService.compute_confidence(
        ocr_confidence, answer_clarity, "objective"
    )
    review_status = AnalysisService.determine_review_status(confidence)
    
    assert review_status == "ai_confident", \
        f"高置信度客观题应该是 ai_confident，实际置信度: {confidence:.2f}"


@given(
    ocr_confidence=st.floats(min_value=0.0, max_value=0.5),
    answer_clarity=st.floats(min_value=0.0, max_value=0.5)
)
@settings(max_examples=100)
def test_property_15_low_confidence_subjective(ocr_confidence: float, answer_clarity: float):
    """
    Property 15: 低置信度主观题
    
    验证：
    1. 低 OCR 置信度 + 低答案清晰度 -> ai_pending_review
    """
    confidence = AnalysisService.compute_confidence(
        ocr_confidence, answer_clarity, "subjective"
    )
    review_status = AnalysisService.determine_review_status(confidence)
    
    assert review_status == "ai_pending_review", \
        f"低置信度主观题应该是 ai_pending_review，实际置信度: {confidence:.2f}"


# ============================================================================
# Additional Property Tests
# ============================================================================

@given(
    answer_text=st.text(min_size=0, max_size=100)
)
@settings(max_examples=100)
def test_answer_clarity_range(answer_text: str):
    """
    验证答案清晰度在有效范围内 [0, 1]
    """
    clarity = AnalysisService.compute_answer_clarity(answer_text)
    assert 0.0 <= clarity <= 1.0, f"答案清晰度 {clarity} 超出范围 [0, 1]"


@given(
    ocr_confidence=st.floats(min_value=0.0, max_value=1.0),
    answer_clarity=st.floats(min_value=0.0, max_value=1.0),
    question_type=st.sampled_from(["objective", "subjective"])
)
@settings(max_examples=100)
def test_confidence_range(ocr_confidence: float, answer_clarity: float, question_type: str):
    """
    验证置信度在有效范围内 [0, 1]
    """
    confidence = AnalysisService.compute_confidence(
        ocr_confidence, answer_clarity, question_type
    )
    assert 0.0 <= confidence <= 1.0, f"置信度 {confidence} 超出范围 [0, 1]"


@given(
    question_type=st.sampled_from(["objective", "subjective"]),
    is_correct=st.booleans()
)
@settings(max_examples=100)
def test_error_reason_consistency(question_type: str, is_correct: bool):
    """
    验证错误原因分类的一致性
    """
    question = Question(
        question_id="Q1",
        question_text="测试题目",
        question_type=question_type,
        score=10.0
    )
    
    error_reason = AnalysisService.classify_error_reason(
        question=question,
        student_answer="测试答案",
        is_correct=is_correct,
        confidence=0.9
    )
    
    # 验证错误原因在预定义列表中
    assert error_reason in AnalysisService.ERROR_REASONS.values(), \
        f"错误原因 {error_reason} 不在预定义列表中"
    
    # 验证正确答案的错误原因
    if is_correct:
        assert error_reason == AnalysisService.ERROR_REASONS["no_error"], \
            "正确答案的错误原因应该是 'no_error'"


@given(
    x=st.floats(min_value=0, max_value=1000),
    y=st.floats(min_value=0, max_value=1000),
    width=st.floats(min_value=10, max_value=500),
    height=st.floats(min_value=10, max_value=500)
)
@settings(max_examples=100)
def test_extract_student_answer_bbox(x: float, y: float, width: float, height: float):
    """
    验证学生答案提取的边界框计算
    """
    # 创建测试数据
    question = Question(
        question_id="Q1",
        question_text="测试题目",
        question_type="objective",
        score=10.0,
        bbox=BoundingBox(x=int(x), y=int(y), width=int(width), height=int(height))
    )
    
    # 创建答案区域（在题目下方）
    answer_region = TextRegion(
        text="A",
        bbox=BoundingBox(x=int(x), y=int(y + height + 10), width=50, height=30),
        confidence=0.95,
        type="handwritten"
    )
    
    ocr_result = OCRResult(
        text_regions=[answer_region],
        overall_confidence=0.95,
        processing_time=1.0,
        provider="test"
    )
    
    # 提取学生答案
    student_answer, answer_bbox, ocr_confidence = AnalysisService.extract_student_answer(
        question, ocr_result
    )
    
    # 验证结果
    if student_answer:
        assert answer_bbox is not None, "答案边界框不应为空"
        assert answer_bbox.y > question.bbox.y, "答案应该在题目下方"
        assert 0.0 <= ocr_confidence <= 1.0, "OCR 置信度应该在 [0, 1] 范围内"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
