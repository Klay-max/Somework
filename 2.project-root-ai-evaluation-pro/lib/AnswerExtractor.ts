/**
 * 答案提取器
 * 
 * 从 OCR 结果中提取结构化答案
 */

import type { AnswerSheetTemplate } from './AnswerSheetTemplate';

export interface Answer {
  questionId: string;
  userAnswer: string;
  confidence: number;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface OCRResult {
  success: boolean;
  text: string;
  regions: Array<{
    text: string;
    boundingBox: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    confidence: number;
  }>;
  confidence: number;
}

/**
 * 答案提取器类
 */
export class AnswerExtractor {
  /**
   * 提取选择题答案
   * 
   * @param ocrResult - OCR 识别结果
   * @param template - 答题卡模板
   * @returns 答案数组
   */
  static extractMultipleChoice(
    ocrResult: OCRResult,
    template: AnswerSheetTemplate
  ): Answer[] {
    const answers: Answer[] = [];
    
    // 确保 text 存在
    if (!ocrResult || !ocrResult.text) {
      console.warn('[AnswerExtractor] OCR result or text is undefined');
      return answers;
    }
    
    // 使用正则表达式匹配答案模式
    // 支持的模式：
    // 1. A  2. B  3. C  4. D
    // 1.A  2.B  3.C  4.D
    // 1A   2B   3C   4D
    const answerPattern = /(\d+)[.\s]*([A-D])/gi;
    
    const matches = ocrResult.text.matchAll(answerPattern);
    
    for (const match of matches) {
      const questionId = match[1];
      const userAnswer = match[2].toUpperCase();
      
      // 查找对应的文本区域以获取位置和置信度
      const region = ocrResult.regions.find(r => 
        r.text.includes(questionId) && r.text.includes(userAnswer)
      );
      
      answers.push({
        questionId,
        userAnswer,
        confidence: region?.confidence || ocrResult.confidence,
        position: region?.boundingBox || { x: 0, y: 0, width: 0, height: 0 },
      });
    }
    
    // 按题号排序
    answers.sort((a, b) => parseInt(a.questionId) - parseInt(b.questionId));
    
    return answers;
  }
  
  /**
   * 提取填空题答案
   * 
   * @param ocrResult - OCR 识别结果
   * @param template - 答题卡模板
   * @returns 答案数组
   */
  static extractFillInBlank(
    ocrResult: OCRResult,
    template: AnswerSheetTemplate
  ): Answer[] {
    const answers: Answer[] = [];
    
    // 确保 text 存在
    if (!ocrResult || !ocrResult.text) {
      console.warn('[AnswerExtractor] OCR result or text is undefined');
      return answers;
    }
    
    // 使用正则表达式匹配填空题答案模式
    // 支持的模式：
    // 1. ___答案___
    // 1) 答案
    const fillInPattern = /(\d+)[.)]\s*([^\d\n]+)/gi;
    
    const matches = ocrResult.text.matchAll(fillInPattern);
    
    for (const match of matches) {
      const questionId = match[1];
      const userAnswer = match[2].trim();
      
      // 查找对应的文本区域
      const region = ocrResult.regions.find(r => 
        r.text.includes(questionId) && r.text.includes(userAnswer)
      );
      
      answers.push({
        questionId,
        userAnswer,
        confidence: region?.confidence || ocrResult.confidence,
        position: region?.boundingBox || { x: 0, y: 0, width: 0, height: 0 },
      });
    }
    
    // 按题号排序
    answers.sort((a, b) => parseInt(a.questionId) - parseInt(b.questionId));
    
    return answers;
  }
  
  /**
   * 自动提取答案（根据模板类型）
   * 
   * @param ocrResult - OCR 识别结果
   * @param template - 答题卡模板
   * @returns 答案数组
   */
  static extract(
    ocrResult: OCRResult,
    template: AnswerSheetTemplate
  ): Answer[] {
    // 根据模板中第一个题目的类型决定提取方法
    const firstQuestion = template.questionRegions[0];
    
    if (firstQuestion.answerType === 'single' || firstQuestion.answerType === 'multiple') {
      return this.extractMultipleChoice(ocrResult, template);
    } else {
      return this.extractFillInBlank(ocrResult, template);
    }
  }
  
  /**
   * 验证答案完整性
   * 
   * @param answers - 提取的答案
   * @param expectedCount - 期望的答案数量
   * @returns 验证结果
   */
  static validateAnswers(answers: Answer[], expectedCount: number): {
    isComplete: boolean;
    missingQuestions: string[];
    duplicateQuestions: string[];
  } {
    const questionIds = answers.map(a => a.questionId);
    const uniqueIds = new Set(questionIds);
    
    // 检查缺失的题目
    const missingQuestions: string[] = [];
    for (let i = 1; i <= expectedCount; i++) {
      if (!uniqueIds.has(String(i))) {
        missingQuestions.push(String(i));
      }
    }
    
    // 检查重复的题目
    const duplicateQuestions: string[] = [];
    const seen = new Set<string>();
    for (const id of questionIds) {
      if (seen.has(id)) {
        duplicateQuestions.push(id);
      }
      seen.add(id);
    }
    
    return {
      isComplete: missingQuestions.length === 0 && duplicateQuestions.length === 0,
      missingQuestions,
      duplicateQuestions,
    };
  }
}
