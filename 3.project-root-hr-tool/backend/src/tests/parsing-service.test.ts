import { DocumentService } from '../services/DocumentService';
import fs from 'fs';
import path from 'path';

// Mock external dependencies
jest.mock('fs');
jest.mock('mammoth');
jest.mock('pdf-parse');
jest.mock('xlsx');

const mockFs = fs as jest.Mocked<typeof fs>;

describe('Document Parsing Service Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Text File Parsing', () => {
    test('should parse plain text files correctly', async () => {
      const mockContent = 'This is a test document with some content.';
      mockFs.readFileSync.mockReturnValue(mockContent);

      const mockFile = {
        path: '/tmp/test.txt',
        originalname: 'test.txt',
        mimetype: 'text/plain',
        size: mockContent.length
      } as Express.Multer.File;

      const result = await DocumentService.parseDocument(mockFile);

      expect(result).toBe(mockContent);
      expect(mockFs.readFileSync).toHaveBeenCalledWith('/tmp/test.txt', 'utf-8');
    });

    test('should handle empty text files', async () => {
      mockFs.readFileSync.mockReturnValue('');

      const mockFile = {
        path: '/tmp/empty.txt',
        originalname: 'empty.txt',
        mimetype: 'text/plain',
        size: 0
      } as Express.Multer.File;

      const result = await DocumentService.parseDocument(mockFile);

      expect(result).toBe('');
    });

    test('should handle text files with special characters', async () => {
      const mockContent = 'Test with special chars: àáâãäå ñ ç 中文 🚀';
      mockFs.readFileSync.mockReturnValue(mockContent);

      const mockFile = {
        path: '/tmp/special.txt',
        originalname: 'special.txt',
        mimetype: 'text/plain',
        size: mockContent.length
      } as Express.Multer.File;

      const result = await DocumentService.parseDocument(mockFile);

      expect(result).toBe(mockContent);
    });
  });

  describe('PDF File Parsing', () => {
    test('should parse PDF files correctly', async () => {
      const mockPdfContent = 'This is content extracted from PDF.';
      const mockPdfParse = require('pdf-parse');
      mockPdfParse.mockResolvedValue({ text: mockPdfContent });
      mockFs.readFileSync.mockReturnValue(Buffer.from('mock pdf data'));

      const mockFile = {
        path: '/tmp/test.pdf',
        originalname: 'test.pdf',
        mimetype: 'application/pdf',
        size: 1024
      } as Express.Multer.File;

      const result = await DocumentService.parseDocument(mockFile);

      expect(result).toBe(mockPdfContent);
      expect(mockPdfParse).toHaveBeenCalledWith(expect.any(Buffer));
    });

    test('should handle PDF parsing errors', async () => {
      const mockPdfParse = require('pdf-parse');
      mockPdfParse.mockRejectedValue(new Error('PDF parsing failed'));
      mockFs.readFileSync.mockReturnValue(Buffer.from('mock pdf data'));

      const mockFile = {
        path: '/tmp/corrupt.pdf',
        originalname: 'corrupt.pdf',
        mimetype: 'application/pdf',
        size: 1024
      } as Express.Multer.File;

      await expect(DocumentService.parseDocument(mockFile)).rejects.toThrow();
    });
  });

  describe('Word Document Parsing', () => {
    test('should parse Word documents correctly', async () => {
      const mockWordContent = 'This is content from Word document.';
      const mockMammoth = require('mammoth');
      mockMammoth.extractRawText.mockResolvedValue({ value: mockWordContent });

      const mockFile = {
        path: '/tmp/test.docx',
        originalname: 'test.docx',
        mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size: 2048
      } as Express.Multer.File;

      const result = await DocumentService.parseDocument(mockFile);

      expect(result).toBe(mockWordContent);
      expect(mockMammoth.extractRawText).toHaveBeenCalledWith({ path: '/tmp/test.docx' });
    });

    test('should handle Word document parsing errors', async () => {
      const mockMammoth = require('mammoth');
      mockMammoth.extractRawText.mockRejectedValue(new Error('Word parsing failed'));

      const mockFile = {
        path: '/tmp/corrupt.docx',
        originalname: 'corrupt.docx',
        mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size: 2048
      } as Express.Multer.File;

      await expect(DocumentService.parseDocument(mockFile)).rejects.toThrow();
    });
  });

  describe('Excel File Parsing', () => {
    test('should parse Excel files correctly', async () => {
      const mockXLSX = require('xlsx');
      const mockWorkbook = {
        SheetNames: ['Sheet1', 'Sheet2'],
        Sheets: {
          Sheet1: {},
          Sheet2: {}
        }
      };
      mockXLSX.readFile.mockReturnValue(mockWorkbook);
      mockXLSX.utils.sheet_to_csv.mockReturnValue('col1,col2\nval1,val2');

      const mockFile = {
        path: '/tmp/test.xlsx',
        originalname: 'test.xlsx',
        mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        size: 3072
      } as Express.Multer.File;

      const result = await DocumentService.parseDocument(mockFile);

      expect(result).toContain('Sheet: Sheet1');
      expect(result).toContain('Sheet: Sheet2');
      expect(result).toContain('col1,col2');
      expect(mockXLSX.readFile).toHaveBeenCalledWith('/tmp/test.xlsx');
    });

    test('should handle Excel parsing errors', async () => {
      const mockXLSX = require('xlsx');
      mockXLSX.readFile.mockImplementation(() => {
        throw new Error('Excel parsing failed');
      });

      const mockFile = {
        path: '/tmp/corrupt.xlsx',
        originalname: 'corrupt.xlsx',
        mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        size: 3072
      } as Express.Multer.File;

      await expect(DocumentService.parseDocument(mockFile)).rejects.toThrow();
    });
  });

  describe('File Cleanup', () => {
    test('should cleanup temporary files after successful parsing', async () => {
      const mockContent = 'Test content';
      mockFs.readFileSync.mockReturnValue(mockContent);
      mockFs.existsSync.mockReturnValue(true);

      const mockFile = {
        path: '/tmp/test.txt',
        originalname: 'test.txt',
        mimetype: 'text/plain',
        size: mockContent.length
      } as Express.Multer.File;

      await DocumentService.parseDocument(mockFile);

      expect(mockFs.unlinkSync).toHaveBeenCalledWith('/tmp/test.txt');
    });

    test('should cleanup temporary files after parsing errors', async () => {
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('File read error');
      });
      mockFs.existsSync.mockReturnValue(true);

      const mockFile = {
        path: '/tmp/error.txt',
        originalname: 'error.txt',
        mimetype: 'text/plain',
        size: 100
      } as Express.Multer.File;

      await expect(DocumentService.parseDocument(mockFile)).rejects.toThrow();
      expect(mockFs.unlinkSync).toHaveBeenCalledWith('/tmp/error.txt');
    });

    test('should handle cleanup errors gracefully', async () => {
      const mockContent = 'Test content';
      mockFs.readFileSync.mockReturnValue(mockContent);
      mockFs.existsSync.mockReturnValue(true);
      mockFs.unlinkSync.mockImplementation(() => {
        throw new Error('Cleanup failed');
      });

      const mockFile = {
        path: '/tmp/test.txt',
        originalname: 'test.txt',
        mimetype: 'text/plain',
        size: mockContent.length
      } as Express.Multer.File;

      // Should not throw error even if cleanup fails
      const result = await DocumentService.parseDocument(mockFile);
      expect(result).toBe(mockContent);
    });
  });

  describe('Content Validation', () => {
    test('should validate text content correctly', () => {
      expect(DocumentService.validateFileContent('Valid content', 'text/plain')).toBe(true);
      expect(DocumentService.validateFileContent('', 'text/plain')).toBe(false);
      expect(DocumentService.validateFileContent('   ', 'text/plain')).toBe(false);
    });

    test('should validate PDF content correctly', () => {
      expect(DocumentService.validateFileContent('PDF content', 'application/pdf')).toBe(true);
      expect(DocumentService.validateFileContent('', 'application/pdf')).toBe(false);
    });

    test('should reject unsupported MIME types', () => {
      expect(DocumentService.validateFileContent('Content', 'image/jpeg')).toBe(false);
      expect(DocumentService.validateFileContent('Content', 'video/mp4')).toBe(false);
    });
  });

  describe('Metadata Extraction', () => {
    test('should extract metadata from text content', () => {
      const content = 'This is a test document with multiple words and sentences.';
      const metadata = DocumentService.extractMetadata(content, 'text/plain');

      expect(metadata.wordCount).toBe(10);
      expect(metadata.language).toBe('en');
      expect(metadata.pageCount).toBeGreaterThan(0);
    });

    test('should handle empty content metadata', () => {
      const metadata = DocumentService.extractMetadata('', 'text/plain');

      expect(metadata.wordCount).toBe(0);
      expect(metadata.language).toBe('en');
      expect(metadata.pageCount).toBe(1);
    });

    test('should estimate page count for different file types', () => {
      const longContent = 'word '.repeat(1000); // 1000 words

      const textMeta = DocumentService.extractMetadata(longContent, 'text/plain');
      const pdfMeta = DocumentService.extractMetadata(longContent, 'application/pdf');
      const wordMeta = DocumentService.extractMetadata(longContent, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');

      expect(textMeta.pageCount).toBeGreaterThan(1);
      expect(pdfMeta.pageCount).toBeGreaterThan(1);
      expect(wordMeta.pageCount).toBeGreaterThan(1);
    });

    test('should count Excel sheets correctly', () => {
      const excelContent = 'Sheet: Sheet1\ndata1\n\nSheet: Sheet2\ndata2\n\nSheet: Sheet3\ndata3';
      const metadata = DocumentService.extractMetadata(excelContent, 'application/vnd.ms-excel');

      expect(metadata.pageCount).toBe(3);
    });
  });

  describe('Content Validation', () => {
    test('should validate parsed content successfully', async () => {
      const content = 'This is valid document content.';
      const mockFile = {
        originalname: 'test.txt',
        mimetype: 'text/plain',
        size: content.length
      } as Express.Multer.File;

      const isValid = await DocumentService.validateParsedContent(content, mockFile);
      expect(isValid).toBe(true);
    });

    test('should reject empty content', async () => {
      const mockFile = {
        originalname: 'empty.txt',
        mimetype: 'text/plain',
        size: 0
      } as Express.Multer.File;

      const isValid = await DocumentService.validateParsedContent('', mockFile);
      expect(isValid).toBe(false);
    });

    test('should reject content that is too large', async () => {
      const largeContent = 'x'.repeat(20 * 1024 * 1024); // 20MB
      const mockFile = {
        originalname: 'large.txt',
        mimetype: 'text/plain',
        size: largeContent.length
      } as Express.Multer.File;

      const isValid = await DocumentService.validateParsedContent(largeContent, mockFile);
      expect(isValid).toBe(false);
    });

    test('should handle content with control characters', async () => {
      const contentWithControlChars = 'Normal text\x00with null byte';
      const mockFile = {
        originalname: 'suspicious.txt',
        mimetype: 'text/plain',
        size: contentWithControlChars.length
      } as Express.Multer.File;

      // Should still validate but log warning
      const isValid = await DocumentService.validateParsedContent(contentWithControlChars, mockFile);
      expect(isValid).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should handle unsupported file types', async () => {
      const mockFile = {
        path: '/tmp/test.unknown',
        originalname: 'test.unknown',
        mimetype: 'application/unknown',
        size: 1024
      } as Express.Multer.File;

      await expect(DocumentService.parseDocument(mockFile)).rejects.toThrow('Unsupported file type');
    });

    test('should handle file system errors', async () => {
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('File system error');
      });

      const mockFile = {
        path: '/tmp/error.txt',
        originalname: 'error.txt',
        mimetype: 'text/plain',
        size: 100
      } as Express.Multer.File;

      await expect(DocumentService.parseDocument(mockFile)).rejects.toThrow();
    });
  });
});
