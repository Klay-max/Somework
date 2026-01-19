/**
 * 答题卡模板配置
 * 
 * 定义标准答题卡的结构和题目区域
 */

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface QuestionRegion {
  questionId: string;
  boundingBox: BoundingBox;
  answerType: 'single' | 'multiple' | 'text';
}

export interface AnswerSheetTemplate {
  id: string;
  name: string;
  type: 'standard' | 'custom';
  questionCount: number;
  questionRegions: QuestionRegion[];
  description?: string;
}

/**
 * 标准答题卡模板（50 题选择题）
 */
export const STANDARD_TEMPLATE_50: AnswerSheetTemplate = {
  id: 'standard-50',
  name: '标准答题卡 (50题)',
  type: 'standard',
  questionCount: 50,
  description: '标准 50 题选择题答题卡，每题 4 个选项 (A/B/C/D)',
  questionRegions: Array.from({ length: 50 }, (_, i) => ({
    questionId: String(i + 1),
    boundingBox: {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    },
    answerType: 'single' as const,
  })),
};

/**
 * 标准答题卡模板（100 题选择题）
 */
export const STANDARD_TEMPLATE_100: AnswerSheetTemplate = {
  id: 'standard-100',
  name: '标准答题卡 (100题)',
  type: 'standard',
  questionCount: 100,
  description: '标准 100 题选择题答题卡，每题 4 个选项 (A/B/C/D)',
  questionRegions: Array.from({ length: 100 }, (_, i) => ({
    questionId: String(i + 1),
    boundingBox: {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    },
    answerType: 'single' as const,
  })),
};

/**
 * 获取模板
 */
export function getTemplate(templateId: string): AnswerSheetTemplate | null {
  const templates: Record<string, AnswerSheetTemplate> = {
    'standard-50': STANDARD_TEMPLATE_50,
    'standard-100': STANDARD_TEMPLATE_100,
  };
  
  return templates[templateId] || null;
}

/**
 * 获取所有可用模板
 */
export function getAllTemplates(): AnswerSheetTemplate[] {
  return [
    STANDARD_TEMPLATE_50,
    STANDARD_TEMPLATE_100,
  ];
}

/**
 * 验证模板
 */
export function validateTemplate(template: AnswerSheetTemplate): boolean {
  if (!template.id || !template.name) {
    return false;
  }
  
  if (template.questionCount <= 0) {
    return false;
  }
  
  if (!template.questionRegions || template.questionRegions.length !== template.questionCount) {
    return false;
  }
  
  return true;
}
