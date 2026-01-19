/**
 * 标准答案管理器
 * 
 * 管理标准答案的存储、加载和验证
 */

import type { StandardAnswer } from './AnswerGrader';

/**
 * 标准答案集
 */
export interface StandardAnswerSet {
  id: string;
  name: string;
  description?: string;
  subject: string;
  answers: StandardAnswer[];
  createdAt: string;
}

/**
 * 标准答案管理器类
 */
export class StandardAnswerManager {
  private static answerSets: Map<string, StandardAnswerSet> = new Map();
  
  /**
   * 添加标准答案集
   * 
   * @param answerSet - 标准答案集
   */
  static addAnswerSet(answerSet: StandardAnswerSet): void {
    this.answerSets.set(answerSet.id, answerSet);
  }
  
  /**
   * 获取标准答案集
   * 
   * @param id - 答案集 ID
   * @returns 标准答案集或 null
   */
  static getAnswerSet(id: string): StandardAnswerSet | null {
    return this.answerSets.get(id) || null;
  }
  
  /**
   * 获取所有标准答案集
   * 
   * @returns 标准答案集数组
   */
  static getAllAnswerSets(): StandardAnswerSet[] {
    return Array.from(this.answerSets.values());
  }
  
  /**
   * 删除标准答案集
   * 
   * @param id - 答案集 ID
   * @returns 是否删除成功
   */
  static deleteAnswerSet(id: string): boolean {
    return this.answerSets.delete(id);
  }
  
  /**
   * 从 JSON 导入标准答案
   * 
   * @param json - JSON 字符串
   * @returns 标准答案集
   */
  static importFromJSON(json: string): StandardAnswerSet {
    try {
      const data = JSON.parse(json);
      
      // 验证数据结构
      if (!data.id || !data.name || !data.answers || !Array.isArray(data.answers)) {
        throw new Error('Invalid answer set format');
      }
      
      // 验证每个答案
      for (const answer of data.answers) {
        if (!answer.questionId || !answer.correctAnswer || typeof answer.points !== 'number') {
          throw new Error(`Invalid answer format for question ${answer.questionId}`);
        }
      }
      
      const answerSet: StandardAnswerSet = {
        id: data.id,
        name: data.name,
        description: data.description,
        subject: data.subject || '未知',
        answers: data.answers,
        createdAt: data.createdAt || new Date().toISOString(),
      };
      
      // 添加到管理器
      this.addAnswerSet(answerSet);
      
      return answerSet;
    } catch (error: any) {
      throw new Error(`Failed to import answer set: ${error.message}`);
    }
  }
  
  /**
   * 导出标准答案为 JSON
   * 
   * @param id - 答案集 ID
   * @returns JSON 字符串
   */
  static exportToJSON(id: string): string {
    const answerSet = this.getAnswerSet(id);
    
    if (!answerSet) {
      throw new Error(`Answer set not found: ${id}`);
    }
    
    return JSON.stringify(answerSet, null, 2);
  }
  
  /**
   * 创建示例答案集（用于测试）
   * 
   * @param questionCount - 题目数量
   * @returns 标准答案集
   */
  static createSampleAnswerSet(questionCount: number = 50): StandardAnswerSet {
    const answers: StandardAnswer[] = [];
    const options = ['A', 'B', 'C', 'D'];
    const knowledgePointsPool = [
      ['语法', '时态'],
      ['阅读', '理解'],
      ['听力', '对话'],
      ['完形', '填空'],
      ['逻辑', '推理'],
    ];
    
    for (let i = 1; i <= questionCount; i++) {
      answers.push({
        questionId: String(i),
        correctAnswer: options[Math.floor(Math.random() * options.length)],
        points: 2,
        knowledgePoints: knowledgePointsPool[Math.floor(Math.random() * knowledgePointsPool.length)],
      });
    }
    
    const answerSet: StandardAnswerSet = {
      id: `sample-${questionCount}`,
      name: `示例答案集 (${questionCount}题)`,
      description: `包含 ${questionCount} 道选择题的示例答案集`,
      subject: '英语',
      answers,
      createdAt: new Date().toISOString(),
    };
    
    this.addAnswerSet(answerSet);
    
    return answerSet;
  }
  
  /**
   * 验证标准答案集
   * 
   * @param answerSet - 标准答案集
   * @returns 验证结果
   */
  static validateAnswerSet(answerSet: StandardAnswerSet): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    // 检查必需字段
    if (!answerSet.id) {
      errors.push('Missing answer set ID');
    }
    
    if (!answerSet.name) {
      errors.push('Missing answer set name');
    }
    
    if (!answerSet.answers || !Array.isArray(answerSet.answers)) {
      errors.push('Missing or invalid answers array');
      return { isValid: false, errors };
    }
    
    // 检查答案
    const questionIds = new Set<string>();
    
    for (let i = 0; i < answerSet.answers.length; i++) {
      const answer = answerSet.answers[i];
      
      if (!answer.questionId) {
        errors.push(`Answer ${i + 1}: Missing question ID`);
      } else if (questionIds.has(answer.questionId)) {
        errors.push(`Answer ${i + 1}: Duplicate question ID ${answer.questionId}`);
      } else {
        questionIds.add(answer.questionId);
      }
      
      if (!answer.correctAnswer) {
        errors.push(`Answer ${i + 1}: Missing correct answer`);
      }
      
      if (typeof answer.points !== 'number' || answer.points <= 0) {
        errors.push(`Answer ${i + 1}: Invalid points value`);
      }
      
      if (!answer.knowledgePoints || !Array.isArray(answer.knowledgePoints)) {
        errors.push(`Answer ${i + 1}: Missing or invalid knowledge points`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
