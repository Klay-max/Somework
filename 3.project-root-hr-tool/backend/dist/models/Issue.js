"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IssueModel = void 0;
class IssueModel {
    static create(input) {
        const issueId = this.generateId('issue');
        const suggestionId = this.generateId('suggestion');
        const suggestion = {
            id: suggestionId,
            issueId,
            ...input.suggestion,
        };
        const issue = {
            id: issueId,
            ...input,
            suggestion,
        };
        this.issues.set(issueId, issue);
        this.suggestions.set(suggestionId, suggestion);
        return issue;
    }
    static findById(id) {
        return this.issues.get(id);
    }
    static findByDocumentId(documentId) {
        return Array.from(this.issues.values()).filter(issue => issue.documentId === documentId);
    }
    static findBySeverity(severity) {
        return Array.from(this.issues.values()).filter(issue => issue.severity === severity);
    }
    static findByType(type) {
        return Array.from(this.issues.values()).filter(issue => issue.type === type);
    }
    static update(id, updates) {
        const issue = this.issues.get(id);
        if (!issue)
            return undefined;
        const updatedIssue = { ...issue, ...updates };
        this.issues.set(id, updatedIssue);
        return updatedIssue;
    }
    static delete(id) {
        const issue = this.issues.get(id);
        if (issue) {
            this.suggestions.delete(issue.suggestion.id);
        }
        return this.issues.delete(id);
    }
    static deleteByDocumentId(documentId) {
        const issues = this.findByDocumentId(documentId);
        let deletedCount = 0;
        for (const issue of issues) {
            if (this.delete(issue.id)) {
                deletedCount++;
            }
        }
        return deletedCount;
    }
    static sortBySeverity(issues) {
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return [...issues].sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity]);
    }
    static sortByType(issues) {
        const typeOrder = { grammar: 1, format: 2, consistency: 3, structure: 4, content: 5 };
        return [...issues].sort((a, b) => typeOrder[a.type] - typeOrder[b.type]);
    }
    static sortByConfidence(issues) {
        return [...issues].sort((a, b) => b.suggestion.confidence - a.suggestion.confidence);
    }
    static sortByLocation(issues) {
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
    static filterByType(issues, type) {
        return issues.filter(issue => issue.type === type);
    }
    static filterBySeverity(issues, severity) {
        return issues.filter(issue => issue.severity === severity);
    }
    static filterByAutoFixable(issues, autoFixable) {
        return issues.filter(issue => issue.isAutoFixable === autoFixable);
    }
    static filterByConfidence(issues, minConfidence) {
        return issues.filter(issue => issue.suggestion.confidence >= minConfidence);
    }
    static filterByManualReview(issues, requiresManualReview) {
        return issues.filter(issue => issue.suggestion.requiresManualReview === requiresManualReview);
    }
    static searchIssues(issues, query) {
        const searchTerm = query.toLowerCase();
        return issues.filter(issue => issue.title.toLowerCase().includes(searchTerm) ||
            issue.description.toLowerCase().includes(searchTerm) ||
            issue.originalText.toLowerCase().includes(searchTerm) ||
            issue.context.toLowerCase().includes(searchTerm) ||
            issue.suggestion.suggestedText.toLowerCase().includes(searchTerm) ||
            issue.suggestion.explanation.toLowerCase().includes(searchTerm));
    }
    static getIssueStatistics(issues) {
        const typeCounts = this.groupByType(issues);
        const severityCounts = this.groupBySeverity(issues);
        const autoFixableCount = issues.filter(issue => issue.isAutoFixable).length;
        const manualReviewCount = issues.filter(issue => issue.suggestion.requiresManualReview).length;
        const averageConfidence = issues.length > 0
            ? issues.reduce((sum, issue) => sum + issue.suggestion.confidence, 0) / issues.length
            : 0;
        const highPriorityCount = issues.filter(issue => issue.severity === 'critical' || issue.severity === 'high').length;
        return {
            totalIssues: issues.length,
            typeCounts: Object.fromEntries(Object.entries(typeCounts).map(([type, issueArray]) => [type, issueArray.length])),
            severityCounts: Object.fromEntries(Object.entries(severityCounts).map(([severity, issueArray]) => [severity, issueArray.length])),
            autoFixableCount,
            manualReviewCount,
            averageConfidence,
            highPriorityCount,
            lowConfidenceCount: issues.filter(issue => issue.suggestion.confidence < 0.7).length,
        };
    }
    static validateIssueType(type) {
        const validTypes = ['grammar', 'format', 'consistency', 'structure', 'content'];
        return validTypes.includes(type);
    }
    static validateSeverity(severity) {
        const validSeverities = ['low', 'medium', 'high', 'critical'];
        return validSeverities.includes(severity);
    }
    static createBulkIssues(inputs) {
        const createdIssues = [];
        for (const input of inputs) {
            try {
                const issue = this.create(input);
                createdIssues.push(issue);
            }
            catch (error) {
                console.warn('Failed to create issue:', error.message, input);
            }
        }
        return createdIssues;
    }
    static updateBulkIssues(updatesList) {
        const updatedIssues = [];
        for (const { id, updates } of updatesList) {
            const updatedIssue = this.update(id, updates);
            if (updatedIssue) {
                updatedIssues.push(updatedIssue);
            }
        }
        return updatedIssues;
    }
    static deleteBulkIssues(ids) {
        let deletedCount = 0;
        for (const id of ids) {
            if (this.delete(id)) {
                deletedCount++;
            }
        }
        return deletedCount;
    }
    static groupByType(issues) {
        return issues.reduce((groups, issue) => {
            if (!groups[issue.type]) {
                groups[issue.type] = [];
            }
            groups[issue.type].push(issue);
            return groups;
        }, {});
    }
    static groupBySeverity(issues) {
        return issues.reduce((groups, issue) => {
            if (!groups[issue.severity]) {
                groups[issue.severity] = [];
            }
            groups[issue.severity].push(issue);
            return groups;
        }, {});
    }
    static generateFixSummary(issues, fixedIssueIds) {
        const fixedIssues = issues.filter(issue => fixedIssueIds.includes(issue.id));
        const skippedIssues = issues.filter(issue => !fixedIssueIds.includes(issue.id));
        const manualReviewRequired = fixedIssues.filter(issue => issue.suggestion.requiresManualReview).length;
        const fixedByType = fixedIssues.reduce((counts, issue) => {
            counts[issue.type] = (counts[issue.type] || 0) + 1;
            return counts;
        }, {});
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
    static generateId(prefix) {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    static clear() {
        this.issues.clear();
        this.suggestions.clear();
    }
}
exports.IssueModel = IssueModel;
IssueModel.issues = new Map();
IssueModel.suggestions = new Map();
//# sourceMappingURL=Issue.js.map