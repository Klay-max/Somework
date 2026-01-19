import { Issue, FixSuggestion, FixSummary } from './issue';

export interface UploadResponse {
  documentId: string;
  filename: string;
  size: number;
}

export interface AnalysisResponse {
  issues: Issue[];
  analysisId: string;
  status: 'completed' | 'processing' | 'failed';
}

export interface AnalysisResultResponse {
  issues: Issue[];
  suggestions: FixSuggestion[];
  status: string;
}

export interface FixRequest {
  selectedIssues: string[];
  autoFix: boolean;
}

export interface FixResponse {
  fixedDocumentId: string;
  fixSummary: FixSummary;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}