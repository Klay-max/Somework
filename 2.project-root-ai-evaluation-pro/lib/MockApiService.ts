/**
 * Mock API 服务
 * 
 * 用于在网络不可用时提供模拟数据
 * 模拟真实 API 的响应时间和数据结构
 */

import { generateMockReport } from './mockData';
import type { ReportData } from './types';

/**
 * Mock 配置
 */
export const MOCK_CONFIG = {
  enabled: true, // 是否启用 Mock 模式 - 由于 OCR 网络问题，暂时启用 Mock
  delay: {
    ocr: 1500,      // OCR 识别延迟（毫秒）
    analysis: 2000,  // 错误分析延迟
    path: 1500,      // 学习路径延迟
  },
  successRate: 0.95, // 成功率（模拟偶尔失败）
};

/**
 * 模拟延迟
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 模拟随机失败
 */
function shouldFail(): boolean {
  return Math.random() > MOCK_CONFIG.successRate;
}

/**
 * Mock OCR 识别结果
 */
export interface MockOCRResult {
  success: boolean;
  text: string;
  confidence: number;
}

/**
 * Mock 错误分析结果
 */
export interface MockAnalysisResult {
  success: boolean;
  surfaceIssues: string[];
  rootCauses: string[];
  aiComment: string;
  knowledgeGaps: string[];
}

/**
 * Mock 学习路径结果
 */
export interface MockPathResult {
  success: boolean;
  stages: Array<{
    title: string;
    content: string[];
    videoLinks: string[];
    duration: string;
  }>;
}

/**
 * Mock API 服务类
 */
export class MockApiService {
  /**
   * Mock OCR 识别
   */
  static async performOCR(imageBase64: string): Promise<MockOCRResult> {
    console.log('[MockAPI] 模拟 OCR 识别...');
    
    await delay(MOCK_CONFIG.delay.ocr);
    
    if (shouldFail()) {
      throw new Error('Mock OCR 识别失败（模拟网络错误）');
    }
    
    // 模拟 OCR 识别结果
    const mockText = `
1. A  2. B  3. C  4. D  5. A
6. B  7. C  8. D  9. A  10. B
11. C  12. D  13. A  14. B  15. C
16. D  17. A  18. B  19. C  20. D
21. A  22. B  23. C  24. D  25. A
26. B  27. C  28. D  29. A  30. B
31. C  32. D  33. A  34. B  35. C
36. D  37. A  38. B  39. C  40. D
41. A  42. B  43. C  44. D  45. A
46. B  47. C  48. D  49. A  50. B
    `.trim();
    
    return {
      success: true,
      text: mockText,
      confidence: 0.95,
    };
  }
  
  /**
   * Mock 错误分析
   */
  static async analyzeErrors(
    wrongAnswers: Array<{ questionNumber: number; studentAnswer: string; correctAnswer: string }>
  ): Promise<MockAnalysisResult> {
    console.log('[MockAPI] 模拟错误分析...');
    
    await delay(MOCK_CONFIG.delay.analysis);
    
    if (shouldFail()) {
      throw new Error('Mock 错误分析失败（模拟网络错误）');
    }
    
    // 根据错题数量生成不同的分析
    const errorCount = wrongAnswers.length;
    
    let surfaceIssues: string[];
    let rootCauses: string[];
    let aiComment: string;
    let knowledgeGaps: string[];
    
    if (errorCount <= 5) {
      surfaceIssues = ['个别题目粗心', '时间分配不均'];
      rootCauses = ['基础扎实，偶有疏忽'];
      aiComment = '整体表现优秀！只有少量错题，主要是粗心导致。建议做题时更加细心，注意审题。';
      knowledgeGaps = ['审题技巧', '时间管理'];
    } else if (errorCount <= 15) {
      surfaceIssues = ['部分知识点掌握不牢', '解题思路不够清晰', '时间管理需要改进'];
      rootCauses = ['基础知识有漏洞', '缺乏系统训练'];
      aiComment = '你的基础还不错，但在某些知识点上需要加强。建议针对错题涉及的知识点进行专项训练，并多做类似题目巩固。';
      knowledgeGaps = ['虚拟语气', '被动语态', '定语从句', '完形填空技巧'];
    } else {
      surfaceIssues = ['多个知识点掌握不足', '解题方法欠缺', '基础概念模糊'];
      rootCauses = ['基础知识薄弱', '缺乏系统学习', '练习量不足'];
      aiComment = '需要系统性地复习基础知识。建议从基础概念开始，逐步建立知识体系，并通过大量练习巩固。不要急于求成，打好基础最重要。';
      knowledgeGaps = ['基础语法', '词汇量', '阅读理解', '长难句分析', '写作技巧', '听力训练'];
    }
    
    return {
      success: true,
      surfaceIssues,
      rootCauses,
      aiComment,
      knowledgeGaps,
    };
  }
  
  /**
   * Mock 学习路径生成
   */
  static async generateLearningPath(
    weakPoints: string[]
  ): Promise<MockPathResult> {
    console.log('[MockAPI] 模拟学习路径生成...');
    
    await delay(MOCK_CONFIG.delay.path);
    
    if (shouldFail()) {
      throw new Error('Mock 学习路径生成失败（模拟网络错误）');
    }
    
    // 根据薄弱点生成学习路径
    const stages = [
      {
        title: '基础修复',
        content: [
          `复习 ${weakPoints[0] || '基础语法'} 的核心概念`,
          '完成 20 道基础练习题',
          `学习 ${weakPoints[1] || '重点知识'} 的应用方法`,
          '完成 15 道专项练习题',
        ],
        videoLinks: [
          'https://example.com/video/basics-1',
          'https://example.com/video/basics-2',
        ],
        duration: '2 周',
      },
      {
        title: '强化训练',
        content: [
          '综合题目训练（每天 10 题）',
          '完成 5 套模拟测试',
          '错题整理和分析',
          '专项突破薄弱环节',
        ],
        videoLinks: [
          'https://example.com/video/practice-1',
          'https://example.com/video/practice-2',
        ],
        duration: '3 周',
      },
      {
        title: '冲刺提升',
        content: [
          '难点专项突破',
          '完成 10 套真题模拟',
          '时间管理和答题技巧训练',
          '查漏补缺，全面复习',
        ],
        videoLinks: [
          'https://example.com/video/advanced-1',
          'https://example.com/video/advanced-2',
        ],
        duration: '2 周',
      },
    ];
    
    return {
      success: true,
      stages,
    };
  }
  
  /**
   * 生成完整的 Mock 报告
   */
  static async generateFullReport(imageBase64: string): Promise<ReportData> {
    console.log('[MockAPI] 生成完整 Mock 报告...');
    
    // 模拟完整流程
    const ocrResult = await this.performOCR(imageBase64);
    
    // 模拟一些错题
    const wrongAnswers = [
      { questionNumber: 5, studentAnswer: 'B', correctAnswer: 'A' },
      { questionNumber: 12, studentAnswer: 'A', correctAnswer: 'D' },
      { questionNumber: 23, studentAnswer: 'B', correctAnswer: 'C' },
      { questionNumber: 34, studentAnswer: 'C', correctAnswer: 'B' },
      { questionNumber: 45, studentAnswer: 'D', correctAnswer: 'A' },
    ];
    
    const analysisResult = await this.analyzeErrors(wrongAnswers);
    const pathResult = await this.generateLearningPath(['虚拟语气', '被动语态']);
    
    // 生成完整报告
    const reportId = `mock-report-${Date.now()}`;
    const report = generateMockReport(reportId);
    
    // 更新分析数据
    report.analysis = {
      surfaceIssues: analysisResult.surfaceIssues,
      rootCauses: analysisResult.rootCauses,
      aiComment: analysisResult.aiComment,
    };
    
    // 更新学习路径
    report.path = pathResult.stages.map((stage, index) => ({
      id: `${index + 1}`,
      ...stage,
    }));
    
    console.log('[MockAPI] Mock 报告生成完成:', reportId);
    
    return report;
  }
}

/**
 * 检查是否启用 Mock 模式
 */
export function isMockEnabled(): boolean {
  // 可以通过环境变量控制
  if (typeof process !== 'undefined' && process.env.USE_MOCK_API === 'true') {
    return true;
  }
  
  return MOCK_CONFIG.enabled;
}

/**
 * 设置 Mock 模式
 */
export function setMockEnabled(enabled: boolean): void {
  MOCK_CONFIG.enabled = enabled;
  console.log(`[MockAPI] Mock 模式已${enabled ? '启用' : '禁用'}`);
}

/**
 * 获取 Mock 配置
 */
export function getMockConfig() {
  return { ...MOCK_CONFIG };
}
