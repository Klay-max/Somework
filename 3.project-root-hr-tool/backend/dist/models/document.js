"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentModel = void 0;
class DocumentModel {
    static create(input) {
        const document = {
            id: this.generateId(),
            ...input,
            uploadedAt: new Date(),
            status: 'uploaded',
            metadata: input.metadata || {},
        };
        this.documents.set(document.id, document);
        return document;
    }
    static findById(id) {
        return this.documents.get(id);
    }
    static update(id, input) {
        const document = this.documents.get(id);
        if (!document)
            return undefined;
        const updatedDocument = {
            ...document,
            ...input,
            metadata: input.metadata ? { ...document.metadata, ...input.metadata } : document.metadata,
        };
        this.documents.set(id, updatedDocument);
        return updatedDocument;
    }
    static delete(id) {
        return this.documents.delete(id);
    }
    static findAll() {
        return Array.from(this.documents.values());
    }
    static findByStatus(status) {
        return Array.from(this.documents.values()).filter(doc => doc.status === status);
    }
    static findByMimeType(mimeType) {
        return Array.from(this.documents.values()).filter(doc => doc.mimeType === mimeType);
    }
    static findByDateRange(startDate, endDate) {
        return Array.from(this.documents.values()).filter(doc => doc.uploadedAt >= startDate && doc.uploadedAt <= endDate);
    }
    static search(query) {
        const searchTerm = query.toLowerCase();
        return Array.from(this.documents.values()).filter(doc => doc.originalName.toLowerCase().includes(searchTerm) ||
            doc.filename.toLowerCase().includes(searchTerm) ||
            doc.content.toLowerCase().includes(searchTerm));
    }
    static getStatistics() {
        const documents = Array.from(this.documents.values());
        const statusCounts = documents.reduce((counts, doc) => {
            counts[doc.status] = (counts[doc.status] || 0) + 1;
            return counts;
        }, {});
        const typeCounts = documents.reduce((counts, doc) => {
            counts[doc.mimeType] = (counts[doc.mimeType] || 0) + 1;
            return counts;
        }, {});
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
    static validateStatus(status) {
        const validStatuses = [
            'uploaded', 'analyzing', 'analyzed', 'fixing', 'fixed', 'error'
        ];
        return validStatuses.includes(status);
    }
    static canTransitionTo(currentStatus, newStatus) {
        const validTransitions = {
            'uploaded': ['analyzing', 'error'],
            'analyzing': ['analyzed', 'error'],
            'analyzed': ['fixing', 'error'],
            'fixing': ['fixed', 'analyzed', 'error'],
            'fixed': ['analyzing', 'error'],
            'error': ['uploaded', 'analyzing'],
        };
        return validTransitions[currentStatus]?.includes(newStatus) || false;
    }
    static updateStatus(id, newStatus) {
        const document = this.documents.get(id);
        if (!document)
            return undefined;
        if (!this.canTransitionTo(document.status, newStatus)) {
            throw new Error(`Invalid status transition from ${document.status} to ${newStatus}`);
        }
        return this.update(id, { status: newStatus });
    }
    static getDocumentsBySize(minSize, maxSize) {
        return Array.from(this.documents.values()).filter(doc => {
            if (minSize !== undefined && doc.size < minSize)
                return false;
            if (maxSize !== undefined && doc.size > maxSize)
                return false;
            return true;
        });
    }
    static cleanup(olderThanDays = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
        const documentsToDelete = Array.from(this.documents.values()).filter(doc => doc.uploadedAt < cutoffDate && (doc.status === 'error' || doc.status === 'fixed'));
        let deletedCount = 0;
        for (const doc of documentsToDelete) {
            if (this.delete(doc.id)) {
                deletedCount++;
            }
        }
        return deletedCount;
    }
    static generateId() {
        return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    static clear() {
        this.documents.clear();
    }
}
exports.DocumentModel = DocumentModel;
DocumentModel.documents = new Map();
//# sourceMappingURL=document.js.map