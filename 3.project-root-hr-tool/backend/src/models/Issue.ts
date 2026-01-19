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
    range?: { start: number; end: number };
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
  confidence: number; // 0-1
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

export class IssueModel {
  private static issues: Map<string, Issue> = new Map();
  private static suggestions: Map<string, FixSuggestion> = new Map();

  static create(input: IssueCreateInput): Issue {
    const issueId = this.generateId('issue');
    const suggestionId = this.generateId('suggestion');

    const suggestion: FixSuggestion = {
      id: suggestionId,
      issueId,
      ...input.suggestion,
    };

    const issue: Issue = {
      id: issueId,
      ...input,
      suggestion,
    };

    this.issues.set(issueId, issue);
    this.suggestions.set(suggestionId, suggestion);

    return issue;
  }

  static findById(id: string): Issue | undefined {
    return this.issues.get(id);
  }

  static findByDocumentId(documentId: string): Issue[] {
    return Array.from(this.issues.values()).filter(issue => issue.documentId === documentId);
  }

  static findBySeverity(severity: Issue['severity']): Issue[] {
    return Array.from(this.issues.values()).filter(issue => issue.severity === severity);
  }

  static findByType(type: Issue['type']): Issue[] {
    return Array.from(this.issues.values()).filter(issue => issue.type === type);
  }

  static update(id: string, updates: Partial<Issue>): Issue | undefined {
    const issue = this.issues.get(id);
    if (!issue) return undefined;

    const updatedIssue = { ...issue, ...updates };
    this.issues.set(id, updatedIssue);
    return updatedIssue;
  }

  static delete(id: string): boolean {
    const issue = this.issues.get(id);
    if (issue) {
      this.suggestions.delete(issue.suggestion.id);
    }
    return this.issues.delete(id);
  }

  static deleteByDocumentId(documentId: string): number {
    const issues = this.findByDocumentId(documentId);
    let deletedCount = 0;

    for (const issue of issues) {
      if (this.delete(issue.id)) {
        deletedCount++;
      }
    }

    return deletedCount;
  }

  static sortBySeverity(issues: Issue[]): Issue[] {
    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    return [...issues].sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity]);
  }

  static sortByType(issues: Issue[]): Issue[] {
    const typeOrder = { grammar: 1, format: 2, consistency: 3, structure: 4, content: 5 };
    return [...issues].sort((a, b) => typeOrder[a.type] - typeOrder[b.type]);
  }

  static sortByConfidence(issues: Issue[]): Issue[] {
    return [...issues].sort((a, b) => b.suggestion.confidence - a.suggestion.confidence);
  }

  static sortByLocation(issues: Issue[]): Issue[] {
    return [...issues].sort((a, b) => {
      // Sort by page first, then line, then column
      if (a.location.page !== b.location.page) {
        return (a.location.page || 0) - (b.location.page || 0);
      }
      if (a.location.line !== b.location.line) {
        return (a.location.line || 0) - (b.location.line || 0);
      }
      return (a.location.column || 0) - (b.location.column || 0);
    });
  }

  static filterByType(issues: Issue[], type: Issue['type']): Issue[] {
    return issues.filter(issue => issue.type === type);
  }

  static filterBySeverity(issues: Issue[], severity: Issue['severity']): Issue[] {
    return issues.filter(issue => issue.severity === severity);
  }

  static filterByAutoFixable(issues: Issue[], autoFixable: boolean): Issue[] {
    return issues.filter(issue => issue.isAutoFixable === autoFixable);
  }

  static filterByConfidence(issues: Issue[], minConfidence: number): Issue[] {
    return issues.filter(issue => issue.suggestion.confidence >= minConfidence);
  }

  static filterByManualReview(issues: Issue[], requiresManualReview: boolean): Issue[] {
    return issues.filter(issue => issue.suggestion.requiresManualReview === requiresManualReview);
  }

  static searchIssues(issues: Issue[], query: string): Issue[] {
    const searchTerm = query.toLowerCase();
    return issues.filter(issue =>
      issue.title.toLowerCase().includes(searchTerm) ||
      issue.description.toLowerCase().includes(searchTerm) ||
      issue.originalText.toLowerCase().includes(searchTerm) ||
      issue.context.toLowerCase().includes(searchTerm) ||
      issue.suggestion.suggestedText.toLowerCase().includes(searchTerm) ||
      issue.suggestion.explanation.toLowerCase().includes(searchTerm)
    );
  }

  static getIssueStatistics(issues: Issue[]): IssueStatistics {
    const typeCounts = this.groupByType(issues);
    const severityCounts = this.groupBySeverity(issues);
    
    const autoFixableCount = issues.filter(issue => issue.isAutoFixable).length;
    const manualReviewCount = issues.filter(issue => issue.suggestion.requiresManualReview).length;
    
    const averageConfidence = issues.length > 0 
      ? issues.reduce((sum, issue) => sum + issue.suggestion.confidence, 0) / issues.length
      : 0;

    const highPriorityCount = issues.filter(issue => 
      issue.severity === 'critical' || issue.severity === 'high'
    ).length;

    return {
      totalIssues: issues.length,
      typeCounts: Object.fromEntries(
        Object.entries(typeCounts).map(([type, issueArray]) => [type, issueArray.length])
      ) as Record<Issue['type'], number>,
      severityCounts: Object.fromEntries(
        Object.entries(severityCounts).map(([severity, issueArray]) => [severity, issueArray.length])
      ) as Record<Issue['severity'], number>,
      autoFixableCount,
      manualReviewCount,
      averageConfidence,
      highPriorityCount,
      lowConfidenceCount: issues.filter(issue => issue.suggestion.confidence < 0.7).length,
    };
  }

  static validateIssueType(type: string): type is Issue['type'] {
    const validTypes: Issue['type'][] = ['grammar', 'format', 'consistency', 'structure', 'content'];
    return validTypes.includes(type as Issue['type']);
  }

  static validateSeverity(severity: string): severity is Issue['severity'] {
    const validSeverities: Issue['severity'][] = ['low', 'medium', 'high', 'critical'];
    return validSeverities.includes(severity as Issue['severity']);
  }

  static createBulkIssues(inputs: IssueCreateInput[]): Issue[] {
    const createdIssues: Issue[] = [];
    
    for (const input of inputs) {
      try {
        const issue = this.create(input);
        createdIssues.push(issue);
      } catch (error) {
        console.warn('Failed to create issue:', error.message, input);
      }
    }
    
    return createdIssues;
  }

  static updateBulkIssues(updatesList: Array<{ id: string; updates: Partial<Issue> }>): Issue[] {
    const updatedIssues: Issue[] = [];
    
    for (const { id, updates } of updatesList) {
      const updatedIssue = this.update(id, updates);
      if (updatedIssue) {
        updatedIssues.push(updatedIssue);
      }
    }
    
    return updatedIssues;
  }

  static deleteBulkIssues(ids: string[]): number {
    let deletedCount = 0;
    
    for (const id of ids) {
      if (this.delete(id)) {
        deletedCount++;
      }
    }
    
    return deletedCount;
  }

  static groupByType(issues: Issue[]): Record<Issue['type'], Issue[]> {
    return issues.reduce((groups, issue) => {
      if (!groups[issue.type]) {
        groups[issue.type] = [];
      }
      groups[issue.type].push(issue);
      return groups;
    }, {} as Record<Issue['type'], Issue[]>);
  }

  static groupBySeverity(issues: Issue[]): Record<Issue['severity'], Issue[]> {
    return issues.reduce((groups, issue) => {
      if (!groups[issue.severity]) {
        groups[issue.severity] = [];
      }
      groups[issue.severity].push(issue);
      return groups;
    }, {} as Record<Issue['severity'], Issue[]>);
  }

  static generateFixSummary(issues: Issue[], fixedIssueIds: string[]): FixSummary {
    const fixedIssues = issues.filter(issue => fixedIssueIds.includes(issue.id));
    const skippedIssues = issues.filter(issue => !fixedIssueIds.includes(issue.id));
    const manualReviewRequired = fixedIssues.filter(issue => issue.suggestion.requiresManualReview).length;

    const fixedByType = fixedIssues.reduce((counts, issue) => {
      counts[issue.type] = (counts[issue.type] || 0) + 1;
      return counts;
    }, {} as Record<Issue['type'], number>);

    const totalConfidence = fixedIssues.reduce((sum, issue) => sum + issue.suggestion.confidence, 0);
    const averageConfidence = fixedIssues.length > 0 ? totalConfidence / fixedIssues.length : 0;

    return {
      totalIssues: issues.length,
      fixedIssues: fixedIssues.length,
      skippedIssues: skippedIssues.length,
      manualReviewRequired,
      fixedByType,
      processingTime: 0, // Will be set by the service
      confidence: averageConfidence,
    };
  }

  private static generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static clear(): void {
    this.issues.clear();
    this.suggestions.clear();
  }
}