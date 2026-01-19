export interface Document {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: Date;
  content: string;
  metadata: {
    pageCount?: number;
    wordCount?: number;
    language?: string;
  };
  status: 'uploaded' | 'analyzing' | 'analyzed' | 'fixing' | 'fixed' | 'error';
}