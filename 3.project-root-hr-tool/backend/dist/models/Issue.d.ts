export interface Issue {
    id: string;
    documentId: string;
    type: 'grammar' | 'format' | 'consistency' | 'structure' | 'content';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    location: {
        page?: number;
        line?: number;
        column?: number;
        range?: {
            start: number;
            end: number;
        };
    };
    originalText: string;
    context: string;
    suggestion: FixSuggestion;
    isAutoFixable: boolean;
}
export interface FixSuggestion {
    id: string;
    issueId: string;
    suggestedText: string;
    explanation: string;
    confidence: number;
    alternativeOptions?: string[];
    requiresManualReview: boolean;
}
export interface FixSummary {
    totalIssues: number;
    fixedIssues: number;
    skippedIssues: number;
    manualReviewRequired: number;
    fixedByType: Record<Issue['type'], number>;
    processingTime: number;
    confidence: number;
}
export interface IssueStatistics {
    totalIssues: number;
    typeCounts: Record<Issue['type'], number>;
    severityCounts: Record<Issue['severity'], number>;
    autoFixableCount: number;
    manualReviewCount: number;
    averageConfidence: number;
    highPriorityCount: number;
    lowConfidenceCount: number;
}
export interface IssueFilter {
    type?: Issue['type'];
    severity?: Issue['severity'];
    isAutoFixable?: boolean;
    requiresManualReview?: boolean;
    minConfidence?: number;
    maxConfidence?: number;
    documentId?: string;
    search?: string;
}
export interface IssueSortOptions {
    field: 'severity' | 'type' | 'confidence' | 'location' | 'created';
    direction: 'asc' | 'desc';
}
export interface IssueCreateInput {
    documentId: string;
    type: Issue['type'];
    severity: Issue['severity'];
    title: string;
    description: string;
    location: Issue['location'];
    originalText: string;
    context: string;
    suggestion: Omit<FixSuggestion, 'id' | 'issueId'>;
    isAutoFixable: boolean;
}
export declare class IssueModel {
    private static issues;
    private static suggestions;
    static create(input: IssueCreateInput): Issue;
    static findById(id: string): Issue | undefined;
    static findByDocumentId(documentId: string): Issue[];
    static findBySeverity(severity: Issue['severity']): Issue[];
    static findByType(type: Issue['type']): Issue[];
    static update(id: string, updates: Partial<Issue>): Issue | undefined;
    static delete(id: string): boolean;
    static deleteByDocumentId(documentId: string): number;
    static sortBySeverity(issues: Issue[]): Issue[];
    static sortByType(issues: Issue[]): Issue[];
    static sortByConfidence(issues: Issue[]): Issue[];
    static sortByLocation(issues: Issue[]): Issue[];
    static filterByType(issues: Issue[], type: Issue['type']): Issue[];
    static filterBySeverity(issues: Issue[], severity: Issue['severity']): Issue[];
    static filterByAutoFixable(issues: Issue[], autoFixable: boolean): Issue[];
    static filterByConfidence(issues: Issue[], minConfidence: number): Issue[];
    static filterByManualReview(issues: Issue[], requiresManualReview: boolean): Issue[];
    static searchIssues(issues: Issue[], query: string): Issue[];
    static getIssueStatistics(issues: Issue[]): IssueStatistics;
    static validateIssueType(type: string): type is Issue['type'];
    static validateSeverity(severity: string): severity is Issue['severity'];
    static createBulkIssues(inputs: IssueCreateInput[]): Issue[];
    static updateBulkIssues(updatesList: Array<{
        id: string;
        updates: Partial<Issue>;
    }>): Issue[];
    static deleteBulkIssues(ids: string[]): number;
    static groupByType(issues: Issue[]): Record<Issue['type'], Issue[]>;
    static groupBySeverity(issues: Issue[]): Record<Issue['severity'], Issue[]>;
    static generateFixSummary(issues: Issue[], fixedIssueIds: string[]): FixSummary;
    private static generateId;
    static clear(): void;
}
//# sourceMappingURL=Issue.d.ts.map