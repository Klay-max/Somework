import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';
import * as XLSX from 'xlsx';
import { Document, DocumentModel } from '../models/Document';
import { IssueModel } from '../models/Issue';
import { logger } from '../utils/logger';
import { createError } from '../middleware/errorHandler';

export class DocumentService {
  static async parseDocument(file: Express.Multer.File): Promise<string> {
    try {
      const filePath = file.path;
      const mimeType = file.mimetype;

      logger.info('Parsing document', { 
        filename: file.originalname, 
        mimeType,
        size: file.size 
      });

      let content: string;

      switch (mimeType) {
        case 'application/pdf':
          content = await this.parsePDF(filePath);
          break;
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          content = await this.parseWord(filePath);
          break;
        case 'application/vnd.ms-excel':
        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
          content = await this.parseExcel(filePath);
          break;
        case 'text/plain':
          content = await this.parseText(filePath);
          break;
        default:
          throw createError(`Unsupported file type: ${mimeType}`, 400, 'UNSUPPORTED_TYPE');
      }

      // Clean up temporary file
      this.cleanupFile(filePath);

      logger.info('Document parsed successfully', { 
        filename: file.originalname,
        contentLength: content.length 
      });

      return content;
    } catch (error) {
      logger.error('Document parsing failed', { 
        filename: file.originalname, 
        error: error.message 
      });
      
      // Clean up temporary file on error
      this.cleanupFile(file.path);
      throw error;
    }
  }

  private static async parsePDF(filePath: string): Promise<string> {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    } catch (error) {
      throw createError('Failed to parse PDF file', 400, 'PDF_PARSE_ERROR');
    }
  }

  private static async parseWord(filePath: string): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    } catch (error) {
      throw createError('Failed to parse Word document', 400, 'WORD_PARSE_ERROR');
    }
  }

  private static async parseExcel(filePath: string): Promise<string> {
    try {
      const workbook = XLSX.readFile(filePath);
      let content = '';

      workbook.SheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        const sheetData = XLSX.utils.sheet_to_csv(worksheet);
        content += `Sheet: ${sheetName}\n${sheetData}\n\n`;
      });

      return content;
    } catch (error) {
      throw createError('Failed to parse Excel file', 400, 'EXCEL_PARSE_ERROR');
    }
  }

  private static async parseText(filePath: string): Promise<string> {
    try {
      return fs.readFileSync(filePath, 'utf-8');
    } catch (error) {
      throw createError('Failed to parse text file', 400, 'TEXT_PARSE_ERROR');
    }
  }

  static async applyFixes(
    document: Document, 
    selectedIssueIds: string[], 
    autoFix: boolean
  ): Promise<Document> {
    try {
      logger.info('Applying fixes', { 
        documentId: document.id, 
        selectedIssues: selectedIssueIds.length,
        autoFix 
      });

      let fixedContent = document.content;
      const issues = IssueModel.findByDocumentId(document.id);
      const selectedIssues = issues.filter(issue => selectedIssueIds.includes(issue.id));

      // Sort issues by location (reverse order to maintain positions)
      const sortedIssues = selectedIssues.sort((a, b) => {
        if (a.location.range && b.location.range) {
          return b.location.range.start - a.location.range.start;
        }
        return 0;
      });

      let appliedFixes = 0;

      for (const issue of sortedIssues) {
        if (!issue.isAutoFixable && !autoFix) {
          continue;
        }

        if (issue.suggestion.requiresManualReview && !autoFix) {
          continue;
        }

        try {
          // Apply the fix
          if (issue.location.range) {
            const before = fixedContent.substring(0, issue.location.range.start);
            const after = fixedContent.substring(issue.location.range.end);
            fixedContent = before + issue.suggestion.suggestedText + after;
          } else {
            // Simple text replacement if no range is specified
            fixedContent = fixedContent.replace(issue.originalText, issue.suggestion.suggestedText);
          }

          appliedFixes++;
          logger.debug('Applied fix', { 
            issueId: issue.id, 
            type: issue.type,
            originalText: issue.originalText.substring(0, 50) + '...',
            suggestedText: issue.suggestion.suggestedText.substring(0, 50) + '...'
          });
        } catch (error) {
          logger.warn('Failed to apply fix', { 
            issueId: issue.id, 
            error: error.message 
          });
        }
      }

      // Create a new document with fixed content using DocumentModel.create
      const fixedDocument = DocumentModel.create({
        filename: `${document.filename}_fixed`,
        originalName: document.originalName,
        mimeType: document.mimeType,
        size: Buffer.from(fixedContent, 'utf-8').length,
        content: fixedContent,
        metadata: {
          ...document.metadata,
          wordCount: fixedContent.split(/\s+/).length,
          originalDocumentId: document.id, // Store reference to original document
        },
      });

      // Update status to 'fixed'
      DocumentModel.update(fixedDocument.id, { status: 'fixed' });

      logger.info('Fixes applied successfully', { 
        documentId: document.id,
        fixedDocumentId: fixedDocument.id,
        appliedFixes,
        totalSelected: selectedIssues.length 
      });

      return fixedDocument!;
    } catch (error) {
      logger.error('Failed to apply fixes', { 
        documentId: document.id, 
        error: error.message 
      });
      throw error;
    }
  }

  static async generateDownload(document: Document, format: string): Promise<Buffer> {
    try {
      logger.info('Generating download', { 
        documentId: document.id, 
        format 
      });

      let content: string;

      if (format === 'original') {
        // Find original document using metadata reference
        const originalId = (document.metadata as any).originalDocumentId;
        
        if (originalId) {
          const originalDoc = DocumentModel.findById(originalId);
          if (originalDoc) {
            content = originalDoc.content;
            logger.debug('Using original document content', { originalId });
          } else {
            // If original not found, use current document
            content = document.content;
            logger.warn('Original document not found, using current', { 
              documentId: document.id,
              originalId 
            });
          }
        } else {
          // If no original reference, this is the original
          content = document.content;
          logger.debug('No original reference found, using current document');
        }
      } else {
        content = document.content;
      }

      // Return as text buffer
      // TODO: Implement proper format conversion based on original file type
      const buffer = Buffer.from(content, 'utf-8');

      logger.info('Download generated successfully', { 
        documentId: document.id,
        format,
        size: buffer.length 
      });

      return buffer;
    } catch (error) {
      logger.error('Failed to generate download', { 
        documentId: document.id, 
        format,
        error: error.message 
      });
      throw error;
    }
  }

  static getFileExtension(mimeType: string): string {
    const extensions: Record<string, string> = {
      'application/pdf': 'pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'application/vnd.ms-excel': 'xls',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
      'text/plain': 'txt',
    };

    return extensions[mimeType] || 'txt';
  }

  private static cleanupFile(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        logger.debug('Temporary file cleaned up', { filePath });
      }
    } catch (error) {
      logger.warn('Failed to cleanup temporary file', { 
        filePath, 
        error: error.message 
      });
    }
  }

  static async cleanupOldFiles(): Promise<void> {
    try {
      const uploadDir = process.env.UPLOAD_DIR || './uploads';
      const tempDir = process.env.TEMP_DIR || './temp';

      const cleanupDir = async (dir: string, maxAge: number = 24 * 60 * 60 * 1000) => {
        if (!fs.existsSync(dir)) return;

        const files = fs.readdirSync(dir);
        const now = Date.now();

        for (const file of files) {
          const filePath = path.join(dir, file);
          const stats = fs.statSync(filePath);

          if (now - stats.mtime.getTime() > maxAge) {
            fs.unlinkSync(filePath);
            logger.debug('Old file cleaned up', { filePath });
          }
        }
      };

      await cleanupDir(uploadDir);
      await cleanupDir(tempDir);

      logger.info('Old files cleanup completed');
    } catch (error) {
      logger.error('Failed to cleanup old files', { error: error.message });
    }
  }

  static validateFileContent(content: string, mimeType: string): boolean {
    try {
      // Basic content validation
      if (!content || content.trim().length === 0) {
        return false;
      }

      // MIME type specific validation
      switch (mimeType) {
        case 'text/plain':
          // Text files should be readable
          return content.length > 0;
        
        case 'application/pdf':
          // PDF content should contain some text after parsing
          return content.length > 0;
        
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          // Word documents should have extractable text
          return content.length > 0;
        
        case 'application/vnd.ms-excel':
        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
          // Excel files should have some data
          return content.length > 0;
        
        default:
          return false;
      }
    } catch (error) {
      logger.warn('Content validation failed', { mimeType, error: error.message });
      return false;
    }
  }

  static extractMetadata(content: string, mimeType: string): { pageCount?: number; wordCount?: number; language?: string } {
    try {
      const metadata: { pageCount?: number; wordCount?: number; language?: string } = {};

      // Word count (universal)
      metadata.wordCount = content.split(/\s+/).filter(word => word.length > 0).length;

      // Language detection (simplified - defaults to English)
      metadata.language = 'en';

      // Page count estimation
      switch (mimeType) {
        case 'text/plain':
          // Estimate pages based on character count (assuming ~2000 chars per page)
          metadata.pageCount = Math.max(1, Math.ceil(content.length / 2000));
          break;
        
        case 'application/pdf':
          // For PDF, we'd need to extract page info during parsing
          // For now, estimate based on content length
          metadata.pageCount = Math.max(1, Math.ceil(content.length / 3000));
          break;
        
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          // Word documents - estimate based on content
          metadata.pageCount = Math.max(1, Math.ceil(content.length / 2500));
          break;
        
        case 'application/vnd.ms-excel':
        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
          // Excel files - count sheets (simplified)
          const sheetMatches = content.match(/Sheet:/g);
          metadata.pageCount = sheetMatches ? sheetMatches.length : 1;
          break;
      }

      return metadata;
    } catch (error) {
      logger.warn('Metadata extraction failed', { mimeType, error: error.message });
      return { wordCount: 0, language: 'en', pageCount: 1 };
    }
  }

  static async validateParsedContent(content: string, originalFile: Express.Multer.File): Promise<boolean> {
    try {
      // Check if content was successfully extracted
      if (!content || content.trim().length === 0) {
        logger.warn('No content extracted from file', { 
          filename: originalFile.originalname,
          mimeType: originalFile.mimetype 
        });
        return false;
      }

      // Check content length is reasonable
      const minContentLength = 1;
      const maxContentLength = 10 * 1024 * 1024; // 10MB of text
      
      if (content.length < minContentLength || content.length > maxContentLength) {
        logger.warn('Content length out of bounds', { 
          filename: originalFile.originalname,
          contentLength: content.length 
        });
        return false;
      }

      // Check for suspicious content patterns
      const suspiciousPatterns = [
        /\x00/g, // Null bytes
        /[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, // Control characters
      ];

      for (const pattern of suspiciousPatterns) {
        if (pattern.test(content)) {
          logger.warn('Suspicious content pattern detected', { 
            filename: originalFile.originalname,
            pattern: pattern.source 
          });
          // Don't reject, but log warning
        }
      }

      return true;
    } catch (error) {
      logger.error('Content validation failed', { 
        filename: originalFile.originalname,
        error: error.message 
      });
      return false;
    }
  }
}