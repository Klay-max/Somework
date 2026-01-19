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