import { Request, Response, NextFunction } from 'express';
import { DocumentModel } from '../models/Document';
import { IssueModel } from '../models/Issue';
import { DocumentService } from '../services/DocumentService';
import { AnalysisService } from '../services/AnalysisService';
import { createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class DocumentController {
  static async upload(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return next(createError('No file uploaded', 400, 'NO_FILE'));
      }

      logger.info('File upload started', {
        filename: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
      });

      // Parse document content
      const content = await DocumentService.parseDocument(req.file);
      
      // Create document record
      const document = DocumentModel.create({
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

      logger.info('Document uploaded successfully', {
        documentId: document.id,
        filename: document.originalName,
      });

      res.status(201).json({
        documentId: document.id,
        filename: document.originalName,
        size: document.size,
      });
    } catch (error: any) {
      logger.error('Document upload failed', { error: error.message });
      next(error);
    }
  }

  static async analyze(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      const document = DocumentModel.findById(id);
      if (!document) {
        return next(createError('Document not found', 404, 'DOCUMENT_NOT_FOUND'));
      }

      logger.info('Document analysis started', { documentId: id });

      // Update document status
      DocumentModel.update(id, { status: 'analyzing' });

      // Start analysis (async)
      const analysisId = await AnalysisService.analyzeDocument(document);

      res.json({
        analysisId,
        status: 'processing',
        message: 'Analysis started',
      });
    } catch (error) {
      logger.error('Document analysis failed', { 
        documentId: req.params.id, 
        error: error.message 
      });
      next(error);
    }
  }

  static async getAnalysis(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, analysisId } = req.params;
      
      const document = DocumentModel.findById(id);
      if (!document) {
        return next(createError('Document not found', 404, 'DOCUMENT_NOT_FOUND'));
      }

      const issues = IssueModel.findByDocumentId(id);
      const suggestions = issues.map(issue => issue.suggestion);

      res.json({
        issues: IssueModel.sortBySeverity(issues),
        suggestions,
        status: document.status,
      });
    } catch (error) {
      logger.error('Get analysis failed', { 
        documentId: req.params.id, 
        analysisId: req.params.analysisId,
        error: error.message 
      });
      next(error);
    }
  }

  static async fix(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { selectedIssues, autoFix } = req.body;
      
      const document = DocumentModel.findById(id);
      if (!document) {
        return next(createError('Document not found', 404, 'DOCUMENT_NOT_FOUND'));
      }

      logger.info('Document fix started', { 
        documentId: id, 
        selectedIssues: selectedIssues.length,
        autoFix 
      });

      // Update document status
      DocumentModel.update(id, { status: 'fixing' });

      const startTime = Date.now();
      
      // Apply fixes
      const fixedDocument = await DocumentService.applyFixes(document, selectedIssues, autoFix);
      
      const processingTime = Date.now() - startTime;

      // Generate fix summary
      const allIssues = IssueModel.findByDocumentId(id);
      const fixSummary = IssueModel.generateFixSummary(allIssues, selectedIssues);
      fixSummary.processingTime = processingTime;

      // Update document status
      DocumentModel.update(id, { status: 'fixed' });

      logger.info('Document fix completed', { 
        documentId: id, 
        fixedIssues: fixSummary.fixedIssues,
        processingTime 
      });

      res.json({
        fixedDocumentId: fixedDocument.id,
        fixSummary,
      });
    } catch (error) {
      logger.error('Document fix failed', { 
        documentId: req.params.id, 
        error: error.message 
      });
      
      // Reset document status on error
      DocumentModel.update(req.params.id, { status: 'analyzed' });
      next(error);
    }
  }

  static async download(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { format = 'fixed' } = req.query;
      
      const document = DocumentModel.findById(id);
      if (!document) {
        return next(createError('Document not found', 404, 'DOCUMENT_NOT_FOUND'));
      }

      logger.info('Document download started', { 
        documentId: id, 
        format 
      });

      const fileBuffer = await DocumentService.generateDownload(document, format as string);
      
      // Generate a clean filename
      const baseFilename = document.originalName.replace(/\.[^/.]+$/, '');
      const extension = DocumentService.getFileExtension(document.mimeType);
      
      // Use different naming based on format
      let filename: string;
      if (format === 'original') {
        filename = document.originalName;
      } else {
        // For fixed documents, add a suffix to indicate it's been fixed
        filename = `${baseFilename}_已修复.${extension}`;
      }
      
      // Encode filename for proper Chinese character support
      const encodedFilename = encodeURIComponent(filename);

      res.setHeader('Content-Type', document.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedFilename}`);
      res.setHeader('Content-Length', fileBuffer.length);

      res.send(fileBuffer);
    } catch (error) {
      logger.error('Document download failed', { 
        documentId: req.params.id, 
        error: error.message 
      });
      next(error);
    }
  }

  static async getDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      const document = DocumentModel.findById(id);
      if (!document) {
        return next(createError('Document not found', 404, 'DOCUMENT_NOT_FOUND'));
      }

      res.json(document);
    } catch (error) {
      logger.error('Get document failed', { 
        documentId: req.params.id, 
        error: error.message 
      });
      next(error);
    }
  }

  static async listDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, search } = req.query;
      
      let documents = DocumentModel.findAll();

      // Apply filters
      if (status) {
        documents = documents.filter(doc => doc.status === status);
      }

      if (search) {
        const searchTerm = (search as string).toLowerCase();
        documents = documents.filter(doc => 
          doc.originalName.toLowerCase().includes(searchTerm) ||
          doc.filename.toLowerCase().includes(searchTerm)
        );
      }

      // Sort by upload date (newest first)
      documents.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());

      res.json({
        documents,
        total: documents.length,
      });
    } catch (error) {
      logger.error('List documents failed', { error: error.message });
      next(error);
    }
  }

  static async deleteDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      const document = DocumentModel.findById(id);
      if (!document) {
        return next(createError('Document not found', 404, 'DOCUMENT_NOT_FOUND'));
      }

      // Delete associated issues
      IssueModel.deleteByDocumentId(id);
      
      // Delete document
      const deleted = DocumentModel.delete(id);
      
      if (deleted) {
        logger.info('Document deleted', { documentId: id });
        res.status(204).send();
      } else {
        next(createError('Failed to delete document', 500, 'DELETE_FAILED'));
      }
    } catch (error) {
      logger.error('Delete document failed', { 
        documentId: req.params.id, 
        error: error.message 
      });
      next(error);
    }
  }
}