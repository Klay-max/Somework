"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentController = void 0;
const document_1 = require("../models/document");
const Issue_1 = require("../models/Issue");
const DocumentService_1 = require("../services/DocumentService");
const AnalysisService_1 = require("../services/AnalysisService");
const errorHandler_1 = require("../middleware/errorHandler");
const logger_1 = require("../utils/logger");
class DocumentController {
    static async upload(req, res, next) {
        try {
            if (!req.file) {
                return next((0, errorHandler_1.createError)('No file uploaded', 400, 'NO_FILE'));
            }
            logger_1.logger.info('File upload started', {
                filename: req.file.originalname,
                size: req.file.size,
                mimetype: req.file.mimetype,
            });
            // Parse document content
            const content = await DocumentService_1.DocumentService.parseDocument(req.file);
            // Create document record
            const document = document_1.DocumentModel.create({
                filename: req.file.filename,
                originalName: req.file.originalname,
                mimeType: req.file.mimetype,
                size: req.file.size,
                content,
                metadata: {
                    wordCount: content.split(/\s+/).length,
                    language: 'en', // TODO: Implement language detection
                },
            });
            logger_1.logger.info('Document uploaded successfully', {
                documentId: document.id,
                filename: document.originalName,
            });
            res.status(201).json({
                documentId: document.id,
                filename: document.originalName,
                size: document.size,
            });
        }
        catch (error) {
            logger_1.logger.error('Document upload failed', { error: error.message });
            next(error);
        }
    }
    static async analyze(req, res, next) {
        try {
            const { id } = req.params;
            const document = document_1.DocumentModel.findById(id);
            if (!document) {
                return next((0, errorHandler_1.createError)('Document not found', 404, 'DOCUMENT_NOT_FOUND'));
            }
            logger_1.logger.info('Document analysis started', { documentId: id });
            // Update document status
            document_1.DocumentModel.update(id, { status: 'analyzing' });
            // Start analysis (async)
            const analysisId = await AnalysisService_1.AnalysisService.analyzeDocument(document);
            res.json({
                analysisId,
                status: 'processing',
                message: 'Analysis started',
            });
        }
        catch (error) {
            logger_1.logger.error('Document analysis failed', {
                documentId: req.params.id,
                error: error.message
            });
            next(error);
        }
    }
    static async getAnalysis(req, res, next) {
        try {
            const { id, analysisId } = req.params;
            const document = document_1.DocumentModel.findById(id);
            if (!document) {
                return next((0, errorHandler_1.createError)('Document not found', 404, 'DOCUMENT_NOT_FOUND'));
            }
            const issues = Issue_1.IssueModel.findByDocumentId(id);
            const suggestions = issues.map(issue => issue.suggestion);
            res.json({
                issues: Issue_1.IssueModel.sortBySeverity(issues),
                suggestions,
                status: document.status,
            });
        }
        catch (error) {
            logger_1.logger.error('Get analysis failed', {
                documentId: req.params.id,
                analysisId: req.params.analysisId,
                error: error.message
            });
            next(error);
        }
    }
    static async fix(req, res, next) {
        try {
            const { id } = req.params;
            const { selectedIssues, autoFix } = req.body;
            const document = document_1.DocumentModel.findById(id);
            if (!document) {
                return next((0, errorHandler_1.createError)('Document not found', 404, 'DOCUMENT_NOT_FOUND'));
            }
            logger_1.logger.info('Document fix started', {
                documentId: id,
                selectedIssues: selectedIssues.length,
                autoFix
            });
            // Update document status
            document_1.DocumentModel.update(id, { status: 'fixing' });
            const startTime = Date.now();
            // Apply fixes
            const fixedDocument = await DocumentService_1.DocumentService.applyFixes(document, selectedIssues, autoFix);
            const processingTime = Date.now() - startTime;
            // Generate fix summary
            const allIssues = Issue_1.IssueModel.findByDocumentId(id);
            const fixSummary = Issue_1.IssueModel.generateFixSummary(allIssues, selectedIssues);
            fixSummary.processingTime = processingTime;
            // Update document status
            document_1.DocumentModel.update(id, { status: 'fixed' });
            logger_1.logger.info('Document fix completed', {
                documentId: id,
                fixedIssues: fixSummary.fixedIssues,
                processingTime
            });
            res.json({
                fixedDocumentId: fixedDocument.id,
                fixSummary,
            });
        }
        catch (error) {
            logger_1.logger.error('Document fix failed', {
                documentId: req.params.id,
                error: error.message
            });
            // Reset document status on error
            document_1.DocumentModel.update(req.params.id, { status: 'analyzed' });
            next(error);
        }
    }
    static async download(req, res, next) {
        try {
            const { id } = req.params;
            const { format = 'fixed' } = req.query;
            const document = document_1.DocumentModel.findById(id);
            if (!document) {
                return next((0, errorHandler_1.createError)('Document not found', 404, 'DOCUMENT_NOT_FOUND'));
            }
            logger_1.logger.info('Document download started', {
                documentId: id,
                format
            });
            const fileBuffer = await DocumentService_1.DocumentService.generateDownload(document, format);
            const filename = `${document.originalName.replace(/\.[^/.]+$/, '')}_${format}.${DocumentService_1.DocumentService.getFileExtension(document.mimeType)}`;
            res.setHeader('Content-Type', document.mimeType);
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Length', fileBuffer.length);
            res.send(fileBuffer);
        }
        catch (error) {
            logger_1.logger.error('Document download failed', {
                documentId: req.params.id,
                error: error.message
            });
            next(error);
        }
    }
    static async getDocument(req, res, next) {
        try {
            const { id } = req.params;
            const document = document_1.DocumentModel.findById(id);
            if (!document) {
                return next((0, errorHandler_1.createError)('Document not found', 404, 'DOCUMENT_NOT_FOUND'));
            }
            res.json(document);
        }
        catch (error) {
            logger_1.logger.error('Get document failed', {
                documentId: req.params.id,
                error: error.message
            });
            next(error);
        }
    }
    static async listDocuments(req, res, next) {
        try {
            const { status, search } = req.query;
            let documents = document_1.DocumentModel.findAll();
            // Apply filters
            if (status) {
                documents = documents.filter(doc => doc.status === status);
            }
            if (search) {
                const searchTerm = search.toLowerCase();
                documents = documents.filter(doc => doc.originalName.toLowerCase().includes(searchTerm) ||
                    doc.filename.toLowerCase().includes(searchTerm));
            }
            // Sort by upload date (newest first)
            documents.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
            res.json({
                documents,
                total: documents.length,
            });
        }
        catch (error) {
            logger_1.logger.error('List documents failed', { error: error.message });
            next(error);
        }
    }
    static async deleteDocument(req, res, next) {
        try {
            const { id } = req.params;
            const document = document_1.DocumentModel.findById(id);
            if (!document) {
                return next((0, errorHandler_1.createError)('Document not found', 404, 'DOCUMENT_NOT_FOUND'));
            }
            // Delete associated issues
            Issue_1.IssueModel.deleteByDocumentId(id);
            // Delete document
            const deleted = document_1.DocumentModel.delete(id);
            if (deleted) {
                logger_1.logger.info('Document deleted', { documentId: id });
                res.status(204).send();
            }
            else {
                next((0, errorHandler_1.createError)('Failed to delete document', 500, 'DELETE_FAILED'));
            }
        }
        catch (error) {
            logger_1.logger.error('Delete document failed', {
                documentId: req.params.id,
                error: error.message
            });
            next(error);
        }
    }
}
exports.DocumentController = DocumentController;
//# sourceMappingURL=DocumentController.js.map