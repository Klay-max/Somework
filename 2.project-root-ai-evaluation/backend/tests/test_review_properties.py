"""
教师审核服务的属性测试
使用 Hypothesis 进行基于属性的测试
"""
import pytest
from hypothesis import given, strategies as st, settings
from datetime import datetime

from app.services.review_service import ReviewService
from app.models.review import ReviewPriority, ReviewStatus
from app.schemas.analysis import QuestionAnalysis, AnswerEvidence
from app.schemas.review import TeacherJudgment


# ============================================================================
# Property 16: Teacher Review Status Update
# ============================================================================
# 验证教师审核后状态更新的正确性
# Validates: Requirements 7.5

@given(
    is_correct=st.booleans(),
    error_reason=st.sampled_from([
        "知识点掌握不牢", "审题不清", "粗心大意", "逻辑推理错误", "表达不完整", "无错误"
    ]),
    score_obtained=st.floats(min_value=0.0, max_value=100.0),
    original_confidence=st.floats(min_value=0.0, max_value=1.0)
)
@settings(max_examples=100)
def test_property_16_teacher_review_status_update(
    is_correct: bool,
    error_reason: str,
    score_obtained: float,
    original_confidence: float
):
    """
    Property 16: 教师审核状态更新
    
    验证：
    1. 教师审核后，review_status 应该是 "human_verified"
    2. 置信度应该是 1.0（教师审核）
    3. 判定结果应该被更新
    """
    # 创建原始分析
    original_analysis = QuestionAnalysis(
        question_id="Q1",
        student_answer="测试答案",
        correct_answer="正确答案",
        is_correct=not is_correct,  # 故意设置为相反
        confidence=original_confidence,
        error_reason="AI判定的错误原因",
        review_status="ai_pending_review",
        evidence=AnswerEvidence(
            answer_bbox=None,
            ocr_confidence=0.9,
            answer_clarity=0.8
        ),
        score_obtained=0.0,
        score_total=10.0
    )
    
    # 创建教师判定
    teacher_judgment = TeacherJudgment(
        is_correct=is_correct,
        error_reason=error_reason,
        score_obtained=score_obtained,
        confidence=1.0
    )
    
    # 更新分析
    updated_analysis = ReviewService.update_analysis_with_review(
        original_analysis,
        teacher_judgment,
        teacher_comment="教师评论"
    )
    
    # 验证状态更新
    assert updated_analysis.review_status == "human_verified", \
        "教师审核后状态应该是 human_verified"
    
    # 验证置信度
    assert updated_analysis.confidence == 1.0, \
        "教师审核的置信度应该是 1.0"
    
    # 验证判定结果
    assert updated_analysis.is_correct == is_correct, \
        "判定结果应该被更新为教师的判定"
    
    # 验证错误原因
    assert updated_analysis.error_reason == error_reason, \
        "错误原因应该被更新为教师的判定"
    
    # 验证得分
    assert updated_analysis.score_obtained == score_obtained, \
        "得分应该被更新为教师的判定"


# ============================================================================
# Additional Property Tests
# ============================================================================

@given(
    confidence=st.floats(min_value=0.0, max_value=1.0)
)
@settings(max_examples=100)
def test_priority_determination_consistency(confidence: float):
    """
    验证优先级判定的一致性
    
    规则：
    - confidence < 0.5: HIGH
    - 0.5 <= confidence < 0.8: MEDIUM
    - confidence >= 0.8: LOW
    """
    priority = ReviewService.determine_priority(confidence)
    
    if confidence < 0.5:
        assert priority == ReviewPriority.HIGH, \
            f"置信度 {confidence} < 0.5，优先级应该是 HIGH"
    elif confidence < 0.8:
        assert priority == ReviewPriority.MEDIUM, \
            f"置信度 {confidence} 在 [0.5, 0.8)，优先级应该是 MEDIUM"
    else:
        assert priority == ReviewPriority.LOW, \
            f"置信度 {confidence} >= 0.8，优先级应该是 LOW"


@given(
    original_is_correct=st.booleans(),
    updated_is_correct=st.booleans()
)
@settings(max_examples=100)
def test_report_regeneration_trigger_on_correctness_change(
    original_is_correct: bool,
    updated_is_correct: bool
):
    """
    验证对错判定改变时触发报告重新生成
    """
    original_analysis = QuestionAnalysis(
        question_id="Q1",
        student_answer="测试答案",
        correct_answer="正确答案",
        is_correct=original_is_correct,
        confidence=0.9,
        error_reason="原因",
        review_status="ai_confident",
        evidence=AnswerEvidence(
            answer_bbox=None,
            ocr_confidence=0.9,
            answer_clarity=0.8
        ),
        score_obtained=10.0 if original_is_correct else 0.0,
        score_total=10.0
    )
    
    updated_analysis = QuestionAnalysis(
        question_id="Q1",
        student_answer="测试答案",
        correct_answer="正确答案",
        is_correct=updated_is_correct,
        confidence=1.0,
        error_reason="原因",
        review_status="human_verified",
        evidence=AnswerEvidence(
            answer_bbox=None,
            ocr_confidence=0.9,
            answer_clarity=0.8
        ),
        score_obtained=10.0 if updated_is_correct else 0.0,
        score_total=10.0
    )
    
    should_regenerate = ReviewService.should_trigger_report_regeneration(
        original_analysis,
        updated_analysis
    )
    
    if original_is_correct != updated_is_correct:
        assert should_regenerate, \
            "对错判定改变时应该触发报告重新生成"
    else:
        # 如果对错判定没变，但得分可能变了
        # 这里简化处理，实际可能需要更复杂的逻辑
        pass


@given(
    original_score=st.floats(min_value=0.0, max_value=100.0),
    updated_score=st.floats(min_value=0.0, max_value=100.0)
)
@settings(max_examples=100)
def test_report_regeneration_trigger_on_score_change(
    original_score: float,
    updated_score: float
):
    """
    验证得分改变时触发报告重新生成
    """
    original_analysis = QuestionAnalysis(
        question_id="Q1",
        student_answer="测试答案",
        correct_answer="正确答案",
        is_correct=True,
        confidence=0.9,
        error_reason="无错误",
        review_status="ai_confident",
        evidence=AnswerEvidence(
            answer_bbox=None,
            ocr_confidence=0.9,
            answer_clarity=0.8
        ),
        score_obtained=original_score,
        score_total=100.0
    )
    
    updated_analysis = QuestionAnalysis(
        question_id="Q1",
        student_answer="测试答案",
        correct_answer="正确答案",
        is_correct=True,
        confidence=1.0,
        error_reason="无错误",
        review_status="human_verified",
        evidence=AnswerEvidence(
            answer_bbox=None,
            ocr_confidence=0.9,
            answer_clarity=0.8
        ),
        score_obtained=updated_score,
        score_total=100.0
    )
    
    should_regenerate = ReviewService.should_trigger_report_regeneration(
        original_analysis,
        updated_analysis
    )
    
    if abs(original_score - updated_score) > 0.01:  # 浮点数比较
        assert should_regenerate, \
            "得分改变时应该触发报告重新生成"


@given(
    teacher_count=st.integers(min_value=1, max_value=10),
    exam_subject=st.sampled_from(["数学", "语文", "英语", "物理", "化学"])
)
@settings(max_examples=100)
def test_teacher_selection_prefers_subject_match(
    teacher_count: int,
    exam_subject: str
):
    """
    验证教师选择优先匹配学科
    """
    # 创建教师列表
    teachers = []
    for i in range(teacher_count):
        # 一半教师匹配学科，一半不匹配
        subject = exam_subject if i < teacher_count // 2 else "其他学科"
        teachers.append({
            "teacher_id": f"teacher_{i}",
            "subject": subject,
            "workload": i  # 工作量递增
        })
    
    # 选择教师
    selected_teacher_id = ReviewService.select_teacher(teachers, exam_subject)
    
    # 验证选择结果
    assert selected_teacher_id is not None, "应该选择一个教师"
    
    # 查找选中的教师
    selected_teacher = next(
        (t for t in teachers if t["teacher_id"] == selected_teacher_id),
        None
    )
    
    assert selected_teacher is not None, "选中的教师应该在列表中"
    
    # 如果有学科匹配的教师，应该优先选择
    subject_match_teachers = [t for t in teachers if t["subject"] == exam_subject]
    if subject_match_teachers:
        assert selected_teacher["subject"] == exam_subject, \
            "应该优先选择学科匹配的教师"
        
        # 应该选择工作量最少的
        min_workload = min(t["workload"] for t in subject_match_teachers)
        assert selected_teacher["workload"] == min_workload, \
            "应该选择工作量最少的教师"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
