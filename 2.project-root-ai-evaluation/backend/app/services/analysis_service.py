"""
学生作答分析服务
"""
import re
from typing import List, Optional, Tuple
import logging
from difflib import SequenceMatcher

from app.schemas.ocr import OCRResult, TextRegion, BoundingBox
from app.schemas.parser import Question, ParsedExam
from app.schemas.analysis import QuestionAnalysis, AnswerEvidence, OverallStats
from app.core.config import settings

logger = logging.getLogger(__name__)


class AnalysisService:
    """学生作答分析服务"""
    
    # 错误原因分类
    ERROR_REASONS = {
        "knowledge_gap": "知识点掌握不牢",
        "misunderstanding": "审题不清",
        "careless": "粗心大意",
        "logic_error": "逻辑推理错误",
        "incomplete": "表达不完整",
        "no_error": "无错误"
    }
    
    # 置信度阈值
    CONFIDENCE_THRESHOLD = 0.8
    
    @staticmethod
    def extract_student_answer(
        question: Question,
        ocr_result: OCRResult
    ) -> Tuple[Optional[str], Optional[BoundingBox], float]:
        """
        提取学生答案
        
        Args:
            question: 题目
            ocr_result: OCR 识别结果
            
        Returns:
            Tuple[答案文本, 边界框, OCR置信度]
        """
        # 如果题目有边界框，查找其下方的文本区域作为答案
        if not question.bbox:
            return None, None, 0.0
        
        # 查找答案区域（题目下方）
        answer_regions = []
        question_bottom = question.bbox.y + question.bbox.height
        
        for region in ocr_result.text_regions:
            # 答案应该在题目下方
            if region.bbox.y > question_bottom:
                # 检查是否在题目的水平范围内
                if (region.bbox.x >= question.bbox.x - 50 and
                    region.bbox.x <= question.bbox.x + question.bbox.width + 50):
                    answer_regions.append(region)
        
        if not answer_regions:
            return None, None, 0.0
        
        # 合并答案区域
        answer_text = ' '.join([r.text for r in answer_regions])
        
        # 计算平均置信度
        avg_confidence = sum(r.confidence for r in answer_regions) / len(answer_regions)
        
        # 计算答案边界框（包含所有答案区域）
        if answer_regions:
            min_x = min(r.bbox.x for r in answer_regions)
            min_y = min(r.bbox.y for r in answer_regions)
            max_x = max(r.bbox.x + r.bbox.width for r in answer_regions)
            max_y = max(r.bbox.y + r.bbox.height for r in answer_regions)
            
            answer_bbox = BoundingBox(
                x=min_x,
                y=min_y,
                width=max_x - min_x,
                height=max_y - min_y
            )
        else:
            answer_bbox = None
        
        return answer_text, answer_bbox, avg_confidence
    
    @staticmethod
    def match_objective_answer(student_answer: str, correct_answer: str) -> bool:
        """
        客观题答案匹配
        
        Args:
            student_answer: 学生答案
            correct_answer: 正确答案
            
        Returns:
            bool: 是否正确
        """
        if not student_answer or not correct_answer:
            return False
        
        # 标准化答案（去除空格、转大写）
        student = student_answer.strip().upper()
        correct = correct_answer.strip().upper()
        
        # 精确匹配
        if student == correct:
            return True
        
        # 提取选项字母（A, B, C, D）
        student_option = AnalysisService._extract_option_letter(student)
        correct_option = AnalysisService._extract_option_letter(correct)
        
        if student_option and correct_option:
            return student_option == correct_option
        
        # 模糊匹配（相似度 > 0.9）
        similarity = SequenceMatcher(None, student, correct).ratio()
        return similarity > 0.9
    
    @staticmethod
    def _extract_option_letter(text: str) -> Optional[str]:
        """提取选项字母"""
        # 匹配 A, B, C, D
        match = re.search(r'[ABCD]', text.upper())
        return match.group(0) if match else None
    
    @staticmethod
    def compute_answer_clarity(answer: str) -> float:
        """
        计算答案清晰度
        
        Args:
            answer: 答案文本
            
        Returns:
            float: 清晰度（0-1）
        """
        if not answer:
            return 0.0
        
        # 基于答案长度和特殊字符的启发式评分
        clarity = 1.0
        
        # 太短的答案可能不清晰
        if len(answer) < 2:
            clarity *= 0.5
        
        # 包含太多特殊字符可能是识别错误
        special_chars = sum(1 for c in answer if not c.isalnum() and not c.isspace())
        if special_chars > len(answer) * 0.3:
            clarity *= 0.7
        
        return clarity
    
    @staticmethod
    def compute_confidence(
        ocr_confidence: float,
        answer_clarity: float,
        question_type: str
    ) -> float:
        """
        计算判定置信度
        
        Args:
            ocr_confidence: OCR 置信度
            answer_clarity: 答案清晰度
            question_type: 题型（objective/subjective）
            
        Returns:
            float: 置信度（0-1）
        """
        # 客观题权重更高
        type_weight = 1.0 if question_type == "objective" else 0.7
        
        # 加权平均
        confidence = (
            ocr_confidence * 0.5 +
            answer_clarity * 0.3 +
            type_weight * 0.2
        )
        
        return min(1.0, max(0.0, confidence))
    
    @staticmethod
    def classify_error_reason(
        question: Question,
        student_answer: Optional[str],
        is_correct: bool,
        confidence: float
    ) -> str:
        """
        分类错误原因
        
        Args:
            question: 题目
            student_answer: 学生答案
            is_correct: 是否正确
            confidence: 置信度
            
        Returns:
            str: 错误原因
        """
        if is_correct:
            return AnalysisService.ERROR_REASONS["no_error"]
        
        if not student_answer:
            return AnalysisService.ERROR_REASONS["incomplete"]
        
        # 主观题且答案不完整
        if question.question_type == "subjective":
            if len(student_answer) < 10:
                return AnalysisService.ERROR_REASONS["incomplete"]
        
        # 基于题目难度和知识点的启发式分类
        if question.difficulty and question.difficulty > 0.7:
            return AnalysisService.ERROR_REASONS["knowledge_gap"]
        
        # 客观题且置信度高，可能是粗心
        if question.question_type == "objective" and confidence > 0.8:
            return AnalysisService.ERROR_REASONS["careless"]
        
        # 默认为知识点掌握不牢
        return AnalysisService.ERROR_REASONS["knowledge_gap"]
    
    @staticmethod
    def determine_review_status(confidence: float) -> str:
        """
        确定审核状态
        
        Args:
            confidence: 置信度
            
        Returns:
            str: 审核状态
        """
        if confidence >= AnalysisService.CONFIDENCE_THRESHOLD:
            return "ai_confident"
        else:
            return "ai_pending_review"
    
    @staticmethod
    def analyze_question(
        question: Question,
        ocr_result: OCRResult
    ) -> QuestionAnalysis:
        """
        分析单个题目
        
        Args:
            question: 题目
            ocr_result: OCR 识别结果
            
        Returns:
            QuestionAnalysis: 题目分析结果
        """
        # 提取学生答案
        student_answer, answer_bbox, ocr_confidence = AnalysisService.extract_student_answer(
            question, ocr_result
        )
        
        # 计算答案清晰度
        answer_clarity = AnalysisService.compute_answer_clarity(student_answer or "")
        
        # 判定对错
        is_correct = None
        if student_answer and question.correct_answer:
            if question.question_type == "objective":
                is_correct = AnalysisService.match_objective_answer(
                    student_answer, question.correct_answer
                )
            # 主观题需要 DeepSeek 评分，这里先标记为 None
        
        # 计算置信度
        confidence = AnalysisService.compute_confidence(
            ocr_confidence,
            answer_clarity,
            question.question_type
        )
        
        # 分类错误原因
        error_reason = AnalysisService.classify_error_reason(
            question,
            student_answer,
            is_correct if is_correct is not None else False,
            confidence
        )
        
        # 确定审核状态
        review_status = AnalysisService.determine_review_status(confidence)
        
        # 计算得分
        score_obtained = None
        if is_correct is not None and question.score:
            score_obtained = question.score if is_correct else 0.0
        
        return QuestionAnalysis(
            question_id=question.question_id,
            student_answer=student_answer,
            correct_answer=question.correct_answer,
            is_correct=is_correct,
            confidence=confidence,
            error_reason=error_reason,
            review_status=review_status,
            evidence=AnswerEvidence(
                answer_bbox=answer_bbox,
                ocr_confidence=ocr_confidence,
                answer_clarity=answer_clarity
            ),
            score_obtained=score_obtained,
            score_total=question.score
        )
    
    @staticmethod
    def compute_overall_stats(
        question_analyses: List[QuestionAnalysis]
    ) -> OverallStats:
        """
        计算整体统计
        
        Args:
            question_analyses: 题目分析列表
            
        Returns:
            OverallStats: 整体统计
        """
        total_questions = len(question_analyses)
        correct_count = sum(1 for qa in question_analyses if qa.is_correct)
        
        # 分别统计客观题和主观题
        objective_analyses = [qa for qa in question_analyses if qa.question_id.startswith("Q")]
        subjective_analyses = [qa for qa in question_analyses if not qa.question_id.startswith("Q")]
        
        objective_correct = sum(1 for qa in objective_analyses if qa.is_correct)
        subjective_correct = sum(1 for qa in subjective_analyses if qa.is_correct)
        
        objective_accuracy = objective_correct / len(objective_analyses) if objective_analyses else 0.0
        subjective_accuracy = subjective_correct / len(subjective_analyses) if subjective_analyses else 0.0
        
        # 统计待审核题数
        pending_review_count = sum(
            1 for qa in question_analyses
            if qa.review_status == "ai_pending_review"
        )
        
        # 计算总得分
        total_score = sum(
            qa.score_obtained for qa in question_analyses
            if qa.score_obtained is not None
        )
        max_score = sum(
            qa.score_total for qa in question_analyses
            if qa.score_total is not None
        )
        
        return OverallStats(
            total_questions=total_questions,
            correct_count=correct_count,
            objective_accuracy=objective_accuracy,
            subjective_accuracy=subjective_accuracy,
            pending_review_count=pending_review_count,
            total_score=total_score if total_score > 0 else None,
            max_score=max_score if max_score > 0 else None
        )
    
    @staticmethod
    def analyze_exam(
        parsed_exam: ParsedExam,
        ocr_result: OCRResult
    ) -> Tuple[List[QuestionAnalysis], OverallStats]:
        """
        分析整份试卷
        
        Args:
            parsed_exam: 解析后的试卷
            ocr_result: OCR 识别结果
            
        Returns:
            Tuple[题目分析列表, 整体统计]
        """
        question_analyses = []
        
        for question in parsed_exam.questions:
            analysis = AnalysisService.analyze_question(question, ocr_result)
            question_analyses.append(analysis)
        
        overall_stats = AnalysisService.compute_overall_stats(question_analyses)
        
        logger.info(
            f"试卷分析完成: 总题数={overall_stats.total_questions}, "
            f"正确={overall_stats.correct_count}, "
            f"待审核={overall_stats.pending_review_count}"
        )
        
        return question_analyses, overall_stats
