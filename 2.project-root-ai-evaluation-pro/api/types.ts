/**
 * API 类型定义
 */

// OCR 相关类型
export interface OCRRequest {
  imageBase64: string;
  templateId?: string;
}

export interface OCRResponse {
  success: boolean;
  data?: {
    answers: Answer[];
    confidence: number;
    rawText?: string; // 原始识别文本（调试用）
    regions?: TextRegion[]; // 文本区域（调试用）
  };
  error?: string;
}

export interface TextRegion {
  text: string;
  boundingBox: BoundingBox;
  confidence: number;
}

export interface Answer {
  questionId: string;
  userAnswer: string;
  confidence: number;
  position: BoundingBox;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

// AI 分析相关类型
export interface AnalyzeRequest {
  gradeResult: GradeResult;
  language?: 'zh' | 'en';
}

export interface AnalyzeResponse {
  success: boolean;
  data?: ErrorAnalysis;
  error?: string;
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

export interface ErrorAnalysis {
  surfaceIssues: string[];
  rootCauses: string[];
  aiComment: string;
  knowledgeGaps: KnowledgeGap[];
}

export interface KnowledgeGap {
  knowledgePoint: string;
  difficulty: number;
  mastered: boolean;
  detail: string;
}

// 学习路径相关类型
export interface GeneratePathRequest {
  errorAnalysis: ErrorAnalysis;
  language?: 'zh' | 'en';
}

export interface GeneratePathResponse {
  success: boolean;
  data?: LearningPath;
  error?: string;
}

export interface LearningPath {
  stages: LearningStage[];
}

export interface LearningStage {
  id: string;
  title: string;
  content: string[];
  videoLinks: string[];
  duration: string;
}

// 错误类型
export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  OCR_FAILED = 'OCR_FAILED',
  IMAGE_QUALITY_LOW = 'IMAGE_QUALITY_LOW',
  IMAGE_TOO_LARGE = 'IMAGE_TOO_LARGE',
  AI_ANALYSIS_FAILED = 'AI_ANALYSIS_FAILED',
  AI_TIMEOUT = 'AI_TIMEOUT',
  INVALID_TEMPLATE = 'INVALID_TEMPLATE',
  NO_ANSWERS_FOUND = 'NO_ANSWERS_FOUND',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  API_QUOTA_EXCEEDED = 'API_QUOTA_EXCEEDED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

export interface UserFriendlyError {
  type: ErrorType;
  message: string;
  retryable: boolean;
  retryAfter?: number;
}
