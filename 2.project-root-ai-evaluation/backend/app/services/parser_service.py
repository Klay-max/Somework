"""
试卷解析服务
"""
import re
from typing import List, Optional, Tuple
import logging

from app.schemas.ocr import OCRResult, TextRegion
from app.schemas.parser import ExamMeta, Question, ParsedExam

logger = logging.getLogger(__name__)


class ParserService:
    """试卷解析服务"""
    
    # 题号模式（支持多种格式）
    QUESTION_NUMBER_PATTERNS = [
        r'^(\d+)[.、．]',  # 1. 或 1、
        r'^[（(](\d+)[)）]',  # (1) 或 （1）
        r'^([一二三四五六七八九十]+)[.、．]',  # 一、二、三、
    ]
    
    # 分值模式
    SCORE_PATTERNS = [
        r'[（(](\d+)分[)）]',  # (5分)
        r'(\d+)分',  # 5分
        r'本题(\d+)分',  # 本题5分
    ]
    
    # 科目关键词
    SUBJECT_KEYWORDS = {
        '语文': ['语文', '作文', '阅读理解', '文言文'],
        '数学': ['数学', '计算', '几何', '代数', '函数'],
        '英语': ['英语', 'English', '阅读', 'Reading', 'Writing'],
        '物理': ['物理', '力学', '电学', '光学'],
        '化学': ['化学', '元素', '反应', '实验'],
        '生物': ['生物', '细胞', '遗传', '生态'],
        '历史': ['历史', '朝代', '事件'],
        '地理': ['地理', '地图', '气候'],
        '政治': ['政治', '思想', '法律'],
    }
    
    # 年级关键词
    GRADE_KEYWORDS = [
        '一年级', '二年级', '三年级', '四年级', '五年级', '六年级',
        '初一', '初二', '初三', '七年级', '八年级', '九年级',
        '高一', '高二', '高三', '十年级', '十一年级', '十二年级',
    ]
    
    # 考试类型关键词
    EXAM_TYPE_KEYWORDS = [
        '期中考试', '期末考试', '月考', '周考', '单元测试',
        '模拟考试', '摸底考试', '诊断考试', '联考',
    ]
    
    @staticmethod
    def extract_exam_meta(ocr_result: OCRResult) -> ExamMeta:
        """
        提取试卷元数据
        
        Args:
            ocr_result: OCR 识别结果
            
        Returns:
            ExamMeta: 试卷元数据
        """
        # 合并所有文本用于分析
        all_text = ' '.join([region.text for region in ocr_result.text_regions])
        
        # 提取科目
        subject = ParserService._extract_subject(all_text)
        
        # 提取年级
        grade = ParserService._extract_grade(all_text)
        
        # 提取总分
        total_score = ParserService._extract_total_score(all_text)
        
        # 提取考试类型
        exam_type = ParserService._extract_exam_type(all_text)
        
        # 提取考试日期
        exam_date = ParserService._extract_exam_date(all_text)
        
        # 提取学校名称
        school = ParserService._extract_school(all_text)
        
        logger.info(
            f"提取试卷元数据: subject={subject}, grade={grade}, "
            f"total_score={total_score}, exam_type={exam_type}"
        )
        
        return ExamMeta(
            subject=subject,
            grade=grade,
            total_score=total_score,
            exam_type=exam_type,
            exam_date=exam_date,
            school=school
        )
    
    @staticmethod
    def _extract_subject(text: str) -> Optional[str]:
        """提取科目"""
        for subject, keywords in ParserService.SUBJECT_KEYWORDS.items():
            for keyword in keywords:
                if keyword in text:
                    return subject
        return None
    
    @staticmethod
    def _extract_grade(text: str) -> Optional[str]:
        """提取年级"""
        for grade in ParserService.GRADE_KEYWORDS:
            if grade in text:
                return grade
        return None
    
    @staticmethod
    def _extract_total_score(text: str) -> Optional[int]:
        """提取总分"""
        # 匹配 "满分100分" 或 "总分：120"
        patterns = [
            r'满分[：:]*(\d+)',
            r'总分[：:]*(\d+)',
            r'共[：:]*(\d+)分',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                return int(match.group(1))
        
        return None
    
    @staticmethod
    def _extract_exam_type(text: str) -> Optional[str]:
        """提取考试类型"""
        for exam_type in ParserService.EXAM_TYPE_KEYWORDS:
            if exam_type in text:
                return exam_type
        return None
    
    @staticmethod
    def _extract_exam_date(text: str) -> Optional[str]:
        """提取考试日期"""
        # 匹配日期格式：2024年12月25日 或 2024-12-25
        patterns = [
            r'(\d{4})年(\d{1,2})月(\d{1,2})日',
            r'(\d{4})-(\d{1,2})-(\d{1,2})',
            r'(\d{4})/(\d{1,2})/(\d{1,2})',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                year, month, day = match.groups()
                return f"{year}-{month.zfill(2)}-{day.zfill(2)}"
        
        return None
    
    @staticmethod
    def _extract_school(text: str) -> Optional[str]:
        """提取学校名称"""
        # 匹配学校名称模式
        patterns = [
            r'([^，。\s]{2,10}(?:小学|中学|高中|学校))',
            r'学校[：:]*([^，。\s]{2,20})',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                return match.group(1)
        
        return None
    
    @staticmethod
    def segment_questions(ocr_result: OCRResult) -> List[Question]:
        """
        分割题目
        
        Args:
            ocr_result: OCR 识别结果
            
        Returns:
            List[Question]: 题目列表
        """
        questions = []
        current_question = None
        current_text = []
        question_counter = 0
        
        for region in ocr_result.text_regions:
            text = region.text.strip()
            
            # 检查是否是题号
            question_number = ParserService._extract_question_number(text)
            
            if question_number:
                # 保存上一个题目
                if current_question and current_text:
                    current_question.question_text = ' '.join(current_text)
                    questions.append(current_question)
                
                # 开始新题目
                question_counter += 1
                current_question = Question(
                    question_id=f"Q{question_counter}",
                    question_type="objective",  # 默认客观题，后续分类
                    question_text="",
                    bbox=region.bbox
                )
                current_text = [text]
            elif current_question:
                # 继续当前题目
                current_text.append(text)
        
        # 保存最后一个题目
        if current_question and current_text:
            current_question.question_text = ' '.join(current_text)
            questions.append(current_question)
        
        logger.info(f"分割题目完成: 共 {len(questions)} 道题")
        
        return questions
    
    @staticmethod
    def _extract_question_number(text: str) -> Optional[int]:
        """提取题号"""
        for pattern in ParserService.QUESTION_NUMBER_PATTERNS:
            match = re.match(pattern, text)
            if match:
                number_str = match.group(1)
                # 转换中文数字
                if number_str in ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十']:
                    chinese_numbers = {
                        '一': 1, '二': 2, '三': 3, '四': 4, '五': 5,
                        '六': 6, '七': 7, '八': 8, '九': 9, '十': 10
                    }
                    return chinese_numbers.get(number_str)
                else:
                    return int(number_str)
        return None
    
    @staticmethod
    def classify_question_type(question: Question) -> str:
        """
        判断题型（客观题或主观题）
        
        Args:
            question: 题目
            
        Returns:
            str: "objective" 或 "subjective"
        """
        text = question.question_text.lower()
        
        # 客观题关键词
        objective_keywords = [
            '选择', '判断', '填空', '选项', 'a.', 'b.', 'c.', 'd.',
            '正确', '错误', '√', '×'
        ]
        
        # 主观题关键词
        subjective_keywords = [
            '简答', '论述', '分析', '说明', '解释', '计算', '证明',
            '写出', '列举', '描述', '阐述', '评价'
        ]
        
        # 检查客观题特征
        for keyword in objective_keywords:
            if keyword in text:
                return "objective"
        
        # 检查主观题特征
        for keyword in subjective_keywords:
            if keyword in text:
                return "subjective"
        
        # 默认为客观题
        return "objective"
    
    @staticmethod
    def extract_score(question_text: str) -> Optional[int]:
        """
        提取分值
        
        Args:
            question_text: 题目文本
            
        Returns:
            Optional[int]: 分值
        """
        for pattern in ParserService.SCORE_PATTERNS:
            match = re.search(pattern, question_text)
            if match:
                return int(match.group(1))
        
        return None
    
    @staticmethod
    def extract_options(question_text: str) -> Optional[List[str]]:
        """
        提取选项（客观题）
        
        Args:
            question_text: 题目文本
            
        Returns:
            Optional[List[str]]: 选项列表
        """
        # 匹配选项模式：A. xxx B. xxx C. xxx D. xxx
        option_pattern = r'([A-D])[.、．]\s*([^A-D]+?)(?=[A-D][.、．]|$)'
        matches = re.findall(option_pattern, question_text, re.DOTALL)
        
        if matches:
            return [f"{letter}. {text.strip()}" for letter, text in matches]
        
        return None
    
    @staticmethod
    def parse_exam(ocr_result: OCRResult) -> ParsedExam:
        """
        解析试卷
        
        Args:
            ocr_result: OCR 识别结果
            
        Returns:
            ParsedExam: 解析后的试卷
        """
        # 提取元数据
        exam_meta = ParserService.extract_exam_meta(ocr_result)
        
        # 分割题目
        questions = ParserService.segment_questions(ocr_result)
        
        # 处理每个题目
        incomplete_fields = []
        for question in questions:
            # 分类题型
            question.question_type = ParserService.classify_question_type(question)
            
            # 提取分值
            score = ParserService.extract_score(question.question_text)
            if score:
                question.score = score
            else:
                incomplete_fields.append(f"{question.question_id}.score")
            
            # 提取选项（客观题）
            if question.question_type == "objective":
                options = ParserService.extract_options(question.question_text)
                if options:
                    question.options = options
        
        # 计算解析置信度
        parsing_confidence = ParserService._compute_parsing_confidence(
            exam_meta, questions, incomplete_fields
        )
        
        return ParsedExam(
            exam_id="",  # 将由调用者设置
            exam_meta=exam_meta,
            questions=questions,
            parsing_confidence=parsing_confidence,
            incomplete_fields=incomplete_fields
        )
    
    @staticmethod
    def _compute_parsing_confidence(
        exam_meta: ExamMeta,
        questions: List[Question],
        incomplete_fields: List[str]
    ) -> float:
        """计算解析置信度"""
        total_fields = 0
        complete_fields = 0
        
        # 检查元数据完整性
        meta_fields = ['subject', 'grade', 'total_score', 'exam_type']
        for field in meta_fields:
            total_fields += 1
            if getattr(exam_meta, field) is not None:
                complete_fields += 1
        
        # 检查题目完整性
        for question in questions:
            total_fields += 3  # question_text, question_type, score
            if question.question_text:
                complete_fields += 1
            if question.question_type:
                complete_fields += 1
            if question.score:
                complete_fields += 1
        
        if total_fields == 0:
            return 0.0
        
        return complete_fields / total_fields
