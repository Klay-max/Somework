/**
 * 安辅导 模拟数据生成
 * 
 * 本文件提供模拟数据生成函数，用于开发和测试
 */

import type { ReportData, ScoreData, AbilityData, AnalysisData, KnowledgePoint, PathStage } from './types';

/**
 * 生成模拟的得分数据
 */
function generateMockScoreData(): ScoreData {
  return {
    score: 92,
    accuracy: 79,
    national: 75,
    province: 78,
    city: 80,
  };
}

/**
 * 生成模拟的能力维度数据
 */
function generateMockAbilityData(): AbilityData {
  return {
    listening: 85,
    grammar: 90,
    reading: 88,
    cloze: 75,
    logic: 82,
  };
}

/**
 * 生成模拟的错误分析数据
 */
function generateMockAnalysisData(): AnalysisData {
  return {
    surfaceIssues: ['涂改痕迹', '计算粗心', '审题不清'],
    rootCauses: ['长难句逻辑缺失', '缺乏验算机制'],
    aiComment: '本次测评显示你在基础知识掌握方面表现优秀，但在复杂问题的逻辑推理上仍有提升空间。建议加强长难句分析训练，并养成验算习惯。',
  };
}

/**
 * 生成模拟的知识点列表
 */
function generateMockKnowledgePoints(): KnowledgePoint[] {
  return [
    {
      id: '1',
      name: '一般现在时',
      difficulty: 2,
      mastered: true,
      detail: '用于描述经常发生的动作或状态。构成：主语 + 动词原形/第三人称单数形式。',
    },
    {
      id: '2',
      name: '虚拟语气',
      difficulty: 4,
      mastered: false,
      detail: '用于表达假设、愿望或与事实相反的情况。常见结构：If + 过去式, would + 动词原形。',
    },
    {
      id: '3',
      name: '定语从句',
      difficulty: 3,
      mastered: true,
      detail: '用于修饰名词的从句。关系代词：who, whom, whose, which, that。',
    },
    {
      id: '4',
      name: '被动语态',
      difficulty: 3,
      mastered: false,
      detail: '表示主语是动作的承受者。构成：be + 过去分词。',
    },
    {
      id: '5',
      name: '非谓语动词',
      difficulty: 5,
      mastered: false,
      detail: '包括不定式、动名词和分词。在句中作主语、宾语、定语、状语等成分。',
    },
    {
      id: '6',
      name: '时态一致',
      difficulty: 2,
      mastered: true,
      detail: '主句和从句的时态要保持一致或符合逻辑关系。',
    },
    {
      id: '7',
      name: '倒装句',
      difficulty: 4,
      mastered: false,
      detail: '将谓语或助动词提到主语之前。常见于否定词开头、only 强调等情况。',
    },
    {
      id: '8',
      name: '主谓一致',
      difficulty: 2,
      mastered: true,
      detail: '主语和谓语在人称和数上保持一致。注意集合名词、不定代词等特殊情况。',
    },
  ];
}

/**
 * 生成模拟的学习路径
 */
function generateMockLearningPath(): PathStage[] {
  return [
    {
      id: '1',
      title: '基础修复',
      content: [
        '复习虚拟语气基础语法规则',
        '完成 20 道虚拟语气练习题',
        '学习被动语态的构成和用法',
        '完成 15 道被动语态练习题',
      ],
      videoLinks: [
        'https://example.com/video/grammar-basics',
        'https://example.com/video/passive-voice',
      ],
      duration: '2 周',
    },
    {
      id: '2',
      title: '强化训练',
      content: [
        '长难句分析训练（每天 5 句）',
        '完成 5 套模拟测试',
        '错题整理和分析',
        '非谓语动词专项训练',
      ],
      videoLinks: [
        'https://example.com/video/sentence-analysis',
        'https://example.com/video/non-finite-verbs',
      ],
      duration: '3 周',
    },
    {
      id: '3',
      title: '冲刺提升',
      content: [
        '倒装句和强调句专项突破',
        '完成 10 套真题模拟',
        '时间管理和答题技巧训练',
        '查漏补缺，巩固薄弱环节',
      ],
      videoLinks: [
        'https://example.com/video/advanced-grammar',
        'https://example.com/video/exam-strategies',
      ],
      duration: '2 周',
    },
  ];
}

/**
 * 生成完整的模拟报告数据
 * 
 * @param id - 报告 ID
 * @returns 完整的报告数据对象
 */
export function generateMockReport(id: string): ReportData {
  return {
    id,
    timestamp: new Date().toISOString(),
    score: generateMockScoreData(),
    ability: generateMockAbilityData(),
    analysis: generateMockAnalysisData(),
    knowledge: generateMockKnowledgePoints(),
    path: generateMockLearningPath(),
  };
}

/**
 * 生成多个模拟报告（用于列表展示）
 * 
 * @param count - 要生成的报告数量
 * @returns 报告数据数组
 */
export function generateMockReports(count: number): ReportData[] {
  return Array.from({ length: count }, (_, index) => 
    generateMockReport(`report-${index + 1}`)
  );
}
