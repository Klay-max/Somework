"""
报告数据模型
"""
from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime


class ReportGenerationRequest(BaseModel):
    """报告生成请求"""
    exam_id: str = Field(..., description="试卷ID")


class ReportGenerationResponse(BaseModel):
    """报告生成响应"""
    report_id: str = Field(..., description="报告ID")
    exam_id: str = Field(..., description="试卷ID")
    html_url: Optional[str] = Field(None, description="HTML报告URL")
    pdf_url: Optional[str] = Field(None, description="PDF报告URL")
    status: str = Field(..., description="生成状态")
    generated_at: datetime = Field(..., description="生成时间")


class ReportContent(BaseModel):
    """报告内容"""
    exam_id: str
    html_content: str
    page_count: int = Field(default=4, description="页数")
