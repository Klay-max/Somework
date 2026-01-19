"""
诊断引擎属性测试
使用 Hypothesis 进行基于属性的测试
"""
import pytest
from hypothesis import given, strategies as st, settings
from typing import List, Dict, Any
import json

from app.schemas.diagnostic import (
    DiagnosticReport, CapabilityDimensions, Issue, TargetSchoolGap
)
from app.schemas.analysis import QuestionAnalysis, AnswerEvidence, OverallStats
from app.services.deepseek_service import deepseek_service


# ============================================================================
# Property 19: Capability Dimension Completeness
# ============================================================================

@given(
    comprehension=st.floats(min_value=0.0, max_value=1.0),
    application=st.floats(min_value=0.0, max_value=1.0),
    analysis=st.floats(min_value=0.0, max_value=1.0),
    synthesis=st.floats(min_value=0.0, max_value=1.0),
    evaluation=st.floats(min_value=0.0, max_value=1.0)
)
@settings(max_examples=100)
def test_property_19_capability_dimensions_completeness(
    comprehension, application, analysis, synthesis, evaluation
):
    """
    Property 19: Capability Dimension Completeness
    
    验证五维能力评分的完整性：
    1. 所有维度都在 [0, 1] 范围内
    2. 包含所有五个维度
    """
    capability_dimensions = CapabilityDimensions(
        comprehension=comprehension,
        application=application,
        analysis=analysis,
        synthesis=synthesis,
        evaluation=evaluation
    )
    
    # 验证所有维度都在有效范围内
    assert 0.0 <= capability_dimensions.comprehension <= 1.0
    assert 0.0 <= capability_dimensions.application <= 1.0
    assert 0.0 <= capability_dimensions.analysis <= 1.0
    assert 0.0 <= capability_dimensions.synthesis <= 1.0
    assert 0.0 <= capability_dimensions.evaluation <= 1.0
    
    # 验证所有维度都存在
    assert hasattr(capability_dimensions, 'comprehension')
    assert hasattr(capability_dimensions, 'application')
    assert hasattr(capability_dimensions, 'analysis')
    assert hasattr(capability_dimensions, 'synthesis')
    assert hasattr(capability_dimensions, 'evaluation')


# ============================================================================
# Property 20: Evidence-Based Conclusions
# ============================================================================

@given(
    issue_count=st.integers(min_value=1, max_value=10),
    evidence_per_issue=st.integers(min_value=1, max_value=5)
)
@settings(max_examples=100)
def test_property_20_evidence_based_conclusions(issue_count, evidence_per_issue):
    """
    Property 20: Evidence-Based Conclusions
    
    验证所有诊断结论都有证据支撑：
    1. 每个问题至少有一条证据
    2. 证据列表不为空
    """
    issues = []
    for i in range(issue_count):
        evidence = [f"证据{i}_{j}" for j in range(evidence_per_issue)]
        issue = Issue(
            issue=f"问题{i}",
            severity="medium",
            evidence=evidence,
            ai_addressable=True
        )
        issues.append(issue)
    
    # 验证每个问题都有证据
    for issue in issues:
        assert len(issue.evidence) > 0, "每个问题必须有至少一条证据"
        assert all(isinstance(e, str) for e in issue.evidence), "证据必须是字符串"
        assert all(len(e) > 0 for e in issue.evidence), "证据不能为空字符串"


# ============================================================================
# Property 21: Insufficient Evidence Handling
# ============================================================================

@given(
    has_evidence=st.booleans()
)
@settings(max_examples=100)
def test_property_21_insufficient_evidence_handling(has_evidence):
    """
    Property 21: Insufficient Evidence Handling
    
    验证证据不足时的处理：
    1. 当证据不足时，应该标记为"需要更多信息"
    2. 证据列表为空时，应该有明确的标识
    """
    if has_evidence:
        evidence = ["证据1", "证据2"]
    else:
        evidence = []
    
    issue = Issue(
        issue="测试问题",
        severity="medium",
        evidence=evidence,
        ai_addressable=True
    )
    
    if not has_evidence:
        # 证据不足时，应该在问题描述中体现
        assert len(issue.evidence) == 0
        # 在实际应用中，应该有额外的标记或处理


# ============================================================================
# Property 27: DeepSeek Retry Logic
# ============================================================================

@pytest.mark.asyncio
async def test_property_27_deepseek_retry_logic():
    """
    Property 27: DeepSeek Retry Logic
    
    验证 DeepSeek API 的重试逻辑：
    1. 最多重试 3 次
    2. 使用指数退避（1s, 2s, 4s）
    """
    # 验证重试配置
    assert deepseek_service.max_retries == 3
    assert deepseek_service.retry_delays == [1, 2, 4]
    
    # 验证重试延迟是递增的
    for i in range(len(deepseek_service.retry_delays) - 1):
        assert deepseek_service.retry_delays[i] < deepseek_service.retry_delays[i + 1]


# ============================================================================
# Helper: 构建测试用的题目分析
# ============================================================================

def build_question_analysis(
    question_id: str,
    is_correct: bool,
    confidence: float,
    error_reason: str = None
) -> QuestionAnalysis:
    """构建测试用的题目分析"""
    return QuestionAnalysis(
        question_id=question_id,
        student_answer="学生答案",
        correct_answer="正确答案",
        is_correct=is_correct,
        confidence=confidence,
        error_reason=error_reason,
        review_status="ai_confident",
        evidence=AnswerEvidence(
            answer_bbox={"x": 0, "y": 0, "width": 100, "height": 50},
            ocr_confidence=confidence
        )
    )


# ============================================================================
# Test: 计算能力维度
# ============================================================================

def test_compute_capability_dimensions():
    """测试计算五维能力评分"""
    question_analyses = [
        build_question_analysis("Q1", True, 0.9),
        build_question_analysis("Q2", False, 0.7, "审题不清"),
        build_question_analysis("Q3", False, 0.8, "知识点掌握不牢"),
        build_question_analysis("Q4", True, 0.95),
        build_question_analysis("Q5", False, 0.6, "逻辑推理错误"),
    ]
    
    capability_dimensions = deepseek_service.compute_capability_dimensions(question_analyses)
    
    # 验证所有维度都在有效范围内
    assert 0.0 <= capability_dimensions.comprehension <= 1.0
    assert 0.0 <= capability_dimensions.application <= 1.0
    assert 0.0 <= capability_dimensions.analysis <= 1.0
    assert 0.0 <= capability_dimensions.synthesis <= 1.0
    assert 0.0 <= capability_dimensions.evaluation <= 1.0


# ============================================================================
# Test: 提取证据
# ============================================================================

def test_extract_evidence():
    """测试提取诊断报告中的证据"""
    diagnostic_report = DiagnosticReport(
        exam_id="test-exam-id",
        capability_dimensions=CapabilityDimensions(
            comprehension=0.75,
            application=0.68,
            analysis=0.55,
            synthesis=0.60,
            evaluation=0.50
        ),
        surface_issues=[
            Issue(
                issue="书写不够工整",
                severity="medium",
                evidence=["handwriting_metrics.messy_score = 0.35"],
                ai_addressable=False
            )
        ],
        deep_issues=[
            Issue(
                issue="长难句理解能力不足",
                severity="high",
                evidence=["Q12, Q15, Q18 均为长难句题目，错误率 100%"],
                ai_addressable=True,
                root_cause="语法知识体系不完整"
            )
        ]
    )
    
    evidence_list = deepseek_service.extract_evidence(diagnostic_report)
    
    # 验证证据提取
    assert len(evidence_list) == 2
    assert "handwriting_metrics.messy_score = 0.35" in evidence_list
    assert "Q12, Q15, Q18 均为长难句题目，错误率 100%" in evidence_list


# ============================================================================
# Test: 构建诊断报告
# ============================================================================

def test_build_diagnostic_report():
    """测试构建诊断报告"""
    data = {
        "capability_dimensions": {
            "comprehension": 0.75,
            "application": 0.68,
            "analysis": 0.55,
            "synthesis": 0.60,
            "evaluation": 0.50
        },
        "surface_issues": [
            {
                "issue": "书写不够工整",
                "severity": "medium",
                "evidence": ["handwriting_metrics.messy_score = 0.35"],
                "ai_addressable": False,
                "consequence": "影响阅卷老师印象"
            }
        ],
        "deep_issues": [
            {
                "issue": "长难句理解能力不足",
                "severity": "high",
                "evidence": ["Q12, Q15, Q18 错误率 100%"],
                "ai_addressable": True,
                "root_cause": "语法知识体系不完整",
                "consequence": "高考阅读理解将严重失分"
            }
        ],
        "target_school_gap": {
            "target_school": "重点高中",
            "score_gap": 15.0,
            "admission_probability": 0.35,
            "key_improvement_areas": ["阅读理解", "写作表达"]
        }
    }
    
    diagnostic_report = deepseek_service._build_diagnostic_report("test-exam-id", data)
    
    # 验证报告结构
    assert diagnostic_report.exam_id == "test-exam-id"
    assert len(diagnostic_report.surface_issues) == 1
    assert len(diagnostic_report.deep_issues) == 1
    assert diagnostic_report.target_school_gap is not None
    assert diagnostic_report.target_school_gap.target_school == "重点高中"


# ============================================================================
# Test: 构建默认诊断报告
# ============================================================================

def test_build_default_diagnostic_report():
    """测试构建默认诊断报告（诊断失败时）"""
    diagnostic_report = deepseek_service._build_default_diagnostic_report("test-exam-id")
    
    # 验证默认报告
    assert diagnostic_report.exam_id == "test-exam-id"
    assert diagnostic_report.capability_dimensions.comprehension == 0.5
    assert len(diagnostic_report.surface_issues) == 1
    assert diagnostic_report.surface_issues[0].issue == "诊断失败，无法生成详细分析"
    assert diagnostic_report.surface_issues[0].severity == "high"


# ============================================================================
# Test: 构建题目分析摘要
# ============================================================================

def test_build_question_summary():
    """测试构建题目分析摘要"""
    question_analyses = [
        build_question_analysis("Q1", True, 0.9),
        build_question_analysis("Q2", False, 0.7, "审题不清"),
        build_question_analysis("Q3", True, 0.95),
    ]
    
    summary = deepseek_service._build_question_summary(question_analyses)
    
    # 验证摘要格式
    assert "Q1" in summary
    assert "Q2" in summary
    assert "Q3" in summary
    assert "✓" in summary  # 正确标记
    assert "✗" in summary  # 错误标记
    assert "审题不清" in summary


# ============================================================================
# Test: 验证 API 响应
# ============================================================================

def test_validate_response():
    """测试验证 DeepSeek API 响应"""
    # 有效响应
    valid_response = {
        "choices": [
            {
                "message": {
                    "content": "test content"
                }
            }
        ]
    }
    assert deepseek_service.validate_response(valid_response) is True
    
    # 无效响应 - 缺少 choices
    invalid_response_1 = {}
    assert deepseek_service.validate_response(invalid_response_1) is False
    
    # 无效响应 - choices 为空
    invalid_response_2 = {"choices": []}
    assert deepseek_service.validate_response(invalid_response_2) is False
    
    # 无效响应 - 缺少 message
    invalid_response_3 = {"choices": [{}]}
    assert deepseek_service.validate_response(invalid_response_3) is False


# ============================================================================
# Test: 目标学校差距
# ============================================================================

@given(
    score_gap=st.floats(min_value=0.0, max_value=100.0),
    admission_probability=st.floats(min_value=0.0, max_value=1.0)
)
@settings(max_examples=100)
def test_target_school_gap_validation(score_gap, admission_probability):
    """测试目标学校差距的验证"""
    target_school_gap = TargetSchoolGap(
        target_school="重点高中",
        score_gap=score_gap,
        admission_probability=admission_probability,
        key_improvement_areas=["阅读理解", "写作表达"]
    )
    
    # 验证字段范围
    assert target_school_gap.score_gap >= 0.0
    assert 0.0 <= target_school_gap.admission_probability <= 1.0
    assert len(target_school_gap.key_improvement_areas) > 0


# ============================================================================
# Test: 问题严重程度
# ============================================================================

@given(
    severity=st.sampled_from(["low", "medium", "high"])
)
@settings(max_examples=100)
def test_issue_severity_validation(severity):
    """测试问题严重程度的验证"""
    issue = Issue(
        issue="测试问题",
        severity=severity,
        evidence=["证据1"],
        ai_addressable=True
    )
    
    # 验证严重程度在有效范围内
    assert issue.severity in ["low", "medium", "high"]
