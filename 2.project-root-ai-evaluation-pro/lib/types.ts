/**
 * 安辅导 数据类型定义
 * 
 * 本文件定义了应用中使用的所有数据模型接口
 */

/**
 * 得分数据
 * 包含本次得分、正确率和对比数据
 */
export interface ScoreData {
  score: number;        // 本次得分 (0-100)
  accuracy: number;     // 正确率百分比 (0-100)
  national: number;     // 全国平均分 (0-100)
  province: number;     // 本省平均分 (0-100)
  city: number;         // 本市平均分 (0-100)
}

/**
 * 能力维度数据
 * 五维能力评估：听力、语法、阅读、完形、逻辑
 */
export interface AbilityData {
  listening: number;    // 听力能力 (0-100)
  grammar: number;      // 语法能力 (0-100)
  reading: number;      // 阅读能力 (0-100)
  cloze: number;        // 完形填空能力 (0-100)
  logic: number;        // 逻辑推理能力 (0-100)
}

/**
 * 错误分析数据
 * 包含表层病灶、深层病根和 AI 点评
 */
export interface AnalysisData {
  surfaceIssues: string[];    // 表层病灶列表（如："涂改痕迹"、"计算粗心"）
  rootCauses: string[];       // 深层病根列表（如："长难句逻辑缺失"）
  aiComment: string;          // AI 点评文本
}

/**
 * 知识点数据
 * 包含知识点名称、难度、掌握状态和详细解释
 */
export interface KnowledgePoint {
  id: string;                       // 知识点唯一标识
  name: string;                     // 知识点名称
  difficulty: 1 | 2 | 3 | 4 | 5;   // 难度星级 (1-5)
  mastered: boolean;                // 是否已掌握
  detail: string;                   // 详细解释
}

/**
 * 学习路径阶段
 * 包含阶段标题、学习内容、视频链接和预计完成时间
 */
export interface PathStage {
  id: string;           // 阶段唯一标识
  title: string;        // 阶段标题（如："基础修复"）
  content: string[];    // 学习内容列表
  videoLinks: string[]; // 视频课程链接列表
  duration: string;     // 预计完成时间（如："2 周"）
}

/**
 * 完整报告数据
 * 包含所有报告相关的数据
 */
export interface ReportData {
  id: string;               // 报告唯一标识
  timestamp: string;        // 报告生成时间 (ISO 8601 格式)
  score: ScoreData;         // 得分数据
  ability: AbilityData;     // 能力维度数据
  analysis: AnalysisData;   // 错误分析数据
  knowledge: KnowledgePoint[]; // 知识点列表
  path: PathStage[];        // 学习路径阶段列表
}

// ============================================
// AI 集成相关类型定义
// ============================================

/**
 * 答案数据
 * 学生答案和标准答案
 */
export interface Answer {
  questionNumber: number;   // 题号
  studentAnswer: string;    // 学生答案
  correctAnswer: string;    // 标准答案
  isCorrect: boolean;       // 是否正确
  dimension?: string;       // 所属维度（听力、语法、阅读等）
}

/**
 * 评分结果
 * 包含总分、答案详情和错题统计
 */
export interface GradingResult {
  totalScore: number;           // 总分
  maxScore: number;             // 满分
  correctCount: number;         // 正确题数
  wrongCount: number;           // 错误题数
  answers: Answer[];            // 答案详情列表
  wrongAnswers: Answer[];       // 错题列表
  dimensionScores: Array<{      // 各维度得分
    dimension: string;
    score: number;
    maxScore: number;
  }>;
}

/**
 * AI 错误分析结果
 * 由 DeepSeek API 返回
 */
export interface AnalysisResult {
  surfaceIssues: string[];      // 表层病灶
  rootCauses: string[];         // 深层病根
  aiComment: string;            // AI 点评
  knowledgeGaps: string[];      // 知识盲区
}

/**
 * 学习路径
 * 由 DeepSeek API 生成
 */
export interface LearningPath {
  stages: PathStage[];          // 学习阶段列表
  estimatedDuration: string;    // 预计总时长
  targetScore: number;          // 目标分数
}
