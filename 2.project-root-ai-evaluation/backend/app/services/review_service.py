"""
教师审核服务
"""
from typing import List, Optional, Tuple
from datetime import datetime
import logging

from app.schemas.analysis import QuestionAnalysis
from app.schemas.review import AIJudgment, TeacherJudgment, ReviewTaskDetail
from app.models.review import ReviewTask, ReviewPriority, ReviewStatus
from app.schemas.ocr import BoundingBox

logger = logging.getLogger(__name__)


class ReviewService:
    """教师审核服务"""
    
    @staticmethod
    def determine_priority(confidence: float) -> ReviewPriority:
        """
        根据置信度确定审核优先级
        
        Args:
            confidence: 置信度（0-1）
            
        Returns:
            ReviewPriority: 优先级
        """
        if confidence < 0.5:
            return ReviewPriority.HIGH
        elif confidence < 0.8:
            return ReviewPriority.MEDIUM
        else:
            return ReviewPriority.LOW
    
    @staticmethod
    def create_review_task(
        exam_id: str,
        question_analysis: QuestionAnalysis,
        image_url: str
    ) -> dict:
        """
        创建审核任务
        
        Args:
            exam_id: 试卷 ID
            question_analysis: 题目分析结果
            image_url: 试卷图像 URL
            
        Returns:
            dict: 审核任务数据
        """
        # 确定优先级
        priority = ReviewService.determine_priority(question_analysis.confidence)
        
        # 构建 AI 判定信息
        ai_judgment = AIJudgment(
            is_correct=question_analysis.is_correct,
            confidence=question_analysis.confidence,
            error_reason=question_analysis.error_reason,
            student_answer=question_analysis.student_answer,
            correct_answer=question_analysis.correct_answer
        )
        
        # 创建审核任务数据
        review_task_data = {
            "exam_id": exam_id,
            "question_id": question_analysis.question_id,
            "priority": priority,
            "status": ReviewStatus.PENDING,
            "ai_judgment": ai_judgment.dict(),
            "created_at": datetime.utcnow()
        }
        
        logger.info(
            f"创建审核任务: exam_id={exam_id}, "
            f"question_id={question_analysis.question_id}, "
            f"priority={priority}, confidence={question_analysis.confidence}"
        )
        
        return review_task_data
    
    @staticmethod
    def assign_review(
        review_task: ReviewTask,
        teacher_id: str,
        teacher_subject: Optional[str] = None,
        teacher_workload: int = 0
    ) -> ReviewTask:
        """
        分配审核任务
        
        Args:
            review_task: 审核任务
            teacher_id: 教师 ID
            teacher_subject: 教师学科专长
            teacher_workload: 教师当前工作量
            
        Returns:
            ReviewTask: 更新后的审核任务
        """
        review_task.assigned_to = teacher_id
        review_task.assigned_at = datetime.utcnow()
        review_task.status = ReviewStatus.IN_PROGRESS
        
        logger.info(
            f"分配审核任务: review_id={review_task.review_id}, "
            f"teacher_id={teacher_id}, subject={teacher_subject}, "
            f"workload={teacher_workload}"
        )
        
        return review_task
    
    @staticmethod
    def select_teacher(
        available_teachers: List[dict],
        exam_subject: Optional[str] = None
    ) -> Optional[str]:
        """
        选择合适的教师
        
        Args:
            available_teachers: 可用教师列表
            exam_subject: 试卷科目
            
        Returns:
            Optional[str]: 教师 ID
        """
        if not available_teachers:
            return None
        
        # 优先选择学科匹配的教师
        if exam_subject:
            subject_match = [
                t for t in available_teachers
                if t.get("subject") == exam_subject
            ]
            if subject_match:
                # 选择工作量最少的
                return min(subject_match, key=lambda t: t.get("workload", 0))["teacher_id"]
        
        # 否则选择工作量最少的教师
        return min(available_teachers, key=lambda t: t.get("workload", 0))["teacher_id"]
    
    @staticmethod
    def update_analysis_with_review(
        question_analysis: QuestionAnalysis,
        teacher_judgment: TeacherJudgment,
        teacher_comment: Optional[str] = None
    ) -> QuestionAnalysis:
        """
        用教师审核结果更新分析
        
        Args:
            question_analysis: 原始题目分析
            teacher_judgment: 教师判定
            teacher_comment: 教师评论
            
        Returns:
            QuestionAnalysis: 更新后的分析
        """
        # 更新判定结果
        question_analysis.is_correct = teacher_judgment.is_correct
        question_analysis.error_reason = teacher_judgment.error_reason
        question_analysis.confidence = teacher_judgment.confidence
        question_analysis.review_status = "human_verified"
        
        # 更新得分
        if teacher_judgment.score_obtained is not None:
            question_analysis.score_obtained = teacher_judgment.score_obtained
        
        logger.info(
            f"更新分析结果: question_id={question_analysis.question_id}, "
            f"is_correct={teacher_judgment.is_correct}, "
            f"confidence={teacher_judgment.confidence}"
        )
        
        return question_analysis
    
    @staticmethod
    def should_trigger_report_regeneration(
        original_analysis: QuestionAnalysis,
        updated_analysis: QuestionAnalysis
    ) -> bool:
        """
        判断是否需要重新生成报告
        
        Args:
            original_analysis: 原始分析
            updated_analysis: 更新后的分析
            
        Returns:
            bool: 是否需要重新生成
        """
        # 如果对错判定改变，需要重新生成
        if original_analysis.is_correct != updated_analysis.is_correct:
            return True
        
        # 如果错误原因改变，需要重新生成
        if original_analysis.error_reason != updated_analysis.error_reason:
            return True
        
        # 如果得分改变，需要重新生成
        if original_analysis.score_obtained != updated_analysis.score_obtained:
            return True
        
        return False
    
    @staticmethod
    def compute_review_stats(review_tasks: List[ReviewTask]) -> dict:
        """
        计算审核统计
        
        Args:
            review_tasks: 审核任务列表
            
        Returns:
            dict: 统计信息
        """
        total_reviews = len(review_tasks)
        completed_reviews = sum(
            1 for t in review_tasks
            if t.status == ReviewStatus.COMPLETED
        )
        pending_reviews = sum(
            1 for t in review_tasks
            if t.status == ReviewStatus.PENDING
        )
        
        # 计算平均审核时间
        completed_tasks = [
            t for t in review_tasks
            if t.status == ReviewStatus.COMPLETED and t.completed_at and t.assigned_at
        ]
        
        if completed_tasks:
            total_time = sum(
                (t.completed_at - t.assigned_at).total_seconds()
                for t in completed_tasks
            )
            average_review_time = total_time / len(completed_tasks)
        else:
            average_review_time = None
        
        return {
            "total_reviews": total_reviews,
            "completed_reviews": completed_reviews,
            "pending_reviews": pending_reviews,
            "average_review_time": average_review_time,
            "completion_rate": completed_reviews / total_reviews if total_reviews > 0 else 0.0
        }
