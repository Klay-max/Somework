"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const mammoth_1 = __importDefault(require("mammoth"));
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const XLSX = __importStar(require("xlsx"));
const Issue_1 = require("../models/Issue");
const logger_1 = require("../utils/logger");
const errorHandler_1 = require("../middleware/errorHandler");
class DocumentService {
    static async parseDocument(file) {
        try {
            const filePath = file.path;
            const mimeType = file.mimetype;
            logger_1.logger.info('Parsing document', {
                filename: file.originalname,
                mimeType,
                size: file.size
            });
            let content;
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
                    throw (0, errorHandler_1.createError)(`Unsupported file type: ${mimeType}`, 400, 'UNSUPPORTED_TYPE');
            }
            // Clean up temporary file
            this.cleanupFile(filePath);
            logger_1.logger.info('Document parsed successfully', {
                filename: file.originalname,
                contentLength: content.length
            });
            return content;
        }
        catch (error) {
            logger_1.logger.error('Document parsing failed', {
                filename: file.originalname,
                error: error.message
            });
            // Clean up temporary file on error
            this.cleanupFile(file.path);
            throw error;
        }
    }
    static async parsePDF(filePath) {
        try {
            const dataBuffer = fs_1.default.readFileSync(filePath);
            const data = await (0, pdf_parse_1.default)(dataBuffer);
            return data.text;
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to parse PDF file', 400, 'PDF_PARSE_ERROR');
        }
    }
    static async parseWord(filePath) {
        try {
            const result = await mammoth_1.default.extractRawText({ path: filePath });
            return result.value;
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to parse Word document', 400, 'WORD_PARSE_ERROR');
        }
    }
    static async parseExcel(filePath) {
        try {
            const workbook = XLSX.readFile(filePath);
            let content = '';
            workbook.SheetNames.forEach(sheetName => {
                const worksheet = workbook.Sheets[sheetName];
                const sheetData = XLSX.utils.sheet_to_csv(worksheet);
                content += `Sheet: ${sheetName}\n${sheetData}\n\n`;
            });
            return content;
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to parse Excel file', 400, 'EXCEL_PARSE_ERROR');
        }
    }
    static async parseText(filePath) {
        try {
            return fs_1.default.readFileSync(filePath, 'utf-8');
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to parse text file', 400, 'TEXT_PARSE_ERROR');
        }
    }
    static async applyFixes(document, selectedIssueIds, autoFix) {
        try {
            logger_1.logger.info('Applying fixes', {
                documentId: document.id,
                selectedIssues: selectedIssueIds.length,
                autoFix
            });
            let fixedContent = document.content;
            const issues = Issue_1.IssueModel.findByDocumentId(document.id);
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
                    }
                    else {
                        // Simple text replacement if no range is specified
                        fixedContent = fixedContent.replace(issue.originalText, issue.suggestion.suggestedText);
                    }
                    appliedFixes++;
                    logger_1.logger.debug('Applied fix', {
                        issueId: issue.id,
                        type: issue.type,
                        originalText: issue.originalText.substring(0, 50) + '...',
                        suggestedText: issue.suggestion.suggestedText.substring(0, 50) + '...'
                    });
                }
                catch (error) {
                    logger_1.logger.warn('Failed to apply fix', {
                        issueId: issue.id,
                        error: error.message
                    });
                }
            }
            // Create a new document with fixed content
            const fixedDocument = {
                ...document,
                id: `${document.id}_fixed`,
                content: fixedContent,
                status: 'fixed',
                metadata: {
                    ...document.metadata,
                    wordCount: fixedContent.split(/\s+/).length,
                },
            };
            logger_1.logger.info('Fixes applied successfully', {
                documentId: document.id,
                appliedFixes,
                totalSelected: selectedIssues.length
            });
            return fixedDocument;
        }
        catch (error) {
            logger_1.logger.error('Failed to apply fixes', {
                documentId: document.id,
                error: error.message
            });
            throw error;
        }
    }
    static async generateDownload(document, format) {
        try {
            logger_1.logger.info('Generating download', {
                documentId: document.id,
                format
            });
            let content;
            if (format === 'original') {
                // Find original document
                const originalId = document.id.replace('_fixed', '');
                const originalDoc = document.id === originalId ? document :
                    { ...document, content: document.content }; // Simplified for now
                content = originalDoc.content;
            }
            else {
                content = document.content;
            }
            // For now, return as text buffer
            // TODO: Implement proper format conversion based on original file type
            const buffer = Buffer.from(content, 'utf-8');
            logger_1.logger.info('Download generated successfully', {
                documentId: document.id,
                format,
                size: buffer.length
            });
            return buffer;
        }
        catch (error) {
            logger_1.logger.error('Failed to generate download', {
                documentId: document.id,
                format,
                error: error.message
            });
            throw error;
        }
    }
    static getFileExtension(mimeType) {
        const extensions = {
            'application/pdf': 'pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
            'application/vnd.ms-excel': 'xls',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
            'text/plain': 'txt',
        };
        return extensions[mimeType] || 'txt';
    }
    static cleanupFile(filePath) {
        try {
            if (fs_1.default.existsSync(filePath)) {
                fs_1.default.unlinkSync(filePath);
                logger_1.logger.debug('Temporary file cleaned up', { filePath });
            }
        }
        catch (error) {
            logger_1.logger.warn('Failed to cleanup temporary file', {
                filePath,
                error: error.message
            });
        }
    }
    static async cleanupOldFiles() {
        try {
            const uploadDir = process.env.UPLOAD_DIR || './uploads';
            const tempDir = process.env.TEMP_DIR || './temp';
            const cleanupDir = async (dir, maxAge = 24 * 60 * 60 * 1000) => {
                if (!fs_1.default.existsSync(dir))
                    return;
                const files = fs_1.default.readdirSync(dir);
                const now = Date.now();
                for (const file of files) {
                    const filePath = path_1.default.join(dir, file);
                    const stats = fs_1.default.statSync(filePath);
                    if (now - stats.mtime.getTime() > maxAge) {
                        fs_1.default.unlinkSync(filePath);
                        logger_1.logger.debug('Old file cleaned up', { filePath });
                    }
                }
            };
            await cleanupDir(uploadDir);
            await cleanupDir(tempDir);
            logger_1.logger.info('Old files cleanup completed');
        }
        catch (error) {
            logger_1.logger.error('Failed to cleanup old files', { error: error.message });
        }
    }
    static validateFileContent(content, mimeType) {
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
        }
        catch (error) {
            logger_1.logger.warn('Content validation failed', { mimeType, error: error.message });
            return false;
        }
    }
    static extractMetadata(content, mimeType) {
        try {
            const metadata = {};
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
        }
        catch (error) {
            logger_1.logger.warn('Metadata extraction failed', { mimeType, error: error.message });
            return { wordCount: 0, language: 'en', pageCount: 1 };
        }
    }
    static async validateParsedContent(content, originalFile) {
        try {
            // Check if content was successfully extracted
            if (!content || content.trim().length === 0) {
                logger_1.logger.warn('No content extracted from file', {
                    filename: originalFile.originalname,
                    mimeType: originalFile.mimetype
                });
                return false;
            }
            // Check content length is reasonable
            const minContentLength = 1;
            const maxContentLength = 10 * 1024 * 1024; // 10MB of text
            if (content.length < minContentLength || content.length > maxContentLength) {
                logger_1.logger.warn('Content length out of bounds', {
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
                    logger_1.logger.warn('Suspicious content pattern detected', {
                        filename: originalFile.originalname,
                        pattern: pattern.source
                    });
                    // Don't reject, but log warning
                }
            }
            return true;
        }
        catch (error) {
            logger_1.logger.error('Content validation failed', {
                filename: originalFile.originalname,
                error: error.message
            });
            return false;
        }
    }
}
exports.DocumentService = DocumentService;
//# sourceMappingURL=DocumentService.js.map