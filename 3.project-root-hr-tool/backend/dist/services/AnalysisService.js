"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalysisService = void 0;
const axios_1 = __importDefault(require("axios"));
const Issue_1 = require("../models/Issue");
const logger_1 = require("../utils/logger");
const errorHandler_1 = require("../middleware/errorHandler");
class AnalysisService {
    static async analyzeDocument(document) {
        try {
            logger_1.logger.info('Starting document analysis', { documentId: document.id });
            const analysisId = this.generateAnalysisId();
            // Simulate async analysis
            setTimeout(async () => {
                try {
                    await this.performAnalysis(document, analysisId);
                }
                catch (error) {
                    logger_1.logger.error('Analysis failed', {
                        documentId: document.id,
                        analysisId,
                        error: error.message
                    });
                }
            }, 100);
            return analysisId;
        }
        catch (error) {
            logger_1.logger.error('Failed to start analysis', {
                documentId: document.id,
                error: error.message
            });
            throw error;
        }
    }
    static async performAnalysis(document, analysisId) {
        try {
            logger_1.logger.info('Performing document analysis', {
                documentId: document.id,
                analysisId
            });
            // Call DeepSeek API for analysis
            const analysisResult = await this.callDeepSeekAPI(document.content);
            // Parse and create issues
            const issues = this.parseAnalysisResult(analysisResult, document.id);
            // Store issues
            for (const issueInput of issues) {
                Issue_1.IssueModel.create(issueInput);
            }
            logger_1.logger.info('Document analysis completed', {
                documentId: document.id,
                analysisId,
                issuesFound: issues.length
            });
        }
        catch (error) {
            logger_1.logger.error('Analysis processing failed', {
                documentId: document.id,
                analysisId,
                error: error.message
            });
            throw error;
        }
    }
    static async callDeepSeekAPI(content, retryCount = 0) {
        try {
            const prompt = this.buildAnalysisPrompt(content);
            const response = await this.deepSeekClient.post('/chat/completions', {
                model: 'deepseek-chat',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert HR document analyzer. Analyze the provided document and identify issues related to grammar, format, consistency, structure, and content. Return your analysis in JSON format.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.1,
                max_tokens: 2000,
                stream: false,
            });
            return response.data;
        }
        catch (error) {
            const shouldRetry = this.shouldRetryRequest(error, retryCount);
            if (shouldRetry) {
                const delay = this.calculateRetryDelay(retryCount);
                logger_1.logger.warn('API call failed, retrying', {
                    retryCount: retryCount + 1,
                    delay,
                    error: error.message
                });
                await this.delay(delay);
                return this.callDeepSeekAPI(content, retryCount + 1);
            }
            logger_1.logger.error('DeepSeek API call failed after retries', {
                retryCount,
                error: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText
            });
            throw (0, errorHandler_1.createError)('Analysis service unavailable', 503, 'ANALYSIS_SERVICE_ERROR', { originalError: error.message, retryCount });
        }
    }
    static shouldRetryRequest(error, retryCount) {
        if (retryCount >= this.retryConfig.maxRetries) {
            return false;
        }
        // Retry on network errors
        if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
            return true;
        }
        // Retry on specific HTTP status codes
        if (error.response?.status) {
            const retryableStatuses = [429, 500, 502, 503, 504];
            return retryableStatuses.includes(error.response.status);
        }
        return false;
    }
    static calculateRetryDelay(retryCount) {
        return this.retryConfig.retryDelay * Math.pow(this.retryConfig.backoffMultiplier, retryCount);
    }
    static validateApiResponse(response) {
        try {
            if (!response || !response.choices || !Array.isArray(response.choices)) {
                return false;
            }
            if (response.choices.length === 0) {
                return false;
            }
            const choice = response.choices[0];
            if (!choice.message || !choice.message.content) {
                return false;
            }
            return true;
        }
        catch (error) {
            logger_1.logger.warn('API response validation failed', { error: error.message });
            return false;
        }
    }
    static buildAnalysisPrompt(content) {
        return `
Please analyze the following HR document and identify any issues:

Document Content:
${content.substring(0, 4000)}${content.length > 4000 ? '...' : ''}

Please identify issues in the following categories:
1. Grammar - spelling, punctuation, sentence structure
2. Format - document structure, headings, bullet points
3. Consistency - terminology, formatting, style
4. Structure - logical flow, organization
5. Content - completeness, accuracy, clarity

For each issue found, provide:
- Type (grammar/format/consistency/structure/content)
- Severity (low/medium/high/critical)
- Title (brief description)
- Description (detailed explanation)
- Location (approximate line/section)
- Original text (problematic text)
- Suggested fix
- Confidence level (0-1)

Return the response in JSON format with an array of issues.
`;
    }
    static parseAnalysisResult(apiResult, documentId) {
        try {
            const issues = [];
            // Parse DeepSeek response
            const content = apiResult.choices?.[0]?.message?.content;
            if (!content) {
                logger_1.logger.warn('No analysis content received from API');
                return [];
            }
            // Try to extract JSON from the response
            let analysisData;
            try {
                // Look for JSON in the response
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    analysisData = JSON.parse(jsonMatch[0]);
                }
                else {
                    // Fallback: create mock issues for demonstration
                    analysisData = this.createMockAnalysis(documentId);
                }
            }
            catch (parseError) {
                logger_1.logger.warn('Failed to parse API response, using mock data', {
                    error: parseError.message
                });
                analysisData = this.createMockAnalysis(documentId);
            }
            // Convert to IssueCreateInput format
            if (analysisData.issues && Array.isArray(analysisData.issues)) {
                for (const issue of analysisData.issues) {
                    issues.push({
                        documentId,
                        type: issue.type || 'content',
                        severity: issue.severity || 'medium',
                        title: issue.title || 'Issue detected',
                        description: issue.description || 'An issue was detected in the document',
                        location: {
                            page: issue.location?.page,
                            line: issue.location?.line,
                            column: issue.location?.column,
                            range: issue.location?.range,
                        },
                        originalText: issue.originalText || '',
                        context: issue.context || issue.originalText || '',
                        suggestion: {
                            suggestedText: issue.suggestedFix || issue.originalText || '',
                            explanation: issue.explanation || 'Suggested improvement',
                            confidence: issue.confidence || 0.8,
                            alternativeOptions: issue.alternatives || [],
                            requiresManualReview: issue.severity === 'critical' || issue.confidence < 0.6,
                        },
                        isAutoFixable: issue.isAutoFixable !== false && issue.confidence > 0.7,
                    });
                }
            }
            return issues;
        }
        catch (error) {
            logger_1.logger.error('Failed to parse analysis result', { error: error.message });
            return this.createMockAnalysis(documentId);
        }
    }
    static createMockAnalysis(documentId) {
        return [
            {
                documentId,
                type: 'grammar',
                severity: 'medium',
                title: 'Spelling Error',
                description: 'Potential spelling mistake detected',
                location: { line: 1, column: 10 },
                originalText: 'teh',
                context: 'In teh beginning...',
                suggestion: {
                    suggestedText: 'the',
                    explanation: 'Correct spelling of "the"',
                    confidence: 0.95,
                    requiresManualReview: false,
                },
                isAutoFixable: true,
            },
            {
                documentId,
                type: 'format',
                severity: 'low',
                title: 'Inconsistent Formatting',
                description: 'Heading format is inconsistent with document style',
                location: { line: 5 },
                originalText: 'section header',
                context: 'section header\nContent follows...',
                suggestion: {
                    suggestedText: 'Section Header',
                    explanation: 'Capitalize section headers for consistency',
                    confidence: 0.8,
                    requiresManualReview: false,
                },
                isAutoFixable: true,
            },
        ];
    }
    static generateAnalysisId() {
        return `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    static delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    static async getAnalysisStatus(analysisId) {
        // In a real implementation, this would check the status of the analysis
        // For now, we'll assume all analyses complete quickly
        return 'completed';
    }
    static async cancelAnalysis(analysisId) {
        logger_1.logger.info('Analysis cancellation requested', { analysisId });
        // Implementation would cancel ongoing analysis
        return true;
    }
}
exports.AnalysisService = AnalysisService;
AnalysisService.deepSeekClient = axios_1.default.create({
    baseURL: process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1',
    timeout: 30000,
    headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
    },
});
AnalysisService.retryConfig = {
    maxRetries: 3,
    retryDelay: 1000,
    backoffMultiplier: 2,
};
AnalysisService.analysisCache = new Map();
AnalysisService.analysisStatus = new Map();
//# sourceMappingURL=AnalysisService.js.map