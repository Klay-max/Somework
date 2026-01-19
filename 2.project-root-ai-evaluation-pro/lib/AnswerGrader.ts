/**
 * 答案评分器
 * 
 * 对比用户答案和标准答案，计算得分
 */

import type { Answer } from './AnswerExtractor';

export interface StandardAnswer {
  questionId: string;
  correctAnswer: string;
  points: number;
  knowledgePoints: string[];
}

export interface WrongAnswer {
  questionId: string;
  userAnswer: string;
  correctAnswer: string;
  knowledgePoints: string[];
}

export interface DimensionScore {
  dimension: string;
  score: number;
  maxScore: number;
}

export interface GradeResult {
  totalScore: number;
  maxScore: number;
  accuracy: number;
  correctCount: number;
  wrongCount: number;
  wrongAnswers: WrongAnswer[];
  dimensionScores: DimensionScore[];
}

/**
 * 答案评分器类
 */
export class AnswerGrader {
  /**
   * 评分
   * 
   * @param userAnswers - 用户答案
   * @param standardAnswers - 标准答案
   * @returns 评分结果
   */
  static grade(
    userAnswers: Answer[],
    standardAnswers: StandardAnswer[]
  ): GradeResult {
    let totalScore = 0;
    let maxScore = 0;
    let correctCount = 0;
    let wrongCount = 0;
    const wrongAnswers: WrongAnswer[] = [];
    
    // 创建标准答案映射
    const standardMap = new Map<string, StandardAnswer>();
    for (const standard of standardAnswers) {
      standardMap.set(standard.questionId, standard);
      maxScore += standard.points;
    }
    
    // 评分
    for (const userAnswer of userAnswers) {
      const standard = standardMap.get(userAnswer.questionId);
      
      if (!standard) {
        // 没有对应的标准答案，跳过
        continue;
      }
      
      // 对比答案（不区分大小写）
      const isCorrect = userAnswer.userAnswer.toUpperCase() === standard.correctAnswer.toUpperCase();
      
      if (isCorrect) {
        totalScore += standard.points;
        correctCount++;
      } else {
        wrongCount++;
        wrongAnswers.push({
          questionId: userAnswer.questionId,
          userAnswer: userAnswer.userAnswer,
          correctAnswer: standard.correctAnswer,
          knowledgePoints: standard.knowledgePoints,
        });
      }
    }
    
    // 计算正确率
    const accuracy = userAnswers.length > 0
      ? (correctCount / userAnswers.length) * 100
      : 0;
    
    // 计算维度得分
    const dimensionScores = this.calculateDimensionScores(
      userAnswers,
      standardAnswers,
      wrongAnswers
    );
    
    return {
      totalScore,
      maxScore,
      accuracy,
      correctCount,
      wrongCount,
      wrongAnswers,
      dimensionScores,
    };
  }
  
  /**
   * 计算维度得分
   * 
   * @param userAnswers - 用户答案
   * @param standardAnswers - 标准答案
   * @param wrongAnswers - 错题
   * @returns 维度得分数组
   */
  private static calculateDimensionScores(
    userAnswers: Answer[],
    standardAnswers: StandardAnswer[],
    wrongAnswers: WrongAnswer[]
  ): DimensionScore[] {
    // 定义维度
    const dimensions = ['听力', '语法', '阅读', '完形', '逻辑'];
    
    // 创建维度映射
    const dimensionMap = new Map<string, { score: number; maxScore: number }>();
    
    for (const dimension of dimensions) {
      dimensionMap.set(dimension, { score: 0, maxScore: 0 });
    }
    
    // 创建标准答案映射
    const standardMap = new Map<string, StandardAnswer>();
    for (const standard of standardAnswers) {
      standardMap.set(standard.questionId, standard);
    }
    
    // 计算每个维度的得分
    for (const userAnswer of userAnswers) {
      const standard = standardMap.get(userAnswer.questionId);
      
      if (!standard) {
        continue;
      }
      
      // 根据知识点确定维度
      const dimension = this.getDimensionFromKnowledgePoints(standard.knowledgePoints);
      
      const dimData = dimensionMap.get(dimension);
      if (dimData) {
        dimData.maxScore += standard.points;
        
        // 检查是否答对
        const isWrong = wrongAnswers.some(w => w.questionId === userAnswer.questionId);
        if (!isWrong) {
          dimData.score += standard.points;
        }
      }
    }
    
    // 转换为数组
    const dimensionScores: DimensionScore[] = [];
    for (const [dimension, data] of dimensionMap.entries()) {
      if (data.maxScore > 0) {
        dimensionScores.push({
          dimension,
          score: data.score,
          maxScore: data.maxScore,
        });
      }
    }
    
    return dimensionScores;
  }
  
  /**
   * 根据知识点确定维度
   * 
   * @param knowledgePoints - 知识点数组
   * @returns 维度名称
   */
  private static getDimensionFromKnowledgePoints(knowledgePoints: string[]): string {
    // 简单的映射规则
    const dimensionKeywords: Record<string, string[]> = {
      '听力': ['听力', '听', 'listening'],
      '语法': ['语法', '时态', '虚拟语气', '从句', 'grammar'],
      '阅读': ['阅读', '理解', '推理', 'reading'],
      '完形': ['完形', '填空', 'cloze'],
      '逻辑': ['逻辑', '推理', '判断', 'logic'],
    };
    
    for (const point of knowledgePoints) {
      const lowerPoint = point.toLowerCase();
      
      for (const [dimension, keywords] of Object.entries(dimensionKeywords)) {
        if (keywords.some(keyword => lowerPoint.includes(keyword.toLowerCase()))) {
          return dimension;
        }
      }
    }
    
    // 默认返回"语法"
    return '语法';
  }
  
  /**
   * 生成评分报告摘要
   * 
   * @param gradeResult - 评分结果
   * @returns 报告摘要
   */
  static generateSummary(gradeResult: GradeResult): string {
    const lines: string[] = [];
    
    lines.push(`总分: ${gradeResult.totalScore}/${gradeResult.maxScore}`);
    lines.push(`正确率: ${gradeResult.accuracy.toFixed(2)}%`);
    lines.push(`正确题数: ${gradeResult.correctCount}`);
    lines.push(`错误题数: ${gradeResult.wrongCount}`);
    lines.push('');
    lines.push('各维度得分:');
    
    for (const dim of gradeResult.dimensionScores) {
      const percentage = dim.maxScore > 0 ? (dim.score / dim.maxScore * 100).toFixed(1) : '0.0';
      lines.push(`  ${dim.dimension}: ${dim.score}/${dim.maxScore} (${percentage}%)`);
    }
    
    if (gradeResult.wrongAnswers.length > 0) {
      lines.push('');
      lines.push('错题列表:');
      
      for (const wrong of gradeResult.wrongAnswers.slice(0, 10)) {
        lines.push(`  题目 ${wrong.questionId}: 你的答案 ${wrong.userAnswer}, 正确答案 ${wrong.correctAnswer}`);
      }
      
      if (gradeResult.wrongAnswers.length > 10) {
        lines.push(`  ... 还有 ${gradeResult.wrongAnswers.length - 10} 道错题`);
      }
    }
    
    return lines.join('\n');
  }
}
