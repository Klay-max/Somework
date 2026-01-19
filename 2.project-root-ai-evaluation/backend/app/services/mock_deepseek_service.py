"""Mock DeepSeek Service for local development"""
import random
from typing import Dict, Any, List


class MockDeepSeekService:
    """Mock DeepSeek service that returns simulated AI responses"""
    
    async def _call_api(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 1000
    ) -> Dict[str, Any]:
        """Return mock AI analysis results based on prompt content"""
        
        # 获取用户消息
        user_message = ""
        for msg in messages:
            if msg.get("role") == "user":
                user_message = msg.get("content", "")
                break
        
        # 根据 prompt 类型返回不同的模拟结果
        if "知识点" in user_message or "knowledge" in user_message.lower():
            content = self._mock_knowledge_points()
        elif "难度" in user_message or "difficulty" in user_message.lower():
            content = self._mock_difficulty()
        elif "评估" in user_message or "evaluate" in user_message.lower():
            content = self._mock_evaluation()
        elif "诊断" in user_message or "diagnostic" in user_message.lower():
            content = self._mock_diagnostic()
        else:
            content = self._mock_generic_response()
        
        return {
            "choices": [
                {
                    "message": {
                        "content": content
                    }
                }
            ]
        }
    
    def _mock_knowledge_points(self) -> str:
        """模拟知识点标注"""
        knowledge_points = [
            "函数单调性", "集合运算", "二次函数", "对数运算", 
            "方程求解", "三角函数", "不等式", "数列"
        ]
        selected = random.sample(knowledge_points, k=random.randint(2, 4))
        
        import json
        return json.dumps({
            "knowledge_points": selected
        }, ensure_ascii=False)
    
    def _mock_difficulty(self) -> str:
        """模拟难度估算"""
        difficulty = random.uniform(0.3, 0.8)
        reasons = [
            "题目涉及基础概念，难度适中",
            "需要综合运用多个知识点",
            "计算量较大，容易出错",
            "概念理解要求较高"
        ]
        
        import json
        return json.dumps({
            "difficulty": round(difficulty, 2),
            "reason": random.choice(reasons)
        }, ensure_ascii=False)
    
    def _mock_evaluation(self) -> str:
        """模拟主观题评分"""
        score_ratio = random.uniform(0.5, 0.95)
        is_correct = score_ratio >= 0.6
        
        strengths = [
            "解题思路清晰",
            "步骤完整",
            "计算准确",
            "表达规范"
        ]
        weaknesses = [
            "部分步骤跳跃",
            "计算有小错误",
            "表达不够严谨",
            "缺少必要说明"
        ]
        
        import json
        return json.dumps({
            "score_ratio": round(score_ratio, 2),
            "is_correct": is_correct,
            "reason": "基于答案完整性和准确性的综合评估",
            "strengths": random.sample(strengths, k=random.randint(1, 2)),
            "weaknesses": random.sample(weaknesses, k=random.randint(1, 2))
        }, ensure_ascii=False)
    
    def _mock_diagnostic(self) -> str:
        """模拟诊断分析"""
        import json
        return json.dumps({
            "capability_dimensions": {
                "comprehension": round(random.uniform(0.6, 0.9), 2),
                "application": round(random.uniform(0.5, 0.85), 2),
                "analysis": round(random.uniform(0.55, 0.88), 2),
                "synthesis": round(random.uniform(0.5, 0.82), 2),
                "evaluation": round(random.uniform(0.6, 0.87), 2)
            },
            "surface_issues": [
                {
                    "issue": "计算粗心",
                    "severity": "medium",
                    "evidence": ["第3题计算错误", "第7题符号错误"],
                    "ai_addressable": True,
                    "consequence": "影响客观题得分"
                },
                {
                    "issue": "审题不够仔细",
                    "severity": "medium",
                    "evidence": ["第5题理解偏差"],
                    "ai_addressable": True,
                    "consequence": "容易遗漏关键条件"
                }
            ],
            "deep_issues": [
                {
                    "issue": "函数概念理解不深",
                    "severity": "high",
                    "evidence": ["多道函数题失分", "单调性判断错误"],
                    "ai_addressable": True,
                    "root_cause": "对函数性质的本质理解不够",
                    "consequence": "影响后续高阶知识学习"
                },
                {
                    "issue": "逻辑推理能力欠缺",
                    "severity": "high",
                    "evidence": ["证明题思路不清", "推理过程跳跃"],
                    "ai_addressable": True,
                    "root_cause": "缺乏系统的逻辑训练",
                    "consequence": "难题得分率低"
                }
            ],
            "target_school_gap": {
                "target_school": "重点高中",
                "score_gap": round(random.uniform(10, 30), 1),
                "admission_probability": round(random.uniform(0.3, 0.7), 2),
                "key_improvement_areas": ["函数", "几何", "逻辑推理"]
            }
        }, ensure_ascii=False)
    
    def _mock_generic_response(self) -> str:
        """通用模拟响应"""
        import json
        return json.dumps({
            "result": "模拟分析结果",
            "confidence": round(random.uniform(0.80, 0.95), 2),
            "details": "这是一个模拟的 AI 响应"
        }, ensure_ascii=False)
