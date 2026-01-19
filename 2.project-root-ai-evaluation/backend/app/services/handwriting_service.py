"""
书写分析服务
"""
from typing import List, Tuple
import logging
import numpy as np

from app.schemas.ocr import TextRegion, BoundingBox
from app.schemas.handwriting import HandwritingMetrics

logger = logging.getLogger(__name__)


class HandwritingService:
    """书写分析服务"""
    
    # 凌乱度阈值
    MESSY_THRESHOLD_LOW = 0.3
    MESSY_THRESHOLD_HIGH = 0.7
    
    @staticmethod
    def compute_messy_score(text_regions: List[TextRegion]) -> float:
        """
        计算凌乱度
        
        Args:
            text_regions: 文本区域列表
            
        Returns:
            float: 凌乱度（0-1，越大越凌乱）
        """
        if not text_regions:
            return 0.0
        
        # 只分析手写文本
        handwritten_regions = [
            r for r in text_regions
            if r.type == "handwritten"
        ]
        
        if not handwritten_regions:
            return 0.0
        
        # 计算笔画清晰度（基于 OCR 置信度）
        stroke_clarity = HandwritingService._compute_stroke_clarity(handwritten_regions)
        
        # 计算间距一致性
        spacing_consistency = HandwritingService._compute_spacing_consistency(handwritten_regions)
        
        # 计算大小一致性
        size_consistency = HandwritingService._compute_size_consistency(handwritten_regions)
        
        # 综合计算凌乱度（清晰度和一致性越低，凌乱度越高）
        messy_score = 1.0 - (
            stroke_clarity * 0.4 +
            spacing_consistency * 0.3 +
            size_consistency * 0.3
        )
        
        return min(1.0, max(0.0, messy_score))
    
    @staticmethod
    def _compute_stroke_clarity(regions: List[TextRegion]) -> float:
        """计算笔画清晰度"""
        if not regions:
            return 1.0
        
        # 基于 OCR 置信度
        avg_confidence = sum(r.confidence for r in regions) / len(regions)
        return avg_confidence
    
    @staticmethod
    def _compute_spacing_consistency(regions: List[TextRegion]) -> float:
        """计算间距一致性"""
        if len(regions) < 2:
            return 1.0
        
        # 计算相邻区域的间距
        spacings = []
        sorted_regions = sorted(regions, key=lambda r: (r.bbox.y, r.bbox.x))
        
        for i in range(len(sorted_regions) - 1):
            r1 = sorted_regions[i]
            r2 = sorted_regions[i + 1]
            
            # 计算水平间距
            spacing = r2.bbox.x - (r1.bbox.x + r1.bbox.width)
            if spacing >= 0:  # 只考虑正间距
                spacings.append(spacing)
        
        if not spacings:
            return 1.0
        
        # 计算间距的标准差（标准差越小，一致性越高）
        mean_spacing = sum(spacings) / len(spacings)
        variance = sum((s - mean_spacing) ** 2 for s in spacings) / len(spacings)
        std_dev = variance ** 0.5
        
        # 归一化（假设标准差 > 50 为不一致）
        consistency = 1.0 - min(std_dev / 50.0, 1.0)
        return consistency
    
    @staticmethod
    def _compute_size_consistency(regions: List[TextRegion]) -> float:
        """计算大小一致性"""
        if not regions:
            return 1.0
        
        # 计算高度的标准差
        heights = [r.bbox.height for r in regions]
        
        if len(heights) < 2:
            return 1.0
        
        mean_height = sum(heights) / len(heights)
        variance = sum((h - mean_height) ** 2 for h in heights) / len(heights)
        std_dev = variance ** 0.5
        
        # 归一化（假设标准差 > 20 为不一致）
        consistency = 1.0 - min(std_dev / 20.0, 1.0)
        return consistency
    
    @staticmethod
    def detect_cross_outs(text_regions: List[TextRegion]) -> int:
        """
        检测涂改次数
        
        Args:
            text_regions: 文本区域列表
            
        Returns:
            int: 涂改次数
        """
        # 简化实现：基于文本内容中的特殊字符
        # 实际应该使用图像处理检测涂改痕迹
        cross_out_count = 0
        
        for region in text_regions:
            # 检测常见的涂改标记
            if any(char in region.text for char in ['×', '✗', '╳']):
                cross_out_count += 1
            
            # 检测重复的字符（可能是涂改后重写）
            if len(region.text) > 1:
                unique_chars = len(set(region.text))
                if unique_chars < len(region.text) * 0.5:
                    cross_out_count += 1
        
        logger.info(f"检测到 {cross_out_count} 处涂改")
        return cross_out_count
    
    @staticmethod
    def check_alignment(text_regions: List[TextRegion], page_width: int = 2000) -> bool:
        """
        检查对齐问题
        
        Args:
            text_regions: 文本区域列表
            page_width: 页面宽度
            
        Returns:
            bool: 是否有对齐问题
        """
        if not text_regions:
            return False
        
        # 检查是否有文本超出边界
        for region in text_regions:
            # 检查右边界
            if region.bbox.x + region.bbox.width > page_width:
                logger.info(f"检测到对齐问题: 文本超出右边界")
                return True
            
            # 检查左边界（负坐标）
            if region.bbox.x < 0:
                logger.info(f"检测到对齐问题: 文本超出左边界")
                return True
        
        return False
    
    @staticmethod
    def estimate_misread_risk(
        messy_score: float,
        cross_out_count: int,
        alignment_issue: bool,
        avg_confidence: float
    ) -> str:
        """
        评估误读风险
        
        Args:
            messy_score: 凌乱度
            cross_out_count: 涂改次数
            alignment_issue: 是否有对齐问题
            avg_confidence: 平均 OCR 置信度
            
        Returns:
            str: 风险等级（low, medium, high）
        """
        risk_score = 0.0
        
        # 凌乱度贡献
        if messy_score > HandwritingService.MESSY_THRESHOLD_HIGH:
            risk_score += 0.4
        elif messy_score > HandwritingService.MESSY_THRESHOLD_LOW:
            risk_score += 0.2
        
        # 涂改次数贡献
        if cross_out_count > 5:
            risk_score += 0.3
        elif cross_out_count > 2:
            risk_score += 0.15
        
        # 对齐问题贡献
        if alignment_issue:
            risk_score += 0.2
        
        # OCR 置信度贡献
        if avg_confidence < 0.7:
            risk_score += 0.3
        elif avg_confidence < 0.85:
            risk_score += 0.15
        
        # 判定风险等级
        if risk_score >= 0.6:
            return "high"
        elif risk_score >= 0.3:
            return "medium"
        else:
            return "low"
    
    @staticmethod
    def analyze_handwriting(text_regions: List[TextRegion]) -> HandwritingMetrics:
        """
        分析书写质量
        
        Args:
            text_regions: 文本区域列表
            
        Returns:
            HandwritingMetrics: 书写质量指标
        """
        # 计算凌乱度
        messy_score = HandwritingService.compute_messy_score(text_regions)
        
        # 检测涂改
        cross_out_count = HandwritingService.detect_cross_outs(text_regions)
        
        # 检查对齐
        alignment_issue = HandwritingService.check_alignment(text_regions)
        
        # 计算平均 OCR 置信度
        handwritten_regions = [r for r in text_regions if r.type == "handwritten"]
        avg_confidence = (
            sum(r.confidence for r in handwritten_regions) / len(handwritten_regions)
            if handwritten_regions else 1.0
        )
        
        # 评估误读风险
        risk = HandwritingService.estimate_misread_risk(
            messy_score, cross_out_count, alignment_issue, avg_confidence
        )
        
        # 计算详细指标
        stroke_clarity = HandwritingService._compute_stroke_clarity(handwritten_regions)
        spacing_consistency = HandwritingService._compute_spacing_consistency(handwritten_regions)
        size_consistency = HandwritingService._compute_size_consistency(handwritten_regions)
        
        # 计算边界违规次数
        boundary_violations = sum(
            1 for r in text_regions
            if r.bbox.x < 0 or r.bbox.x + r.bbox.width > 2000
        )
        
        logger.info(
            f"书写分析完成: messy_score={messy_score:.2f}, "
            f"cross_out_count={cross_out_count}, "
            f"alignment_issue={alignment_issue}, "
            f"risk={risk}"
        )
        
        return HandwritingMetrics(
            messy_score=messy_score,
            cross_out_count=cross_out_count,
            alignment_issue=alignment_issue,
            risk_of_machine_misread=risk,
            stroke_clarity=stroke_clarity,
            spacing_consistency=spacing_consistency,
            size_consistency=size_consistency,
            boundary_violations=boundary_violations
        )
