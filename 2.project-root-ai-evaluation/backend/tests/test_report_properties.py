"""
报告生成属性测试
使用 Hypothesis 进行基于属性的测试
"""
import pytest
from hypothesis import given, strategies as st, settings
from bs4 import BeautifulSoup
import re

from app.services.report_service import report_service
from app.schemas.diagnostic import (
    DiagnosticReport, CapabilityDimensions, Issue, TargetSchoolGap
)
from app.schemas.analysis import OverallStats


# ============================================================================
# Property 22: Report Page Count
# ============================================================================

def test_property_22_report_page_count():
    """
    Property 22: Report Page Count
    
    验证生成的报告包含恰好 4 页
    """
    # 创建测试数据
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
                evidence=["Q12, Q15, Q18 错误率 100%"],
                ai_addressable=True,
                root_cause="语法知识体系不完整"
            )
        ],
        target_school_gap=TargetSchoolGap(
            target_school="重点高中",
            score_gap=15.0,
            admission_probability=0.35,
            key_improvement_areas=["阅读理解", "写作表达"]
        )
    )
    
    overall_stats = OverallStats(
        total_questions=30,
        correct_count=22,
        objective_accuracy=0.85,
        subjective_accuracy=0.65,
        pending_review_count=5
    )
    
    exam_meta = {
        "subject": "英语",
        "grade": "初三",
        "total_score": 120
    }
    
    # 生成 HTML
    html_content = report_service.generate_html(
        exam_id="test-exam-id",
        diagnostic_report=diagnostic_report,
        overall_stats=overall_stats,
        exam_meta=exam_meta
    )
    
    # 解析 HTML
    soup = BeautifulSoup(html_content, 'html.parser')
    pages = soup.find_all('div', class_='page')
    
    # 验证页数
    assert len(pages) == 4, f"报告应该包含 4 页，实际包含 {len(pages)} 页"
    
    # 验证每页的类名
    assert 'page-1' in pages[0].get('class', [])
    assert 'page-2' in pages[1].get('class', [])
    assert 'page-3' in pages[2].get('class', [])
    assert 'page-4' in pages[3].get('class', [])


# ============================================================================
# Property 23: Page 1 Content Completeness
# ============================================================================

def test_property_23_page1_content_completeness():
    """
    Property 23: Page 1 Content Completeness
    
    验证 Page 1 包含所有必需元素：
    - 总分展示
    - 客观题 vs 主观题正确率
    - 五维能力评估
    - 目标学校差距（如果有）
    """
    diagnostic_report = DiagnosticReport(
        exam_id="test-exam-id",
        capability_dimensions=CapabilityDimensions(
            comprehension=0.75,
            application=0.68,
            analysis=0.55,
            synthesis=0.60,
            evaluation=0.50
        ),
        surface_issues=[],
        deep_issues=[],
        target_school_gap=TargetSchoolGap(
            target_school="重点高中",
            score_gap=15.0,
            admission_probability=0.35,
            key_improvement_areas=["阅读理解"]
        )
    )
    
    overall_stats = OverallStats(
        total_questions=30,
        correct_count=85,
        objective_accuracy=0.85,
        subjective_accuracy=0.65,
        pending_review_count=0
    )
    
    exam_meta = {
        "subject": "英语",
        "grade": "初三",
        "total_score": 120
    }
    
    html_content = report_service.generate_html(
        exam_id="test-exam-id",
        diagnostic_report=diagnostic_report,
        overall_stats=overall_stats,
        exam_meta=exam_meta
    )
    
    soup = BeautifulSoup(html_content, 'html.parser')
    page1 = soup.find('div', class_='page-1')
    
    # 验证总分展示
    score_display = page1.find('div', class_='score-display')
    assert score_display is not None, "Page 1 应该包含总分展示"
    assert '85' in score_display.text
    assert '120' in score_display.text
    
    # 验证客观题 vs 主观题正确率
    accuracy_comparison = page1.find('div', class_='accuracy-comparison')
    assert accuracy_comparison is not None, "Page 1 应该包含正确率对比"
    assert '85%' in accuracy_comparison.text
    assert '65%' in accuracy_comparison.text
    
    # 验证五维能力评估
    capability_dimensions = page1.find('div', class_='capability-dimensions')
    assert capability_dimensions is not None, "Page 1 应该包含五维能力评估"
    assert '理解能力' in capability_dimensions.text
    assert '应用能力' in capability_dimensions.text
    assert '分析能力' in capability_dimensions.text
    assert '综合能力' in capability_dimensions.text
    assert '评价能力' in capability_dimensions.text
    
    # 验证目标学校差距
    target_gap = page1.find('div', class_='target-gap')
    assert target_gap is not None, "Page 1 应该包含目标学校差距"
    assert '重点高中' in target_gap.text
    assert '15' in target_gap.text


# ============================================================================
# Property 20: Evidence-Based Conclusions (报告中的证据)
# ============================================================================

@given(
    issue_count=st.integers(min_value=1, max_value=5),
    evidence_per_issue=st.integers(min_value=1, max_value=3)
)
@settings(max_examples=50)
def test_property_20_report_evidence_based_conclusions(issue_count, evidence_per_issue):
    """
    Property 20: Evidence-Based Conclusions (报告版本)
    
    验证报告中的所有问题都有证据支撑
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
    
    diagnostic_report = DiagnosticReport(
        exam_id="test-exam-id",
        capability_dimensions=CapabilityDimensions(
            comprehension=0.5,
            application=0.5,
            analysis=0.5,
            synthesis=0.5,
            evaluation=0.5
        ),
        surface_issues=issues[:issue_count//2] if issue_count > 1 else [],
        deep_issues=issues[issue_count//2:],
        target_school_gap=None
    )
    
    overall_stats = OverallStats(
        total_questions=30,
        correct_count=20,
        objective_accuracy=0.7,
        subjective_accuracy=0.6,
        pending_review_count=0
    )
    
    exam_meta = {"subject": "数学", "grade": "初三", "total_score": 100}
    
    html_content = report_service.generate_html(
        exam_id="test-exam-id",
        diagnostic_report=diagnostic_report,
        overall_stats=overall_stats,
        exam_meta=exam_meta
    )
    
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # 验证所有问题都在报告中
    for issue in issues:
        assert issue.issue in html_content, f"问题 '{issue.issue}' 应该在报告中"
        
        # 验证证据也在报告中
        for evidence in issue.evidence:
            assert evidence in html_content, f"证据 '{evidence}' 应该在报告中"


# ============================================================================
# Test: HTML 结构验证
# ============================================================================

def test_html_structure_validity():
    """测试 HTML 结构的有效性"""
    diagnostic_report = DiagnosticReport(
        exam_id="test-exam-id",
        capability_dimensions=CapabilityDimensions(
            comprehension=0.75,
            application=0.68,
            analysis=0.55,
            synthesis=0.60,
            evaluation=0.50
        ),
        surface_issues=[],
        deep_issues=[],
        target_school_gap=None
    )
    
    overall_stats = OverallStats(
        total_questions=30,
        correct_count=22,
        objective_accuracy=0.85,
        subjective_accuracy=0.65,
        pending_review_count=0
    )
    
    exam_meta = {"subject": "英语", "grade": "初三", "total_score": 120}
    
    html_content = report_service.generate_html(
        exam_id="test-exam-id",
        diagnostic_report=diagnostic_report,
        overall_stats=overall_stats,
        exam_meta=exam_meta
    )
    
    # 验证 HTML 基本结构
    assert '<!DOCTYPE html>' in html_content
    assert '<html' in html_content
    assert '</html>' in html_content
    assert '<head>' in html_content
    assert '</head>' in html_content
    assert '<body>' in html_content
    assert '</body>' in html_content
    
    # 验证 meta 标签
    assert '<meta charset="UTF-8">' in html_content
    assert '<meta name="viewport"' in html_content
    
    # 验证标题
    assert '<title>' in html_content


# ============================================================================
# Test: 能力维度渲染
# ============================================================================

@given(
    comprehension=st.floats(min_value=0.0, max_value=1.0),
    application=st.floats(min_value=0.0, max_value=1.0),
    analysis=st.floats(min_value=0.0, max_value=1.0),
    synthesis=st.floats(min_value=0.0, max_value=1.0),
    evaluation=st.floats(min_value=0.0, max_value=1.0)
)
@settings(max_examples=50)
def test_capability_dimensions_rendering(
    comprehension, application, analysis, synthesis, evaluation
):
    """测试能力维度的渲染"""
    diagnostic_report = DiagnosticReport(
        exam_id="test-exam-id",
        capability_dimensions=CapabilityDimensions(
            comprehension=comprehension,
            application=application,
            analysis=analysis,
            synthesis=synthesis,
            evaluation=evaluation
        ),
        surface_issues=[],
        deep_issues=[],
        target_school_gap=None
    )
    
    overall_stats = OverallStats(
        total_questions=30,
        correct_count=20,
        objective_accuracy=0.7,
        subjective_accuracy=0.6,
        pending_review_count=0
    )
    
    exam_meta = {"subject": "数学", "grade": "初三", "total_score": 100}
    
    html_content = report_service.generate_html(
        exam_id="test-exam-id",
        diagnostic_report=diagnostic_report,
        overall_stats=overall_stats,
        exam_meta=exam_meta
    )
    
    # 验证所有能力维度都在报告中
    assert '理解能力' in html_content
    assert '应用能力' in html_content
    assert '分析能力' in html_content
    assert '综合能力' in html_content
    assert '评价能力' in html_content
    
    # 验证分数值在报告中
    assert f'{comprehension:.2f}' in html_content
    assert f'{application:.2f}' in html_content
    assert f'{analysis:.2f}' in html_content
    assert f'{synthesis:.2f}' in html_content
    assert f'{evaluation:.2f}' in html_content


# ============================================================================
# Test: PDF 生成（简化测试）
# ============================================================================

def test_pdf_generation():
    """测试 PDF 生成功能（简化版本）"""
    html_content = "<html><body><h1>Test Report</h1></body></html>"
    
    pdf_content = report_service.generate_pdf(html_content)
    
    # 验证返回的是字节类型
    assert isinstance(pdf_content, bytes)
    assert len(pdf_content) > 0


# ============================================================================
# Test: OSS 上传（简化测试）
# ============================================================================

def test_oss_upload():
    """测试 OSS 上传功能（简化版本）"""
    file_content = b"test content"
    filename = "test-report.html"
    
    url = report_service.upload_to_oss(file_content, filename)
    
    # 验证返回的是 URL 字符串
    assert isinstance(url, str)
    assert url.startswith("https://")
    assert filename in url
