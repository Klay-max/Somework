import { Document } from '../models/document';
export declare class AnalysisService {
    private static deepSeekClient;
    private static retryConfig;
    private static analysisCache;
    private static analysisStatus;
    static analyzeDocument(document: Document): Promise<string>;
    private static performAnalysis;
    private static callDeepSeekAPI;
    private static shouldRetryRequest;
    private static calculateRetryDelay;
    private static validateApiResponse;
    private static buildAnalysisPrompt;
    private static parseAnalysisResult;
    private static createMockAnalysis;
    private static generateAnalysisId;
    private static delay;
    static getAnalysisStatus(analysisId: string): Promise<string>;
    static cancelAnalysis(analysisId: string): Promise<boolean>;
}
//# sourceMappingURL=AnalysisService.d.ts.map