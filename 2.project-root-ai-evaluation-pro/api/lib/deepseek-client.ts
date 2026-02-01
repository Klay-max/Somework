/**
 * DeepSeek API 客户端
 * 
 * 功能：
 * - 调用 DeepSeek Chat API
 * - 错误分析
 * - 学习路径生成
 */

import axios from 'axios';
import type { GradeResult, ErrorAnalysis, LearningPath } from '../types';

/**
 * DeepSeek API 响应类型
 */
interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * 调用 DeepSeek Chat API
 * 
 * @param prompt - 用户提示词
 * @param systemPrompt - 系统提示词
 * @param temperature - 温度参数（0-2，默认 0.7）
 * @param maxTokens - 最大 token 数（默认 2000）
 * @returns API 响应内容
 */
export async function callDeepSeekAPI(
  prompt: string,
  systemPrompt: string = '你是一位专业的教育分析师',
  temperature: number = 0.7,
  maxTokens: number = 2000
): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const endpoint = process.env.DEEPSEEK_API_ENDPOINT || 'https://api.deepseek.com/v1/chat/completions';
  const timeout = parseInt(process.env.DEEPSEEK_TIMEOUT || '15000', 10);
  
  // 验证环境变量
  if (!apiKey) {
    throw new Error('Missing DeepSeek API key. Please set DEEPSEEK_API_KEY');
  }
  
  try {
    // 发送请求（带超时控制）
    const response = await axios.post<DeepSeekResponse>(
      endpoint,
      {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature,
        max_tokens: maxTokens,
        response_format: { type: 'json_object' }, // 强制 JSON 输出
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        timeout, // 使用配置的超时时间
      }
    );
    
    // 提取响应内容
    const content = response.data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('DeepSeek API returned empty response');
    }
    
    return content;
  } catch (error: any) {
    // 处理错误
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      throw new Error(`DeepSeek API timeout after ${timeout}ms`);
    } else if (error.response) {
      // API 返回错误响应
      const status = error.response.status;
      const message = error.response.data?.error?.message || error.response.statusText;
      
      if (status === 401) {
        throw new Error('DeepSeek API authentication failed. Please check your API key');
      } else if (status === 429) {
        throw new Error('DeepSeek API rate limit exceeded. Please try again later');
      } else if (status === 500) {
        throw new Error('DeepSeek API server error. Please try again later');
      } else {
        throw new Error(`DeepSeek API Error: ${message}`);
      }
    } else if (error.request) {
      // 请求发送但没有收到响应
      throw new Error('DeepSeek API Timeout: No response received');
    } else {
      // 其他错误
      throw new Error(`DeepSeek Request Error: ${error.message}`);
    }
  }
}

/**
 * 构造错误分析 Prompt（支持多语言）
 */
function buildAnalysisPrompt(gradeResult: GradeResult, language: string = 'zh'): string {
  if (language === 'en') {
    return `
Please analyze the following student's answer sheet:

## Overall Performance
- Total Score: ${gradeResult.totalScore}/${gradeResult.maxScore}
- Accuracy: ${gradeResult.accuracy}%
- Correct Answers: ${gradeResult.correctCount}
- Wrong Answers: ${gradeResult.wrongCount}

## Dimension Scores
${gradeResult.dimensionScores.map(d => 
  `- ${d.dimension}: ${d.score}/${d.maxScore} (${Math.round(d.score/d.maxScore*100)}%)`
).join('\n')}

## Wrong Answer Details
${gradeResult.wrongAnswers.map((w, i) => `
${i + 1}. Question ${w.questionId}
   - Student Answer: ${w.userAnswer}
   - Correct Answer: ${w.correctAnswer}
   - Knowledge Points: ${w.knowledgePoints.join(', ')}
`).join('\n')}

Please return the analysis in JSON format:
{
  "surfaceIssues": ["Surface issue 1", "Surface issue 2", "Surface issue 3"],
  "rootCauses": ["Root cause 1", "Root cause 2"],
  "aiComment": "Comprehensive review (200-500 words, including strengths and improvement suggestions)",
  "knowledgeGaps": [
    {
      "knowledgePoint": "Knowledge point name",
      "difficulty": 3,
      "mastered": false,
      "detail": "Detailed explanation of the importance and learning suggestions"
    }
  ]
}
    `.trim();
  }
  
  // 默认中文
  return `
请分析以下学生的答题情况：

## 总体情况
- 总分: ${gradeResult.totalScore}/${gradeResult.maxScore}
- 正确率: ${gradeResult.accuracy}%
- 正确题数: ${gradeResult.correctCount}
- 错误题数: ${gradeResult.wrongCount}

## 各维度得分
${gradeResult.dimensionScores.map(d => 
  `- ${d.dimension}: ${d.score}/${d.maxScore} (${Math.round(d.score/d.maxScore*100)}%)`
).join('\n')}

## 错题详情
${gradeResult.wrongAnswers.map((w, i) => `
${i + 1}. 题目 ${w.questionId}
   - 学生答案: ${w.userAnswer}
   - 正确答案: ${w.correctAnswer}
   - 涉及知识点: ${w.knowledgePoints.join(', ')}
`).join('\n')}

请以 JSON 格式返回分析结果：
{
  "surfaceIssues": ["表层问题1", "表层问题2", "表层问题3"],
  "rootCauses": ["深层原因1", "深层原因2"],
  "aiComment": "综合点评（200-500字，包含优势分析和改进建议）",
  "knowledgeGaps": [
    {
      "knowledgePoint": "知识点名称",
      "difficulty": 3,
      "mastered": false,
      "detail": "详细说明该知识点的重要性和学习建议"
    }
  ]
}
  `.trim();
}

/**
 * 验证错误分析响应
 */
function validateAnalysis(data: any): ErrorAnalysis {
  // 检查必需字段
  if (!data.surfaceIssues || !Array.isArray(data.surfaceIssues)) {
    throw new Error('Invalid analysis response: missing surfaceIssues');
  }
  
  if (!data.rootCauses || !Array.isArray(data.rootCauses)) {
    throw new Error('Invalid analysis response: missing rootCauses');
  }
  
  if (!data.aiComment || typeof data.aiComment !== 'string') {
    throw new Error('Invalid analysis response: missing aiComment');
  }
  
  if (!data.knowledgeGaps || !Array.isArray(data.knowledgeGaps)) {
    throw new Error('Invalid analysis response: missing knowledgeGaps');
  }
  
  // 验证 knowledgeGaps 结构
  for (const gap of data.knowledgeGaps) {
    if (!gap.knowledgePoint || typeof gap.knowledgePoint !== 'string') {
      throw new Error('Invalid knowledgeGap: missing knowledgePoint');
    }
    if (typeof gap.difficulty !== 'number' || gap.difficulty < 1 || gap.difficulty > 5) {
      throw new Error('Invalid knowledgeGap: difficulty must be 1-5');
    }
    if (typeof gap.mastered !== 'boolean') {
      throw new Error('Invalid knowledgeGap: mastered must be boolean');
    }
    if (!gap.detail || typeof gap.detail !== 'string') {
      throw new Error('Invalid knowledgeGap: missing detail');
    }
  }
  
  return data as ErrorAnalysis;
}

/**
 * 分析错题模式
 * 
 * @param gradeResult - 评分结果
 * @param language - 语言代码（'zh' 或 'en'）
 * @returns 错误分析
 */
export async function analyzeErrors(gradeResult: GradeResult, language: string = 'zh'): Promise<ErrorAnalysis> {
  const prompt = buildAnalysisPrompt(gradeResult, language);
  const systemPrompt = language === 'en' 
    ? `You are a professional education analyst who excels at analyzing student performance and providing personalized recommendations. Please return the analysis strictly in JSON format without any additional text.`.trim()
    : `你是一位专业的教育分析师，擅长分析学生的答题情况并提供个性化建议。请严格按照 JSON 格式返回分析结果，不要包含任何额外的文本。`.trim();
  
  try {
    const responseText = await callDeepSeekAPI(prompt, systemPrompt, 0.7, 2000);
    
    // 解析 JSON
    const analysis = JSON.parse(responseText);
    
    // 验证响应
    return validateAnalysis(analysis);
  } catch (error: any) {
    if (error instanceof SyntaxError) {
      throw new Error('Failed to parse AI response: Invalid JSON format');
    }
    throw error;
  }
}

/**
 * 构造学习路径 Prompt（支持多语言）
 */
function buildPathPrompt(errorAnalysis: ErrorAnalysis, language: string = 'zh'): string {
  if (language === 'en') {
    return `
Based on the following error analysis, generate a personalized learning path:

## Surface Issues
${errorAnalysis.surfaceIssues.map((issue, i) => `${i + 1}. ${issue}`).join('\n')}

## Root Causes
${errorAnalysis.rootCauses.map((cause, i) => `${i + 1}. ${cause}`).join('\n')}

## Knowledge Gaps
${errorAnalysis.knowledgeGaps.map((gap, i) => `
${i + 1}. ${gap.knowledgePoint} (Difficulty: ${gap.difficulty}/5, Mastered: ${gap.mastered ? 'Yes' : 'No'})
   ${gap.detail}
`).join('\n')}

Requirements:
1. Generate 3-5 learning stages
2. Each stage contains 3-5 specific learning contents
3. Follow the order: "Foundation Repair → Intensive Training → Sprint Improvement"
4. Prioritize the weakest knowledge points
5. Provide reasonable estimated duration for each stage

Please return in JSON format:
{
  "stages": [
    {
      "id": "1",
      "title": "Stage Title",
      "content": [
        "Specific learning content 1",
        "Specific learning content 2",
        "Specific learning content 3"
      ],
      "videoLinks": [],
      "duration": "2 weeks"
    }
  ]
}
    `.trim();
  }
  
  // 默认中文
  return `
基于以下错误分析，生成个性化学习路径：

## 表层问题
${errorAnalysis.surfaceIssues.map((issue, i) => `${i + 1}. ${issue}`).join('\n')}

## 深层原因
${errorAnalysis.rootCauses.map((cause, i) => `${i + 1}. ${cause}`).join('\n')}

## 知识点缺口
${errorAnalysis.knowledgeGaps.map((gap, i) => `
${i + 1}. ${gap.knowledgePoint} (难度: ${gap.difficulty}/5, 掌握: ${gap.mastered ? '是' : '否'})
   ${gap.detail}
`).join('\n')}

要求：
1. 生成 3-5 个学习阶段
2. 每个阶段包含 3-5 个具体学习内容
3. 按照"基础修复 → 强化训练 → 冲刺提升"的顺序
4. 优先解决最薄弱的知识点
5. 每个阶段提供合理的预计时长

请以 JSON 格式返回：
{
  "stages": [
    {
      "id": "1",
      "title": "阶段标题",
      "content": [
        "具体学习内容1",
        "具体学习内容2",
        "具体学习内容3"
      ],
      "videoLinks": [],
      "duration": "2周"
    }
  ]
}
  `.trim();
}

/**
 * 验证学习路径响应
 */
function validateLearningPath(data: any): LearningPath {
  // 检查必需字段
  if (!data.stages || !Array.isArray(data.stages)) {
    throw new Error('Invalid learning path response: missing stages');
  }
  
  if (data.stages.length < 3 || data.stages.length > 5) {
    throw new Error('Invalid learning path response: stages must be 3-5');
  }
  
  // 验证每个阶段
  for (const stage of data.stages) {
    if (!stage.id || typeof stage.id !== 'string') {
      throw new Error('Invalid stage: missing id');
    }
    if (!stage.title || typeof stage.title !== 'string') {
      throw new Error('Invalid stage: missing title');
    }
    if (!stage.content || !Array.isArray(stage.content)) {
      throw new Error('Invalid stage: missing content');
    }
    if (stage.content.length < 3 || stage.content.length > 5) {
      throw new Error('Invalid stage: content must be 3-5 items');
    }
    if (!stage.videoLinks || !Array.isArray(stage.videoLinks)) {
      throw new Error('Invalid stage: missing videoLinks');
    }
    if (!stage.duration || typeof stage.duration !== 'string') {
      throw new Error('Invalid stage: missing duration');
    }
  }
  
  return data as LearningPath;
}

/**
 * 生成学习路径
 * 
 * @param errorAnalysis - 错误分析结果
 * @param language - 语言代码（'zh' 或 'en'）
 * @returns 学习路径
 */
export async function generateLearningPath(errorAnalysis: ErrorAnalysis, language: string = 'zh'): Promise<LearningPath> {
  const prompt = buildPathPrompt(errorAnalysis, language);
  const systemPrompt = language === 'en'
    ? `You are a professional learning planner who excels at creating personalized learning paths based on students' weaknesses. Please return the learning path strictly in JSON format without any additional text.`.trim()
    : `你是一位专业的学习规划师，擅长根据学生的薄弱环节制定个性化学习路径。请严格按照 JSON 格式返回学习路径，不要包含任何额外的文本。`.trim();
  
  try {
    const responseText = await callDeepSeekAPI(prompt, systemPrompt, 0.7, 2000);
    
    // 解析 JSON
    const path = JSON.parse(responseText);
    
    // 验证响应
    return validateLearningPath(path);
  } catch (error: any) {
    if (error instanceof SyntaxError) {
      throw new Error('Failed to parse AI response: Invalid JSON format');
    }
    throw error;
  }
}
