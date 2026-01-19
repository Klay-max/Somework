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
export interface DocumentCreateInput {
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    content: string;
    metadata?: {
        pageCount?: number;
        wordCount?: number;
        language?: string;
    };
}
export interface DocumentUpdateInput {
    status?: Document['status'];
    content?: string;
    metadata?: Document['metadata'];
}
export interface DocumentStatistics {
    totalDocuments: number;
    statusCounts: Record<Document['status'], number>;
    typeCounts: Record<string, number>;
    totalSize: number;
    averageSize: number;
    oldestDocument: Document | null;
    newestDocument: Document | null;
}
export declare class DocumentModel {
    private static documents;
    static create(input: DocumentCreateInput): Document;
    static findById(id: string): Document | undefined;
    static update(id: string, input: DocumentUpdateInput): Document | undefined;
    static delete(id: string): boolean;
    static findAll(): Document[];
    static findByStatus(status: Document['status']): Document[];
    static findByMimeType(mimeType: string): Document[];
    static findByDateRange(startDate: Date, endDate: Date): Document[];
    static search(query: string): Document[];
    static getStatistics(): DocumentStatistics;
    static validateStatus(status: string): status is Document['status'];
    static canTransitionTo(currentStatus: Document['status'], newStatus: Document['status']): boolean;
    static updateStatus(id: string, newStatus: Document['status']): Document | undefined;
    static getDocumentsBySize(minSize?: number, maxSize?: number): Document[];
    static cleanup(olderThanDays?: number): number;
    private static generateId;
    static clear(): void;
}
//# sourceMappingURL=document.d.ts.map