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
    originalDocumentId?: string; // Reference to original document for fixed versions
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
    originalDocumentId?: string; // Reference to original document for fixed versions
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

export class DocumentModel {
  private static documents: Map<string, Document> = new Map();

  static create(input: DocumentCreateInput): Document {
    const document: Document = {
      id: this.generateId(),
      ...input,
      uploadedAt: new Date(),
      status: 'uploaded',
      metadata: input.metadata || {},
    };

    this.documents.set(document.id, document);
    return document;
  }

  static findById(id: string): Document | undefined {
    return this.documents.get(id);
  }

  static update(id: string, input: DocumentUpdateInput): Document | undefined {
    const document = this.documents.get(id);
    if (!document) return undefined;

    const updatedDocument = {
      ...document,
      ...input,
      metadata: input.metadata ? { ...document.metadata, ...input.metadata } : document.metadata,
    };

    this.documents.set(id, updatedDocument);
    return updatedDocument;
  }

  static delete(id: string): boolean {
    return this.documents.delete(id);
  }

  static findAll(): Document[] {
    return Array.from(this.documents.values());
  }

  static findByStatus(status: Document['status']): Document[] {
    return Array.from(this.documents.values()).filter(doc => doc.status === status);
  }

  static findByMimeType(mimeType: string): Document[] {
    return Array.from(this.documents.values()).filter(doc => doc.mimeType === mimeType);
  }

  static findByDateRange(startDate: Date, endDate: Date): Document[] {
    return Array.from(this.documents.values()).filter(doc => 
      doc.uploadedAt >= startDate && doc.uploadedAt <= endDate
    );
  }

  static search(query: string): Document[] {
    const searchTerm = query.toLowerCase();
    return Array.from(this.documents.values()).filter(doc =>
      doc.originalName.toLowerCase().includes(searchTerm) ||
      doc.filename.toLowerCase().includes(searchTerm) ||
      doc.content.toLowerCase().includes(searchTerm)
    );
  }

  static getStatistics(): DocumentStatistics {
    const documents = Array.from(this.documents.values());
    const statusCounts = documents.reduce((counts, doc) => {
      counts[doc.status] = (counts[doc.status] || 0) + 1;
      return counts;
    }, {} as Record<Document['status'], number>);

    const typeCounts = documents.reduce((counts, doc) => {
      counts[doc.mimeType] = (counts[doc.mimeType] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    const totalSize = documents.reduce((sum, doc) => sum + doc.size, 0);
    const averageSize = documents.length > 0 ? totalSize / documents.length : 0;

    return {
      totalDocuments: documents.length,
      statusCounts,
      typeCounts,
      totalSize,
      averageSize,
      oldestDocument: documents.length > 0 ? 
        documents.reduce((oldest, doc) => doc.uploadedAt < oldest.uploadedAt ? doc : oldest) : null,
      newestDocument: documents.length > 0 ? 
        documents.reduce((newest, doc) => doc.uploadedAt > newest.uploadedAt ? doc : newest) : null,
    };
  }

  static validateStatus(status: string): status is Document['status'] {
    const validStatuses: Document['status'][] = [
      'uploaded', 'analyzing', 'analyzed', 'fixing', 'fixed', 'error'
    ];
    return validStatuses.includes(status as Document['status']);
  }

  static canTransitionTo(currentStatus: Document['status'], newStatus: Document['status']): boolean {
    const validTransitions: Record<Document['status'], Document['status'][]> = {
      'uploaded': ['analyzing', 'error'],
      'analyzing': ['analyzed', 'error'],
      'analyzed': ['fixing', 'error'],
      'fixing': ['fixed', 'analyzed', 'error'],
      'fixed': ['analyzing', 'error'],
      'error': ['uploaded', 'analyzing'],
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }

  static updateStatus(id: string, newStatus: Document['status']): Document | undefined {
    const document = this.documents.get(id);
    if (!document) return undefined;

    if (!this.canTransitionTo(document.status, newStatus)) {
      throw new Error(`Invalid status transition from ${document.status} to ${newStatus}`);
    }

    return this.update(id, { status: newStatus });
  }

  static getDocumentsBySize(minSize?: number, maxSize?: number): Document[] {
    return Array.from(this.documents.values()).filter(doc => {
      if (minSize !== undefined && doc.size < minSize) return false;
      if (maxSize !== undefined && doc.size > maxSize) return false;
      return true;
    });
  }

  static cleanup(olderThanDays: number = 30): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    
    const documentsToDelete = Array.from(this.documents.values()).filter(doc =>
      doc.uploadedAt < cutoffDate && (doc.status === 'error' || doc.status === 'fixed')
    );

    let deletedCount = 0;
    for (const doc of documentsToDelete) {
      if (this.delete(doc.id)) {
        deletedCount++;
      }
    }

    return deletedCount;
  }

  private static generateId(): string {
    return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static clear(): void {
    this.documents.clear();
  }
}