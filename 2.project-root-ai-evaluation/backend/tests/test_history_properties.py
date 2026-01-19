"""
历史记录属性测试
使用 Hypothesis 进行基于属性的测试
"""
import pytest
from hypothesis import given, strategies as st, settings
from datetime import datetime, timedelta
from uuid import UUID, uuid4

from app.schemas.history import (
    ExamHistoryItem,
    ExamHistoryResponse,
    ExamDetailResponse,
    ExamDeleteResponse
)


# ============================================================================
# Property 26: History Display Completeness
# ============================================================================

@given(
    exam_count=st.integers(min_value=1, max_value=10)
)
@settings(max_examples=50)
def test_property_26_history_display_completeness(exam_count):
    """
    Property 26: History Display Completeness
    
    验证历史记录中的每个试卷都显示必需信息：
    - 试卷日期
    - 科目
    - 分数
    - 处理状态
    """
    # 创建测试数据
    exam_items = []
    for i in range(exam_count):
        exam_item = ExamHistoryItem(
            exam_id=uuid4(),
            created_at=datetime.utcnow() - timedelta(days=i),
            subject="数学",
            grade="初三",
            total_score=100,
            student_score=85 - i * 2,
            status="completed",
            thumbnail_url=f"https://example.com/thumb_{i}.jpg"
        )
        exam_items.append(exam_item)
    
    # 创建历史记录响应
    history_response = ExamHistoryResponse(
        exams=exam_items,
        total_count=exam_count,
        page=1,
        page_size=20
    )
    
    # 验证所有试卷都有必需信息
    assert len(history_response.exams) == exam_count
    
    for exam in history_response.exams:
        # 验证日期
        assert exam.created_at is not None
        assert isinstance(exam.created_at, datetime)
        
        # 验证科目
        assert exam.subject is not None
        assert isinstance(exam.subject, str)
        assert len(exam.subject) > 0
        
        # 验证分数
        assert exam.total_score is not None
        assert exam.student_score is not None
        assert isinstance(exam.total_score, int)
        assert isinstance(exam.student_score, int)
        
        # 验证状态
        assert exam.status is not None
        assert isinstance(exam.status, str)
        assert len(exam.status) > 0


# ============================================================================
# Test: 历史记录按时间倒序排列
# ============================================================================

def test_history_chronological_order():
    """测试历史记录按时间倒序排列"""
    # 创建不同时间的试卷
    now = datetime.utcnow()
    exam_items = [
        ExamHistoryItem(
            exam_id=uuid4(),
            created_at=now - timedelta(days=3),
            subject="数学",
            status="completed"
        ),
        ExamHistoryItem(
            exam_id=uuid4(),
            created_at=now - timedelta(days=1),
            subject="英语",
            status="completed"
        ),
        ExamHistoryItem(
            exam_id=uuid4(),
            created_at=now - timedelta(days=2),
            subject="物理",
            status="completed"
        )
    ]
    
    # 按时间倒序排序
    sorted_exams = sorted(exam_items, key=lambda x: x.created_at, reverse=True)
    
    # 验证排序正确
    assert sorted_exams[0].subject == "英语"  # 最新
    assert sorted_exams[1].subject == "物理"
    assert sorted_exams[2].subject == "数学"  # 最旧


# ============================================================================
# Test: 试卷详情包含完整信息
# ============================================================================

@given(
    total_questions=st.integers(min_value=10, max_value=50),
    correct_count=st.integers(min_value=0, max_value=50)
)
@settings(max_examples=50)
def test_exam_detail_completeness(total_questions, correct_count):
    """测试试卷详情包含完整信息"""
    # 确保 correct_count 不超过 total_questions
    if correct_count > total_questions:
        correct_count = total_questions
    
    exam_detail = ExamDetailResponse(
        exam_id=uuid4(),
        user_id=uuid4(),
        created_at=datetime.utcnow(),
        status="completed",
        subject="数学",
        grade="初三",
        total_score=100,
        exam_type="期中考试",
        original_image_url="https://example.com/original.jpg",
        processed_image_url="https://example.com/processed.jpg",
        report_html_url="https://example.com/report.html",
        report_pdf_url="https://example.com/report.pdf",
        total_questions=total_questions,
        correct_count=correct_count,
        objective_accuracy=0.85,
        subjective_accuracy=0.65
    )
    
    # 验证基本信息
    assert exam_detail.exam_id is not None
    assert exam_detail.user_id is not None
    assert exam_detail.created_at is not None
    assert exam_detail.status is not None
    
    # 验证试卷元数据
    assert exam_detail.subject is not None
    assert exam_detail.grade is not None
    assert exam_detail.total_score is not None
    
    # 验证图像 URL
    assert exam_detail.original_image_url is not None
    assert exam_detail.original_image_url.startswith("https://")
    
    # 验证统计信息
    assert exam_detail.total_questions == total_questions
    assert exam_detail.correct_count == correct_count
    assert exam_detail.correct_count <= exam_detail.total_questions


# ============================================================================
# Test: 软删除功能
# ============================================================================

def test_soft_delete_response():
    """测试软删除响应"""
    exam_id = uuid4()
    deleted_at = datetime.utcnow()
    recovery_deadline = deleted_at + timedelta(days=30)
    
    delete_response = ExamDeleteResponse(
        exam_id=exam_id,
        deleted_at=deleted_at,
        recovery_deadline=recovery_deadline
    )
    
    # 验证删除响应
    assert delete_response.exam_id == exam_id
    assert delete_response.deleted_at == deleted_at
    assert delete_response.recovery_deadline == recovery_deadline
    
    # 验证恢复期限是 30 天
    time_diff = delete_response.recovery_deadline - delete_response.deleted_at
    assert time_diff.days == 30


# ============================================================================
# Test: 分页功能
# ============================================================================

@given(
    total_count=st.integers(min_value=0, max_value=100),
    page_size=st.integers(min_value=1, max_value=50)
)
@settings(max_examples=50)
def test_pagination(total_count, page_size):
    """测试分页功能"""
    # 计算应该返回的项目数
    expected_items = min(total_count, page_size)
    
    # 创建测试数据
    exam_items = [
        ExamHistoryItem(
            exam_id=uuid4(),
            created_at=datetime.utcnow(),
            subject="数学",
            status="completed"
        )
        for _ in range(expected_items)
    ]
    
    history_response = ExamHistoryResponse(
        exams=exam_items,
        total_count=total_count,
        page=1,
        page_size=page_size
    )
    
    # 验证分页信息
    assert history_response.total_count == total_count
    assert history_response.page == 1
    assert history_response.page_size == page_size
    assert len(history_response.exams) == expected_items
    assert len(history_response.exams) <= page_size


# ============================================================================
# Test: 状态筛选
# ============================================================================

def test_status_filtering():
    """测试状态筛选功能"""
    # 创建不同状态的试卷
    exam_items = [
        ExamHistoryItem(
            exam_id=uuid4(),
            created_at=datetime.utcnow(),
            subject="数学",
            status="completed"
        ),
        ExamHistoryItem(
            exam_id=uuid4(),
            created_at=datetime.utcnow(),
            subject="英语",
            status="processing"
        ),
        ExamHistoryItem(
            exam_id=uuid4(),
            created_at=datetime.utcnow(),
            subject="物理",
            status="completed"
        )
    ]
    
    # 筛选已完成的试卷
    completed_exams = [exam for exam in exam_items if exam.status == "completed"]
    
    # 验证筛选结果
    assert len(completed_exams) == 2
    assert all(exam.status == "completed" for exam in completed_exams)


# ============================================================================
# Test: 科目筛选
# ============================================================================

def test_subject_filtering():
    """测试科目筛选功能"""
    # 创建不同科目的试卷
    exam_items = [
        ExamHistoryItem(
            exam_id=uuid4(),
            created_at=datetime.utcnow(),
            subject="数学",
            status="completed"
        ),
        ExamHistoryItem(
            exam_id=uuid4(),
            created_at=datetime.utcnow(),
            subject="英语",
            status="completed"
        ),
        ExamHistoryItem(
            exam_id=uuid4(),
            created_at=datetime.utcnow(),
            subject="数学",
            status="completed"
        )
    ]
    
    # 筛选数学试卷
    math_exams = [exam for exam in exam_items if exam.subject == "数学"]
    
    # 验证筛选结果
    assert len(math_exams) == 2
    assert all(exam.subject == "数学" for exam in math_exams)
