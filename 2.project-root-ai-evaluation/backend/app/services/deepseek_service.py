"""
DeepSeek AI 服务
用于知识点标注、难度估算和诊断分析
"""
import asyncio
import httpx
from typing import List, Dict, Any, Optional
import logging
import json

from app.core.config import settings
from app.schemas.parser import Question
from app.schemas.analysis import QuestionAnalysis, OverallStats
from app.schemas.handwriting import HandwritingMetrics
from app.schemas.diagnostic import (
    DiagnosticReport, CapabilityDimensions, Issue, TargetSchoolGap
)
from app.services.cache_service import CacheService

logger = logging.getLogger(__name__)


class DeepSeekService:
    """DeepSeek AI 服务"""
    
    def __init__(self):
        """初始化 DeepSeek 服务"""
        self.api_key = settings.DEEPSEEK_API_KEY
        self.api_url = settings.DEEPSEEK_API_URL
        self.max_retries = settings.DEEPSEEK_MAX_RETRIES
        self.retry_delays = settings.DEEPSEEK_RETRY_DELAYS
    
    async def _call_api(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 1000
    ) -> Dict[str, Any]:
        """
        调用 DeepSeek API
        
        Args:
            messages: 消息列表
            temperature: 温度参数
            max_tokens: 最大 token 数
            
        Returns:
            Dict: API 响应
        """
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "deepseek-chat",
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        
        # 实现重试逻辑
        for attempt in range(self.max_retries):
            try:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    response = await client.post(
                        f"{self.api_url}/chat/completions",
                        headers=headers,
                        json=payload
                    )
                    response.raise_for_status()
                    return response.json()
            
            except Exception as e:
                logger.error(f"DeepSeek API 调用失败 (尝试 {attempt + 1}/{self.max_retries}): {e}")
                
                if attempt < self.max_retries - 1:
                    # 指数退避
                    delay = self.retry_delays[attempt] if attempt < len(self.retry_delays) else self.retry_delays[-1]
                    logger.info(f"等待 {delay} 秒后重试...")
                    await asyncio.sleep(delay)
                else:
                    raise Exception(f"DeepSeek API 调用失败，已重试 {self.max_retries} 次")
    
    async def tag_knowledge_points(self, question: Question) -> List[str]:
        """
        标注知识点（带缓存）
        
        Args:
            question: 题目
            
        Returns:
            List[str]: 知识点列表
        """
        # 尝试从缓存获取
        cached_points = await CacheService.get_knowledge_points(
            question.subject or "unknown",
            question.question_text
        )
        if cached_points:
            logger.info(f"从缓存获取知识点: {question.question_id}")
            return cached_points
        
        prompt = f"""请分析以下题目，提取其涉及的知识点。

题目：{question.question_text}

请以 JSON 格式返回知识点列表，格式如下：
{{"knowledge_points": ["知识点1", "知识点2", "知识点3"]}}

要求：
1. 知识点应该具体、准确
2. 每个知识点不超过10个字
3. 最多返回5个知识点
4. 只返回 JSON，不要其他文字"""

        messages = [
            {"role": "system", "content": "你是一位专业的教育测评专家，擅长分析题目的知识点。"},
            {"role": "user", "content": prompt}
        ]
        
        try:
            response = await self._call_api(messages, temperature=0.3)
            content = response["choices"][0]["message"]["content"]
            
            # 解析 JSON 响应
            data = json.loads(content)
            knowledge_points = data.get("knowledge_points", [])
            
            # 缓存结果
            await CacheService.set_knowledge_points(
                question.subject or "unknown",
                question.question_text,
                knowledge_points
            )
            
            logger.info(f"知识点标注完成: {question.question_id} -> {knowledge_points}")
            return knowledge_points
        
        except Exception as e:
            logger.error(f"知识点标注失败: {e}")
            return []
    
    async def estimate_difficulty(self, question: Question) -> float:
        """
        估算难度
        
        Args:
            question: 题目
            
        Returns:
            float: 难度系数（0-1，越大越难）
        """
        prompt = f"""请评估以下题目的难度系数。

题目：{question.question_text}
题型：{"客观题" if question.question_type == "objective" else "主观题"}

请以 JSON 格式返回难度系数，格式如下：
{{"difficulty": 0.65, "reason": "难度评估理由"}}

难度系数说明：
- 0.0-0.3: 简单（基础知识，直接应用）
- 0.3-0.5: 中等（需要理解和简单推理）
- 0.5-0.7: 较难（需要综合分析）
- 0.7-1.0: 困难（需要深入理解和复杂推理）

只返回 JSON，不要其他文字"""

        messages = [
            {"role": "system", "content": "你是一位专业的教育测评专家，擅长评估题目难度。"},
            {"role": "user", "content": prompt}
        ]
        
        try:
            response = await self._call_api(messages, temperature=0.3)
            content = response["choices"][0]["message"]["content"]
            
            # 解析 JSON 响应
            data = json.loads(content)
            difficulty = data.get("difficulty", 0.5)
            
            # 确保在有效范围内
            difficulty = max(0.0, min(1.0, difficulty))
            
            logger.info(f"难度估算完成: {question.question_id} -> {difficulty}")
            return difficulty
        
        except Exception as e:
            logger.error(f"难度估算失败: {e}")
            return 0.5  # 默认中等难度
    
    async def enrich_question(self, question: Question) -> Question:
        """
        丰富题目信息（知识点 + 难度）
        
        Args:
            question: 题目
            
        Returns:
            Question: 丰富后的题目
        """
        # 并发执行知识点标注和难度估算
        knowledge_points, difficulty = await asyncio.gather(
            self.tag_knowledge_points(question),
            self.estimate_difficulty(question)
        )
        
        question.knowledge_tags = knowledge_points
        question.difficulty = difficulty
        
        return question
    
    async def enrich_questions_batch(self, questions: List[Question]) -> List[Question]:
        """
        批量丰富题目信息
        
        Args:
            questions: 题目列表
            
        Returns:
            List[Question]: 丰富后的题目列表
        """
        # 并发处理所有题目
        enriched_questions = await asyncio.gather(
            *[self.enrich_question(q) for q in questions],
            return_exceptions=True
        )
        
        # 处理异常
        result = []
        for i, q in enumerate(enriched_questions):
            if isinstance(q, Exception):
                logger.error(f"题目 {questions[i].question_id} 丰富失败: {q}")
                result.append(questions[i])  # 使用原始题目
            else:
                result.append(q)
        
        return result
    
    async def evaluate_subjective_answer(
        self,
        question_text: str,
        student_answer: str,
        correct_answer: Optional[str] = None,
        max_score: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        评估主观题答案
        
        Args:
            question_text: 题目文本
            student_answer: 学生答案
            correct_answer: 参考答案（可选）
            max_score: 满分（可选）
            
        Returns:
            Dict: 评估结果 {"score": 0.8, "is_correct": True, "reason": "..."}
        """
        prompt = f"""请评估以下主观题的学生答案。

题目：{question_text}

学生答案：{student_answer}

{"参考答案：" + correct_answer if correct_answer else ""}

请以 JSON 格式返回评估结果，格式如下：
{{
    "score_ratio": 0.8,
    "is_correct": true,
    "reason": "评估理由",
    "strengths": ["优点1", "优点2"],
    "weaknesses": ["不足1", "不足2"]
}}

评分说明：
- score_ratio: 得分比例（0-1），表示学生答案的质量
- is_correct: 是否基本正确（得分 >= 0.6 视为正确）
- reason: 简要说明评分理由
- strengths: 答案的优点
- weaknesses: 答案的不足

只返回 JSON，不要其他文字"""

        messages = [
            {"role": "system", "content": "你是一位专业的教育测评专家，擅长评估学生答案。"},
            {"role": "user", "content": prompt}
        ]
        
        try:
            response = await self._call_api(messages, temperature=0.3)
            content = response["choices"][0]["message"]["content"]
            
            # 解析 JSON 响应
            data = json.loads(content)
            
            # 计算实际得分
            if max_score:
                data["score"] = data["score_ratio"] * max_score
            
            logger.info(f"主观题评分完成: score_ratio={data['score_ratio']}, is_correct={data['is_correct']}")
            return data
        
        except Exception as e:
            logger.error(f"主观题评分失败: {e}")
            # 返回默认评估
            return {
                "score_ratio": 0.5,
                "is_correct": False,
                "reason": "评估失败，使用默认分数",
                "strengths": [],
                "weaknesses": ["无法评估"]
            }
    
    def validate_response(self, response: Dict[str, Any]) -> bool:
        """
        验证 DeepSeek API 响应
        
        Args:
            response: API 响应
            
        Returns:
            bool: 是否有效
        """
        required_fields = ["choices"]
        
        for field in required_fields:
            if field not in response:
                logger.error(f"响应缺少必需字段: {field}")
                return False
        
        if not response["choices"]:
            logger.error("响应中没有选择项")
            return False
        
        if "message" not in response["choices"][0]:
            logger.error("响应中没有消息")
            return False
        
        return True
    
    async def diagnose_exam(
        self,
        exam_id: str,
        subject: str,
        grade: str,
        total_score: float,
        student_score: float,
        question_analyses: List[QuestionAnalysis],
        overall_stats: OverallStats,
        handwriting_metrics: Optional[Dict[str, Any]] = None,
        target_school: Optional[str] = None
    ) -> DiagnosticReport:
        """
        诊断试卷，生成深度诊断报告
        
        Args:
            exam_id: 试卷ID
            subject: 科目
            grade: 年级
            total_score: 总分
            student_score: 学生得分
            question_analyses: 题目分析列表
            overall_stats: 整体统计
            handwriting_metrics: 书写指标
            target_school: 目标学校
            
        Returns:
            DiagnosticReport: 诊断报告
        """
        # 构建题目分析摘要
        question_summary = self._build_question_summary(question_analyses)
        
        # 构建诊断 Prompt
        prompt = self._build_diagnostic_prompt(
            subject=subject,
            grade=grade,
            total_score=total_score,
            student_score=student_score,
            question_summary=question_summary,
            overall_stats=overall_stats,
            handwriting_metrics=handwriting_metrics,
            target_school=target_school
        )
        
        messages = [
            {"role": "system", "content": "你是一位资深的 K12 教育测评专家，擅长深度诊断学生的学习问题。"},
            {"role": "user", "content": prompt}
        ]
        
        try:
            response = await self._call_api(messages, temperature=0.5, max_tokens=2000)
            content = response["choices"][0]["message"]["content"]
            
            # 解析 JSON 响应
            data = json.loads(content)
            
            # 验证并构建诊断报告
            diagnostic_report = self._build_diagnostic_report(exam_id, data)
            
            logger.info(f"诊断完成: {exam_id}")
            return diagnostic_report
        
        except Exception as e:
            logger.error(f"诊断失败: {e}")
            # 返回默认诊断报告
            return self._build_default_diagnostic_report(exam_id)
    
    def _build_question_summary(self, question_analyses: List[QuestionAnalysis]) -> str:
        """构建题目分析摘要"""
        summary_lines = []
        
        for qa in question_analyses:
            status = "✓" if qa.is_correct else "✗"
            summary_lines.append(
                f"{status} {qa.question_id}: "
                f"学生答案='{qa.student_answer}', "
                f"正确答案='{qa.correct_answer}', "
                f"置信度={qa.confidence:.2f}, "
                f"错误原因={qa.error_reason or '无'}"
            )
        
        return "\n".join(summary_lines)
    
    def _build_diagnostic_prompt(
        self,
        subject: str,
        grade: str,
        total_score: float,
        student_score: float,
        question_summary: str,
        overall_stats: OverallStats,
        handwriting_metrics: Optional[Dict[str, Any]],
        target_school: Optional[str]
    ) -> str:
        """构建诊断 Prompt"""
        
        handwriting_info = ""
        if handwriting_metrics:
            handwriting_info = f"""
【书写分析】
凌乱度：{handwriting_metrics.get('messy_score', 0):.2f}
涂改次数：{handwriting_metrics.get('cross_out_count', 0)}
对齐问题：{'是' if handwriting_metrics.get('alignment_issue', False) else '否'}
误读风险：{handwriting_metrics.get('risk_of_machine_misread', 'unknown')}
"""
        
        target_info = ""
        if target_school:
            target_info = f"\n目标学校：{target_school}"
        
        prompt = f"""你是一位资深的 K12 教育测评专家。请基于以下学生试卷分析数据，进行深度诊断。

【试卷信息】
科目：{subject}
年级：{grade}
总分：{total_score}
学生得分：{student_score}
客观题正确率：{overall_stats.objective_accuracy:.2%}
主观题正确率：{overall_stats.subjective_accuracy:.2%}{target_info}

【题目分析】
{question_summary}
{handwriting_info}

【诊断要求】
1. 分析学生在五个能力维度的表现：理解(comprehension)、应用(application)、分析(analysis)、综合(synthesis)、评价(evaluation)
2. 区分表层问题（30%）和深层问题（70%）
3. 每个问题必须引用具体证据（题号、错误模式、指标）
4. 判断问题是否可通过 AI 辅助解决
5. 如果提供了目标学校，预测与目标学校的差距

【输出格式】
严格按照 JSON 格式输出，包含：
{{
    "capability_dimensions": {{
        "comprehension": 0.75,
        "application": 0.68,
        "analysis": 0.55,
        "synthesis": 0.60,
        "evaluation": 0.50
    }},
    "surface_issues": [
        {{
            "issue": "书写不够工整",
            "severity": "medium",
            "evidence": ["handwriting_metrics.messy_score = 0.35"],
            "ai_addressable": false,
            "consequence": "影响阅卷老师印象，可能丢失卷面分"
        }}
    ],
    "deep_issues": [
        {{
            "issue": "长难句理解能力不足",
            "severity": "high",
            "evidence": ["Q12, Q15, Q18 均为长难句题目，错误率 100%"],
            "ai_addressable": true,
            "root_cause": "语法知识体系不完整，缺乏句子结构分析能力",
            "consequence": "高考阅读理解将严重失分"
        }}
    ],
    "target_school_gap": {{
        "target_school": "{target_school or '重点高中'}",
        "score_gap": 15.0,
        "admission_probability": 0.35,
        "key_improvement_areas": ["阅读理解", "写作表达"]
    }}
}}

【重要】
- 所有结论必须有证据支撑
- 避免鼓励性废话
- 语气专业、克制、具有诊断权威感
- 只返回 JSON，不要其他文字
"""
        
        return prompt
    
    def _build_diagnostic_report(self, exam_id: str, data: Dict[str, Any]) -> DiagnosticReport:
        """构建诊断报告"""
        
        # 构建能力维度
        capability_data = data.get("capability_dimensions", {})
        capability_dimensions = CapabilityDimensions(
            comprehension=capability_data.get("comprehension", 0.5),
            application=capability_data.get("application", 0.5),
            analysis=capability_data.get("analysis", 0.5),
            synthesis=capability_data.get("synthesis", 0.5),
            evaluation=capability_data.get("evaluation", 0.5)
        )
        
        # 构建表层问题
        surface_issues = []
        for issue_data in data.get("surface_issues", []):
            surface_issues.append(Issue(
                issue=issue_data.get("issue", ""),
                severity=issue_data.get("severity", "medium"),
                evidence=issue_data.get("evidence", []),
                ai_addressable=issue_data.get("ai_addressable", False),
                consequence=issue_data.get("consequence")
            ))
        
        # 构建深层问题
        deep_issues = []
        for issue_data in data.get("deep_issues", []):
            deep_issues.append(Issue(
                issue=issue_data.get("issue", ""),
                severity=issue_data.get("severity", "medium"),
                evidence=issue_data.get("evidence", []),
                ai_addressable=issue_data.get("ai_addressable", False),
                consequence=issue_data.get("consequence"),
                root_cause=issue_data.get("root_cause")
            ))
        
        # 构建目标学校差距
        target_school_gap = None
        if "target_school_gap" in data:
            gap_data = data["target_school_gap"]
            target_school_gap = TargetSchoolGap(
                target_school=gap_data.get("target_school", ""),
                score_gap=gap_data.get("score_gap", 0.0),
                admission_probability=gap_data.get("admission_probability", 0.0),
                key_improvement_areas=gap_data.get("key_improvement_areas", [])
            )
        
        return DiagnosticReport(
            exam_id=exam_id,
            capability_dimensions=capability_dimensions,
            surface_issues=surface_issues,
            deep_issues=deep_issues,
            target_school_gap=target_school_gap
        )
    
    def _build_default_diagnostic_report(self, exam_id: str) -> DiagnosticReport:
        """构建默认诊断报告（当诊断失败时）"""
        return DiagnosticReport(
            exam_id=exam_id,
            capability_dimensions=CapabilityDimensions(
                comprehension=0.5,
                application=0.5,
                analysis=0.5,
                synthesis=0.5,
                evaluation=0.5
            ),
            surface_issues=[
                Issue(
                    issue="诊断失败，无法生成详细分析",
                    severity="high",
                    evidence=["系统错误"],
                    ai_addressable=False,
                    consequence="需要人工审核"
                )
            ],
            deep_issues=[],
            target_school_gap=None
        )
    
    def extract_evidence(self, diagnostic_report: DiagnosticReport) -> List[str]:
        """
        提取诊断报告中的所有证据
        
        Args:
            diagnostic_report: 诊断报告
            
        Returns:
            List[str]: 证据列表
        """
        evidence_list = []
        
        # 提取表层问题的证据
        for issue in diagnostic_report.surface_issues:
            evidence_list.extend(issue.evidence)
        
        # 提取深层问题的证据
        for issue in diagnostic_report.deep_issues:
            evidence_list.extend(issue.evidence)
        
        return evidence_list
    
    def compute_capability_dimensions(
        self,
        question_analyses: List[QuestionAnalysis]
    ) -> CapabilityDimensions:
        """
        计算五维能力评分（基于规则的简单实现）
        
        Args:
            question_analyses: 题目分析列表
            
        Returns:
            CapabilityDimensions: 五维能力评分
        """
        # 这是一个简化的实现，实际应该基于题目的能力标签
        # 这里我们基于正确率和错误原因进行简单估算
        
        total = len(question_analyses)
        if total == 0:
            return CapabilityDimensions(
                comprehension=0.5,
                application=0.5,
                analysis=0.5,
                synthesis=0.5,
                evaluation=0.5
            )
        
        # 统计各类错误
        comprehension_errors = sum(1 for qa in question_analyses 
                                   if not qa.is_correct and qa.error_reason == "审题不清")
        application_errors = sum(1 for qa in question_analyses 
                                if not qa.is_correct and qa.error_reason == "知识点掌握不牢")
        analysis_errors = sum(1 for qa in question_analyses 
                             if not qa.is_correct and qa.error_reason == "逻辑推理错误")
        synthesis_errors = sum(1 for qa in question_analyses 
                              if not qa.is_correct and qa.error_reason == "表达不完整")
        
        # 计算能力得分（1 - 错误率）
        return CapabilityDimensions(
            comprehension=max(0.0, 1.0 - comprehension_errors / total),
            application=max(0.0, 1.0 - application_errors / total),
            analysis=max(0.0, 1.0 - analysis_errors / total),
            synthesis=max(0.0, 1.0 - synthesis_errors / total),
            evaluation=max(0.0, 1.0 - (total - sum(qa.is_correct for qa in question_analyses)) / total)
        )


# 创建全局 DeepSeek 服务实例
deepseek_service = DeepSeekService()
