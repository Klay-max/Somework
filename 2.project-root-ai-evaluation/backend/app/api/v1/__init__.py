"""
API v1 路由
"""
from fastapi import APIRouter
from app.api.v1 import auth, exams, ocr, parser, analysis, reviews, handwriting, diagnostic, reports, history

api_router = APIRouter()

# 注册认证路由
api_router.include_router(auth.router, prefix="/auth", tags=["认证"])

# 注册试卷路由
api_router.include_router(exams.router, prefix="/exams", tags=["试卷"])

# 注册历史记录路由（注意：history 路由也使用 /exams 前缀，但在 history.py 中已定义）
api_router.include_router(history.router, tags=["历史记录"])

# 注册 OCR 路由
api_router.include_router(ocr.router, prefix="/ocr", tags=["OCR"])

# 注册解析路由
api_router.include_router(parser.router, prefix="/parser", tags=["解析"])

# 注册分析路由
api_router.include_router(analysis.router, prefix="/analysis", tags=["分析"])

# 注册审核路由
api_router.include_router(reviews.router, prefix="/reviews", tags=["审核"])

# 注册书写分析路由
api_router.include_router(handwriting.router, prefix="/handwriting", tags=["书写分析"])

# 注册诊断路由
api_router.include_router(diagnostic.router, prefix="/diagnostic", tags=["诊断"])

# 注册报告路由
api_router.include_router(reports.router, prefix="/reports", tags=["报告"])
