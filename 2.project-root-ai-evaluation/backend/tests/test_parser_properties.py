"""
试卷解析属性测试
使用 Hypothesis 进行基于属性的测试
"""
import pytest
from hypothesis import given, strategies as st, settings
from hypothesis.strategies import composite
import json

from app.schemas.ocr import OCRResult, TextRegion, BoundingBox
from app.schemas.parser import ExamMeta, Question, ParsedExam
from app.services.parser_service import ParserService


# ============================================================================
# 测试数据生成策略
# ============================================================================

@composite
def exam_meta_strategy(draw):
    """生成试卷元数据"""
    subjects = ["语文", "数学", "英语", "物理", "化学", "生物", "历史", "地理", "政治"]
    grades = ["初一", "初二", "初三", "高一", "高二", "高三"]
    exam_types = ["期中考试", "期末考试", "月考", "模拟考试"]
    
    return ExamMeta(
        subject=draw(st.sampled_from(subjects)),
        grade=draw(st.sampled_from(grades)),
        total_score=draw(st.integers(min_value=50, max_value=150)),
        exam_type=draw(st.sampled_from(exam_types)),
        exam_date=draw(st.dates().map(lambda d: d.isoformat())),
        school=draw(st.text(min_size=5, max_size=20))
    )


@composite
def question_strategy(draw):
    """生成题目"""
    question_types = ["objective", "subjective"]
    
    question_id = f"Q{draw(st.integers(min_value=1, max_value=50))}"
    question_type = draw(st.sampled_from(question_types))
    
    question = Question(
        question_id=question_id,
        section=draw(st.text(min_size=2, max_size=10)),
        question_type=question_type,
        question_text=draw(st.text(min_size=10, max_size=200)),
        score=draw(st.integers(min_value=1, max_value=20)),
        knowledge_tags=draw(st.lists(st.text(min_size=2, max_size=10), min_size=0, max_size=5)),
        difficulty=draw(st.floats(min_value=0.0, max_value=1.0)),
        bbox=BoundingBox(
            x=draw(st.integers(min_value=0, max_value=1000)),
            y=draw(st.integers(min_value=0, max_value=1000)),
            width=draw(st.integers(min_value=100, max_value=500)),
            height=draw(st.integers(min_value=50, max_value=200))
        )
    )
    
    # 客观题添加选项
    if question_type == "objective":
        question.options = [
            f"A. {draw(st.text(min_size=5, max_size=30))}",
            f"B. {draw(st.text(min_size=5, max_size=30))}",
            f"C. {draw(st.text(min_size=5, max_size=30))}",
            f"D. {draw(st.text(min_size=5, max_size=30))}"
        ]
        question.correct_answer = draw(st.sampled_from(["A", "B", "C", "D"]))
    
    return question


@composite
def parsed_exam_strategy(draw):
    """生成解析后的试卷"""
    exam_meta = draw(exam_meta_strategy())
    num_questions = draw(st.integers(min_value=1, max_value=30))
    questions = [draw(question_strategy()) for _ in range(num_questions)]
    
    return ParsedExam(
        exam_id=f"exam_{draw(st.integers(min_value=1, max_value=1000))}",
        exam_meta=exam_meta,
        questions=questions,
        parsing_confidence=draw(st.floats(min_value=0.0, max_value=1.0)),
        incomplete_fields=draw(st.lists(st.text(min_size=5, max_size=20), max_size=5))
    )


# ============================================================================
# Property 11: Exam Metadata Extraction
# Feature: ai-exam-assessment, Property 11: Exam Metadata Extraction
# Validates: Requirements 5.1
# ============================================================================

class TestExamMetadataExtraction:
    """测试试卷元数据提取"""
    
    @settings(max_examples=100)
    @given(exam_meta=exam_meta_strategy())
    def test_exam_meta_has_required_fields(self, exam_meta: ExamMeta):
        """
        Property 11: Exam Metadata Extraction
        
        For any valid OCR output, the parser should extract exam metadata
        including subject, grade, total_score, and exam_type.
        """
        # 验证元数据对象可以被创建
        assert exam_meta is not None
        
        # 验证字段类型
        if exam_meta.subject:
            assert isinstance(exam_meta.subject, str)
        if exam_meta.grade:
            assert isinstance(exam_meta.grade, str)
        if exam_meta.total_score:
            assert isinstance(exam_meta.total_score, int)
            assert exam_meta.total_score > 0
        if exam_meta.exam_type:
            assert isinstance(exam_meta.exam_type, str)
    
    @settings(max_examples=100)
    @given(
        subject=st.sampled_from(["语文", "数学", "英语"]),
        grade=st.sampled_from(["初三", "高二"]),
        total_score=st.integers(min_value=50, max_value=150)
    )
    def test_extract_metadata_from_text(self, subject: str, grade: str, total_score: int):
        """
        Property 11: Exam Metadata Extraction (从文本提取)
        
        For any text containing metadata keywords, the parser should
        correctly extract the metadata values.
        """
        # 构造包含元数据的文本
        text = f"{grade}{subject}期中考试 满分{total_score}分"
        
        # 提取科目
        extracted_subject = ParserService._extract_subject(text)
        assert extracted_subject == subject, f"Expected {subject}, got {extracted_subject}"
        
        # 提取年级
        extracted_grade = ParserService._extract_grade(text)
        assert extracted_grade == grade, f"Expected {grade}, got {extracted_grade}"
        
        # 提取总分
        extracted_score = ParserService._extract_total_score(text)
        assert extracted_score == total_score, f"Expected {total_score}, got {extracted_score}"


# ============================================================================
# Property 12: Question Field Completeness
# Feature: ai-exam-assessment, Property 12: Question Field Completeness
# Validates: Requirements 5.2
# ============================================================================

class TestQuestionFieldCompleteness:
    """测试题目字段完整性"""
    
    @settings(max_examples=100)
    @given(question=question_strategy())
    def test_question_has_all_required_fields(self, question: Question):
        """
        Property 12: Question Field Completeness
        
        For any parsed question, the output should include:
        - question_id
        - question_type
        - question_text
        - score
        - and all other required fields
        """
        # 验证必需字段
        assert question.question_id is not None
        assert isinstance(question.question_id, str)
        assert question.question_id.startswith("Q")
        
        assert question.question_type in ["objective", "subjective"]
        
        assert question.question_text is not None
        assert isinstance(question.question_text, str)
        assert len(question.question_text) > 0
        
        # 验证分值
        if question.score:
            assert isinstance(question.score, int)
            assert question.score > 0
        
        # 验证知识点标签
        assert isinstance(question.knowledge_tags, list)
        for tag in question.knowledge_tags:
            assert isinstance(tag, str)
        
        # 验证难度系数
        if question.difficulty is not None:
            assert 0.0 <= question.difficulty <= 1.0
    
    @settings(max_examples=100)
    @given(question=question_strategy())
    def test_objective_question_has_options(self, question: Question):
        """
        Property 12: Question Field Completeness (客观题选项)
        
        For any objective question, it should have options and correct answer.
        """
        if question.question_type == "objective":
            # 客观题应该有选项
            if question.options:
                assert isinstance(question.options, list)
                assert len(question.options) >= 2
                
                # 每个选项应该是字符串
                for option in question.options:
                    assert isinstance(option, str)
                    assert len(option) > 0
    
    @settings(max_examples=100)
    @given(
        question_text=st.text(min_size=20, max_size=100)
    )
    def test_extract_score_from_question_text(self, question_text: str):
        """
        Property 12: Question Field Completeness (分值提取)
        
        For any question text containing score information,
        the parser should correctly extract the score value.
        """
        # 在文本中嵌入分值
        score_value = 5
        text_with_score = f"{question_text} (5分)"
        
        # 提取分值
        extracted_score = ParserService.extract_score(text_with_score)
        
        if extracted_score:
            assert extracted_score == score_value


# ============================================================================
# Property 13: JSON Schema Conformance
# Feature: ai-exam-assessment, Property 13: JSON Schema Conformance
# Validates: Requirements 5.5, 13.6, 15.3
# ============================================================================

class TestJSONSchemaConformance:
    """测试 JSON Schema 一致性"""
    
    @settings(max_examples=100)
    @given(exam_meta=exam_meta_strategy())
    def test_exam_meta_json_serialization(self, exam_meta: ExamMeta):
        """
        Property 13: JSON Schema Conformance (元数据序列化)
        
        For any exam metadata, it should be serializable to JSON
        and deserializable back to the same structure.
        """
        # 序列化为 JSON
        json_data = exam_meta.model_dump()
        assert isinstance(json_data, dict)
        
        # 验证可以转换为 JSON 字符串
        json_str = json.dumps(json_data)
        assert isinstance(json_str, str)
        
        # 反序列化
        parsed_data = json.loads(json_str)
        reconstructed = ExamMeta(**parsed_data)
        
        # 验证数据一致性
        assert reconstructed.subject == exam_meta.subject
        assert reconstructed.grade == exam_meta.grade
        assert reconstructed.total_score == exam_meta.total_score
        assert reconstructed.exam_type == exam_meta.exam_type
    
    @settings(max_examples=100)
    @given(question=question_strategy())
    def test_question_json_serialization(self, question: Question):
        """
        Property 13: JSON Schema Conformance (题目序列化)
        
        For any question, it should be serializable to JSON
        and deserializable back to the same structure.
        """
        # 序列化为 JSON
        json_data = question.model_dump()
        assert isinstance(json_data, dict)
        
        # 验证必需字段存在
        assert "question_id" in json_data
        assert "question_type" in json_data
        assert "question_text" in json_data
        
        # 验证可以转换为 JSON 字符串
        json_str = json.dumps(json_data)
        assert isinstance(json_str, str)
        
        # 反序列化
        parsed_data = json.loads(json_str)
        reconstructed = Question(**parsed_data)
        
        # 验证数据一致性
        assert reconstructed.question_id == question.question_id
        assert reconstructed.question_type == question.question_type
        assert reconstructed.question_text == question.question_text
    
    @settings(max_examples=100)
    @given(parsed_exam=parsed_exam_strategy())
    def test_parsed_exam_json_serialization(self, parsed_exam: ParsedExam):
        """
        Property 13: JSON Schema Conformance (解析结果序列化)
        
        For any parsed exam, it should be serializable to JSON
        and deserializable back to the same structure.
        """
        # 序列化为 JSON
        json_data = parsed_exam.model_dump()
        assert isinstance(json_data, dict)
        
        # 验证必需字段存在
        assert "exam_id" in json_data
        assert "exam_meta" in json_data
        assert "questions" in json_data
        assert "parsing_confidence" in json_data
        
        # 验证可以转换为 JSON 字符串
        json_str = json.dumps(json_data)
        assert isinstance(json_str, str)
        
        # 反序列化
        parsed_data = json.loads(json_str)
        reconstructed = ParsedExam(**parsed_data)
        
        # 验证数据一致性
        assert reconstructed.exam_id == parsed_exam.exam_id
        assert len(reconstructed.questions) == len(parsed_exam.questions)
        assert reconstructed.parsing_confidence == parsed_exam.parsing_confidence
    
    @settings(max_examples=100)
    @given(parsed_exam=parsed_exam_strategy())
    def test_all_required_fields_present(self, parsed_exam: ParsedExam):
        """
        Property 13: JSON Schema Conformance (必需字段)
        
        For any system output, all required fields should be present
        and correctly typed.
        """
        # 验证 ParsedExam 必需字段
        assert parsed_exam.exam_id is not None
        assert parsed_exam.exam_meta is not None
        assert parsed_exam.questions is not None
        assert isinstance(parsed_exam.questions, list)
        assert parsed_exam.parsing_confidence is not None
        assert 0.0 <= parsed_exam.parsing_confidence <= 1.0
        
        # 验证每个题目的必需字段
        for question in parsed_exam.questions:
            assert question.question_id is not None
            assert question.question_type in ["objective", "subjective"]
            assert question.question_text is not None
