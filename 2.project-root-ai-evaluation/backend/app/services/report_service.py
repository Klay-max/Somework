"""
报告生成服务
"""
import uuid
from typing import Dict, Any, Optional
from datetime import datetime
import logging

from app.schemas.diagnostic import DiagnosticReport
from app.schemas.analysis import OverallStats

logger = logging.getLogger(__name__)


class ReportService:
    """报告生成服务"""
    
    def __init__(self):
        """初始化报告服务"""
        pass
    
    def generate_html(
        self,
        exam_id: str,
        diagnostic_report: DiagnosticReport,
        overall_stats: OverallStats,
        exam_meta: Dict[str, Any]
    ) -> str:
        """
        生成 HTML 报告
        
        Args:
            exam_id: 试卷ID
            diagnostic_report: 诊断报告
            overall_stats: 整体统计
            exam_meta: 试卷元数据
            
        Returns:
            str: HTML 内容
        """
        html_content = self._build_html_template(
            exam_id=exam_id,
            diagnostic_report=diagnostic_report,
            overall_stats=overall_stats,
            exam_meta=exam_meta
        )
        
        logger.info(f"HTML 报告生成完成: {exam_id}")
        return html_content
    
    def _build_html_template(
        self,
        exam_id: str,
        diagnostic_report: DiagnosticReport,
        overall_stats: OverallStats,
        exam_meta: Dict[str, Any]
    ) -> str:
        """构建 HTML 模板"""
        
        # 提取数据
        subject = exam_meta.get("subject", "未知")
        grade = exam_meta.get("grade", "未知")
        total_score = exam_meta.get("total_score", 100)
        student_score = overall_stats.correct_count
        
        capability_dims = diagnostic_report.capability_dimensions
        surface_issues = diagnostic_report.surface_issues
        deep_issues = diagnostic_report.deep_issues
        target_gap = diagnostic_report.target_school_gap
        
        # 构建 HTML
        html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI 试卷测评报告</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        body {{
            font-family: 'Microsoft YaHei', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
        }}
        
        .page {{
            width: 210mm;
            min-height: 297mm;
            padding: 20mm;
            margin: 20px auto;
            background: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            page-break-after: always;
        }}
        
        h1 {{
            color: #2c3e50;
            font-size: 28px;
            margin-bottom: 20px;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
        }}
        
        h2 {{
            color: #34495e;
            font-size: 22px;
            margin: 20px 0 15px 0;
        }}
        
        h3 {{
            color: #7f8c8d;
            font-size: 18px;
            margin: 15px 0 10px 0;
        }}
        
        .score-display {{
            text-align: center;
            margin: 30px 0;
        }}
        
        .score-value {{
            font-size: 72px;
            font-weight: bold;
            color: #e74c3c;
            display: inline-block;
        }}
        
        .score-total {{
            font-size: 36px;
            color: #95a5a6;
            display: inline-block;
        }}
        
        .accuracy-comparison {{
            display: flex;
            justify-content: space-around;
            margin: 30px 0;
        }}
        
        .accuracy-item {{
            text-align: center;
            padding: 20px;
            background: #ecf0f1;
            border-radius: 10px;
            flex: 1;
            margin: 0 10px;
        }}
        
        .accuracy-label {{
            font-size: 16px;
            color: #7f8c8d;
            margin-bottom: 10px;
        }}
        
        .accuracy-value {{
            font-size: 36px;
            font-weight: bold;
            color: #27ae60;
        }}
        
        .capability-dimensions {{
            margin: 30px 0;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 10px;
        }}
        
        .dimension-item {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 10px 0;
            padding: 10px;
            background: white;
            border-radius: 5px;
        }}
        
        .dimension-name {{
            font-weight: bold;
            color: #2c3e50;
        }}
        
        .dimension-bar {{
            flex: 1;
            height: 20px;
            background: #ecf0f1;
            border-radius: 10px;
            margin: 0 15px;
            overflow: hidden;
        }}
        
        .dimension-fill {{
            height: 100%;
            background: linear-gradient(90deg, #3498db, #2ecc71);
            transition: width 0.3s ease;
        }}
        
        .dimension-score {{
            font-weight: bold;
            color: #3498db;
            min-width: 50px;
            text-align: right;
        }}
        
        .issue-list {{
            margin: 20px 0;
        }}
        
        .issue-item {{
            padding: 15px;
            margin: 10px 0;
            background: #fff;
            border-left: 4px solid #e74c3c;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }}
        
        .issue-item.surface {{
            border-left-color: #f39c12;
        }}
        
        .issue-item.deep {{
            border-left-color: #e74c3c;
        }}
        
        .issue-title {{
            font-weight: bold;
            font-size: 18px;
            color: #2c3e50;
            margin-bottom: 8px;
        }}
        
        .issue-evidence {{
            color: #7f8c8d;
            font-size: 14px;
            margin: 5px 0;
        }}
        
        .issue-consequence {{
            color: #e74c3c;
            font-size: 14px;
            margin: 5px 0;
        }}
        
        .issue-solution {{
            color: #27ae60;
            font-size: 14px;
            margin: 5px 0;
        }}
        
        .target-gap {{
            margin: 30px 0;
            padding: 20px;
            background: #fff3cd;
            border-radius: 10px;
            border: 2px solid #ffc107;
        }}
        
        .gap-item {{
            margin: 10px 0;
            font-size: 16px;
        }}
        
        .gap-label {{
            font-weight: bold;
            color: #856404;
        }}
        
        .gap-value {{
            color: #e74c3c;
            font-weight: bold;
        }}
        
        .ai-human-split {{
            display: flex;
            justify-content: space-between;
            margin: 30px 0;
        }}
        
        .split-section {{
            flex: 1;
            padding: 20px;
            margin: 0 10px;
            border-radius: 10px;
        }}
        
        .ai-section {{
            background: #e3f2fd;
            border: 2px solid #2196f3;
        }}
        
        .human-section {{
            background: #fff3e0;
            border: 2px solid #ff9800;
        }}
        
        .split-section h3 {{
            color: #2c3e50;
            margin-bottom: 15px;
        }}
        
        .split-section ul {{
            list-style-position: inside;
            margin: 10px 0;
        }}
        
        .split-section li {{
            margin: 8px 0;
            color: #34495e;
        }}
        
        .note {{
            font-style: italic;
            color: #7f8c8d;
            margin-top: 15px;
            padding: 10px;
            background: rgba(255,255,255,0.5);
            border-radius: 5px;
        }}
        
        @media print {{
            body {{
                background: white;
            }}
            .page {{
                margin: 0;
                box-shadow: none;
            }}
        }}
    </style>
</head>
<body>
    <!-- Page 1: 学业综合能力画像 -->
    <div class="page page-1">
        <h1>学业综合能力画像</h1>
        
        <div class="score-display">
            <span class="score-value">{student_score}</span>
            <span class="score-total">/ {total_score}</span>
        </div>
        
        <div class="accuracy-comparison">
            <div class="accuracy-item">
                <div class="accuracy-label">客观题正确率</div>
                <div class="accuracy-value">{overall_stats.objective_accuracy:.0%}</div>
            </div>
            <div class="accuracy-item">
                <div class="accuracy-label">主观题正确率</div>
                <div class="accuracy-value">{overall_stats.subjective_accuracy:.0%}</div>
            </div>
        </div>
        
        <h2>五维能力评估</h2>
        <div class="capability-dimensions">
            <div class="dimension-item">
                <span class="dimension-name">理解能力</span>
                <div class="dimension-bar">
                    <div class="dimension-fill" style="width: {capability_dims.comprehension * 100}%"></div>
                </div>
                <span class="dimension-score">{capability_dims.comprehension:.2f}</span>
            </div>
            <div class="dimension-item">
                <span class="dimension-name">应用能力</span>
                <div class="dimension-bar">
                    <div class="dimension-fill" style="width: {capability_dims.application * 100}%"></div>
                </div>
                <span class="dimension-score">{capability_dims.application:.2f}</span>
            </div>
            <div class="dimension-item">
                <span class="dimension-name">分析能力</span>
                <div class="dimension-bar">
                    <div class="dimension-fill" style="width: {capability_dims.analysis * 100}%"></div>
                </div>
                <span class="dimension-score">{capability_dims.analysis:.2f}</span>
            </div>
            <div class="dimension-item">
                <span class="dimension-name">综合能力</span>
                <div class="dimension-bar">
                    <div class="dimension-fill" style="width: {capability_dims.synthesis * 100}%"></div>
                </div>
                <span class="dimension-score">{capability_dims.synthesis:.2f}</span>
            </div>
            <div class="dimension-item">
                <span class="dimension-name">评价能力</span>
                <div class="dimension-bar">
                    <div class="dimension-fill" style="width: {capability_dims.evaluation * 100}%"></div>
                </div>
                <span class="dimension-score">{capability_dims.evaluation:.2f}</span>
            </div>
        </div>
        
        {self._render_target_gap(target_gap) if target_gap else ""}
    </div>
    
    <!-- Page 2: 知识漏洞 × 学习习惯双维诊断 -->
    <div class="page page-2">
        <h1>知识漏洞 × 学习习惯双维诊断</h1>
        
        <h2>表层问题（30%）</h2>
        <div class="issue-list">
            {self._render_issues(surface_issues, "surface")}
        </div>
        
        <h2>深层问题（70%）</h2>
        <div class="issue-list">
            {self._render_issues(deep_issues, "deep")}
        </div>
    </div>
    
    <!-- Page 3: AI 托管 vs 真人名师分流策略 -->
    <div class="page page-3">
        <h1>AI 托管 vs 真人名师分流策略</h1>
        
        <div class="ai-human-split">
            <div class="split-section ai-section">
                <h3>AI 负责（30%）</h3>
                <ul>
                    <li>词汇记忆与测试</li>
                    <li>语法规则练习</li>
                    <li>错题自动整理</li>
                    <li>学习进度跟踪</li>
                </ul>
                <p class="note">AI 擅长高频重复、即时反馈的机械性任务</p>
            </div>
            
            <div class="split-section human-section">
                <h3>真人名师负责（70%）</h3>
                <ul>
                    <li>深层问题系统讲解</li>
                    <li>学习策略指导</li>
                    <li>思维方法培养</li>
                    <li>个性化辅导</li>
                </ul>
                <p class="note">真人名师负责需要深度理解、个性化指导的核心能力培养</p>
            </div>
        </div>
        
        <h2>为什么真人介入是必要条件？</h2>
        <div style="padding: 20px; background: #f8f9fa; border-radius: 10px; margin-top: 20px;">
            <p style="margin: 10px 0;">AI 可以识别问题，但无法替代：</p>
            <ul style="margin-left: 20px;">
                <li>对学生心理状态的敏锐洞察</li>
                <li>根据学生反应实时调整教学策略</li>
                <li>建立信任关系，激发学习动力</li>
            </ul>
        </div>
    </div>
    
    <!-- Page 4: 行动方案 -->
    <div class="page page-4">
        <h1>10 课时靶向突击行动方案</h1>
        
        <div style="padding: 20px; background: #e8f5e9; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #2e7d32;">第 1-3 课时：基础巩固</h3>
            <p style="margin: 10px 0;">目标：夯实基础知识体系</p>
            <p style="margin: 10px 0; color: #e74c3c; font-weight: bold;">预期提分：5-8 分</p>
        </div>
        
        <div style="padding: 20px; background: #fff3e0; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #e65100;">第 4-6 课时：能力突破</h3>
            <p style="margin: 10px 0;">目标：提升核心能力</p>
            <p style="margin: 10px 0; color: #e74c3c; font-weight: bold;">预期提分：6-10 分</p>
        </div>
        
        <div style="padding: 20px; background: #e3f2fd; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #1565c0;">第 7-9 课时：综合应用</h3>
            <p style="margin: 10px 0;">目标：提升整体答题能力</p>
            <p style="margin: 10px 0; color: #e74c3c; font-weight: bold;">预期提分：4-7 分</p>
        </div>
        
        <div style="padding: 20px; background: #f3e5f5; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #6a1b9a;">第 10 课时：总结与巩固</h3>
            <p style="margin: 10px 0;">目标：形成稳定的答题习惯</p>
            <p style="margin: 10px 0; color: #27ae60; font-weight: bold;">总计预期提分：15-25 分</p>
        </div>
        
        <div style="text-align: center; margin-top: 40px; padding: 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 15px; color: white;">
            <h2 style="color: white; margin-bottom: 20px;">立即行动</h2>
            <p style="font-size: 18px; margin: 10px 0;">现在预约诊断课，获得：</p>
            <ul style="list-style: none; font-size: 16px; margin: 20px 0;">
                <li style="margin: 10px 0;">✓ 1 对 1 真人名师诊断（价值 ¥299）</li>
                <li style="margin: 10px 0;">✓ 个性化学习方案定制</li>
                <li style="margin: 10px 0;">✓ AI 学习助手 30 天免费使用</li>
            </ul>
            <div style="margin-top: 30px; padding: 15px 40px; background: white; color: #667eea; border-radius: 30px; display: inline-block; font-size: 20px; font-weight: bold; cursor: pointer;">
                预约诊断课
            </div>
        </div>
    </div>
</body>
</html>"""
        
        return html
    
    def _render_target_gap(self, target_gap) -> str:
        """渲染目标学校差距"""
        return f"""
        <div class="target-gap">
            <h2>目标学校差距预测</h2>
            <div class="gap-item">
                <span class="gap-label">目标学校：</span>
                <span>{target_gap.target_school}</span>
            </div>
            <div class="gap-item">
                <span class="gap-label">分数差距：</span>
                <span class="gap-value">{target_gap.score_gap} 分</span>
            </div>
            <div class="gap-item">
                <span class="gap-label">录取概率：</span>
                <span class="gap-value">{target_gap.admission_probability:.0%}</span>
            </div>
            <div class="gap-item">
                <span class="gap-label">关键提升领域：</span>
                <span>{', '.join(target_gap.key_improvement_areas)}</span>
            </div>
        </div>
        """
    
    def _render_issues(self, issues, issue_type: str) -> str:
        """渲染问题列表"""
        if not issues:
            return '<p style="color: #95a5a6; font-style: italic;">暂无问题</p>'
        
        html_parts = []
        for issue in issues:
            evidence_html = "<br>".join([f"• {e}" for e in issue.evidence])
            
            html_parts.append(f"""
            <div class="issue-item {issue_type}">
                <div class="issue-title">{issue.issue}</div>
                <div class="issue-evidence">
                    <strong>证据：</strong><br>{evidence_html}
                </div>
                {f'<div class="issue-consequence"><strong>后果：</strong>{issue.consequence}</div>' if issue.consequence else ''}
                {f'<div class="issue-solution"><strong>根因：</strong>{issue.root_cause}</div>' if hasattr(issue, 'root_cause') and issue.root_cause else ''}
                <div style="margin-top: 8px; color: {'#27ae60' if issue.ai_addressable else '#e74c3c'};">
                    {'✓ AI 可辅助解决' if issue.ai_addressable else '✗ 需要真人指导'}
                </div>
            </div>
            """)
        
        return "\n".join(html_parts)
    
    def generate_pdf(self, html_content: str) -> bytes:
        """
        生成 PDF（简化实现）
        
        Args:
            html_content: HTML 内容
            
        Returns:
            bytes: PDF 内容
        """
        # 简化实现：返回 HTML 内容的字节
        # 实际应该使用 WeasyPrint 或 Playwright 进行转换
        logger.warning("PDF 生成功能未完全实现，返回 HTML 内容")
        return html_content.encode('utf-8')
    
    def upload_to_oss(self, file_content: bytes, filename: str) -> str:
        """
        上传到 OSS（简化实现）
        
        Args:
            file_content: 文件内容
            filename: 文件名
            
        Returns:
            str: 文件 URL
        """
        # 简化实现：返回模拟 URL
        # 实际应该使用阿里云 OSS SDK
        mock_url = f"https://oss.example.com/reports/{filename}"
        logger.warning(f"OSS 上传功能未完全实现，返回模拟 URL: {mock_url}")
        return mock_url


# 创建全局报告服务实例
report_service = ReportService()
