"""
试卷解析相关的 Pydantic 模型
"""
from typing import List, Optional, Literal
from pydantic import BaseModel, Field

from app.schemas.ocr import BoundingBox


class ExamMeta(BaseModel):
    """试卷元数据"""
    subject: Optional[str] = Field(None, description="科目（如：英语、数学）")
    grade: Optional[str] = Field(None, description="年级（如：初三、高二）")
    total_score: Optional[int] = Field(None, description="总分")
    exam_type: Optional[str] = Field(None, description="考试类型（如：期中考试、期末考试）")
    exam_date: Optional[str] = Field(None, description="考试日期")
    school: Optional[str] = Field(None, description="学校名称")


class Question(BaseModel):
    """题目信息"""
    question_id: str = Field(..., description="题目 ID（如：Q1, Q2）")
    section: Optional[str] = Field(None, description="题目所属部分（如：选择题、填空题）")
    question_type: Literal["objective", "subjective"] = Field(..., description="题型：客观题或主观题")
    question_text: str = Field(..., description="题目文本")
    options: Optional[List[str]] = Field(None, description="选项列表（客观题）")
    correct_answer: Optional[str] = Field(None, description="正确答案")
    score: Optional[int] = Field(None, description="分值")
    knowledge_tags: List[str] = Field(default_factory=list, description="知识点标签")
    difficulty: Optional[float] = Field(None, ge=0.0, le=1.0, description="难度系数（0-1）")
    bbox: Optional[BoundingBox] = Field(None, description="题目在图像中的边界框")


class ParsedExam(BaseModel):
    """解析后的试卷"""
    exam_id: str = Field(..., description="试卷 ID")
    exam_meta: ExamMeta = Field(..., description="试卷元数据")
    questions: List[Question] = Field(..., description="题目列表")
    parsing_confidence: float = Field(..., ge=0.0, le=1.0, description="解析置信度")
    incomplete_fields: List[str] = Field(default_factory=list, description="未完整解析的字段")


class ParseRequest(BaseModel):
    """解析请求"""
    exam_id: str = Field(..., description="试卷 ID")
    use_deepseek: bool = Field(True, description="是否使用 DeepSeek 进行知识点标注和难度估算")


class ParseResponse(BaseModel):
    """解析响应"""
    exam_id: str = Field(..., description="试卷 ID")
    exam_meta: ExamMeta = Field(..., description="试卷元数据")
    questions: List[Question] = Field(..., description="题目列表")
    parsing_confidence: float = Field(..., description="解析置信度")
    incomplete_fields: List[str] = Field(default_factory=list, description="未完整解析的字段")
    total_questions: int = Field(..., description="题目总数")
