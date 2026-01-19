import { AnalysisService } from '../services/AnalysisService';
import { DocumentModel } from '../models/Document';
import { IssueModel } from '../models/Issue';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;

describe('Analysis Service Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    DocumentModel.clear();
    IssueModel.clear();
    
    // Setup axios mock
    mockAxios.create.mockReturnValue({
      post: jest.fn(),
      get: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    } as any);
  });

  describe('API Client Configuration', () => {
    test('should create axios client with correct configuration', () => {
      // The client is created when the class is loaded
      expect(mockAxios.create).toHaveBeenCalledWith({
        baseURL: expect.any(String),
        timeout: 30000,
        headers: {
          'Authorization': expect.stringContaining('Bearer'),
          'Content-Type': 'application/json',
        },
      });
    });
  });

  describe('Document Analysis', () => {
    test('should start document analysis successfully', async () => {
      const mockDocument = DocumentModel.create({
        filename: 'test.txt',
        originalName: 'test.txt',
        mimeType: 'text/plain',
        size: 100,
        content: 'Test document content for analysis.',
      });

      const analysisId = await AnalysisService.analyzeDocument(mockDocument);

      expect(analysisId).toBeDefined();
      expect(typeof analysisId).toBe('string');
      expect(analysisId).toMatch(/^analysis_\d+_[a-z0-9]+$/);
    });

    test('should handle document analysis errors', async () => {
      const mockDocument = DocumentModel.create({
        filename: 'test.txt',
        originalName: 'test.txt',
        mimeType: 'text/plain',
        size: 100,
        content: 'Test document content.',
      });

      // Mock API failure
      const mockClient = {
        post: jest.fn().mockRejectedValue(new Error('API Error')),
      };
      mockAxios.create.mockReturnValue(mockClient as any);

      // Should not throw immediately (async processing)
      const analysisId = await AnalysisService.analyzeDocument(mockDocument);
      expect(analysisId).toBeDefined();
    });
  });

  describe('API Request Formatting', () => {
    test('should format API requests correctly', async () => {
      const mockClient = {
        post: jest.fn().mockResolvedValue({
          data: {
            choices: [{
              message: {
                content: JSON.stringify({
                  issues: [{
                    type: 'grammar',
                    severity: 'medium',
                    title: 'Test Issue',
                    description: 'Test description',
                    originalText: 'test',
                    suggestedFix: 'Test',
                    confidence: 0.9
                  }]
                })
              }
            }]
          }
        }),
      };
      mockAxios.create.mockReturnValue(mockClient as any);

      const mockDocument = DocumentModel.create({
        filename: 'test.txt',
        originalName: 'test.txt',
        mimeType: 'text/plain',
        size: 100,
        content: 'Test document content for API formatting test.',
      });

      await AnalysisService.analyzeDocument(mockDocument);

      // Wait for async processing
      await new Promise(resolve => setTimeout(resolve, 200));

      expect(mockClient.post).toHaveBeenCalledWith('/chat/completions', {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: expect.stringContaining('expert HR document analyzer')
          },
          {
            role: 'user',
            content: expect.stringContaining('Test document content')
          }
        ],
        temperature: 0.1,
        max_tokens: 2000,
        stream: false,
      });
    });
  });

  describe('Response Parsing', () => {
    test('should parse valid API responses correctly', async () => {
      const mockApiResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              issues: [{
                type: 'grammar',
                severity: 'medium',
                title: 'Spelling Error',
                description: 'Potential spelling mistake',
                location: { line: 1, column: 5 },
                originalText: 'teh',
                suggestedFix: 'the',
                confidence: 0.95,
                explanation: 'Correct spelling'
              }]
            })
          }
        }]
      };

      const mockClient = {
        post: jest.fn().mockResolvedValue({ data: mockApiResponse }),
      };
      mockAxios.create.mockReturnValue(mockClient as any);

      const mockDocument = DocumentModel.create({
        filename: 'test.txt',
        originalName: 'test.txt',
        mimeType: 'text/plain',
        size: 100,
        content: 'Test document with teh error.',
      });

      await AnalysisService.analyzeDocument(mockDocument);

      // Wait for async processing
      await new Promise(resolve => setTimeout(resolve, 200));

      const issues = IssueModel.findByDocumentId(mockDocument.id);
      expect(issues.length).toBeGreaterThan(0);
      
      const issue = issues[0];
      expect(issue.type).toBe('grammar');
      expect(issue.severity).toBe('medium');
      expect(issue.title).toBe('Spelling Error');
      expect(issue.originalText).toBe('teh');
      expect(issue.suggestion.suggestedText).toBe('the');
    });

    test('should handle malformed API responses', async () => {
      const mockClient = {
        post: jest.fn().mockResolvedValue({
          data: {
            choices: [{
              message: {
                content: 'Invalid JSON response'
              }
            }]
          }
        }),
      };
      mockAxios.create.mockReturnValue(mockClient as any);

      const mockDocument = DocumentModel.create({
        filename: 'test.txt',
        originalName: 'test.txt',
        mimeType: 'text/plain',
        size: 100,
        content: 'Test document content.',
      });

      await AnalysisService.analyzeDocument(mockDocument);

      // Wait for async processing
      await new Promise(resolve => setTimeout(resolve, 200));

      // Should create mock issues when parsing fails
      const issues = IssueModel.findByDocumentId(mockDocument.id);
      expect(issues.length).toBeGreaterThan(0);
    });

    test('should handle empty API responses', async () => {
      const mockClient = {
        post: jest.fn().mockResolvedValue({
          data: {
            choices: [{
              message: {
                content: ''
              }
            }]
          }
        }),
      };
      mockAxios.create.mockReturnValue(mockClient as any);

      const mockDocument = DocumentModel.create({
        filename: 'test.txt',
        originalName: 'test.txt',
        mimeType: 'text/plain',
        size: 100,
        content: 'Test document content.',
      });

      await AnalysisService.analyzeDocument(mockDocument);

      // Wait for async processing
      await new Promise(resolve => setTimeout(resolve, 200));

      // Should handle empty responses gracefully
      const issues = IssueModel.findByDocumentId(mockDocument.id);
      expect(issues).toBeDefined();
    });
  });

  describe('Error Handling and Retry Logic', () => {
    test('should retry on rate limit errors', async () => {
      const mockClient = {
        post: jest.fn()
          .mockRejectedValueOnce({ response: { status: 429 } })
          .mockResolvedValueOnce({
            data: {
              choices: [{
                message: {
                  content: JSON.stringify({ issues: [] })
                }
              }]
            }
          }),
      };
      mockAxios.create.mockReturnValue(mockClient as any);

      const mockDocument = DocumentModel.create({
        filename: 'test.txt',
        originalName: 'test.txt',
        mimeType: 'text/plain',
        size: 100,
        content: 'Test document content.',
      });

      await AnalysisService.analyzeDocument(mockDocument);

      // Wait for async processing and retries
      await new Promise(resolve => setTimeout(resolve, 500));

      expect(mockClient.post).toHaveBeenCalledTimes(2);
    });

    test('should retry on network errors', async () => {
      const mockClient = {
        post: jest.fn()
          .mockRejectedValueOnce({ code: 'ECONNRESET' })
          .mockResolvedValueOnce({
            data: {
              choices: [{
                message: {
                  content: JSON.stringify({ issues: [] })
                }
              }]
            }
          }),
      };
      mockAxios.create.mockReturnValue(mockClient as any);

      const mockDocument = DocumentModel.create({
        filename: 'test.txt',
        originalName: 'test.txt',
        mimeType: 'text/plain',
        size: 100,
        content: 'Test document content.',
      });

      await AnalysisService.analyzeDocument(mockDocument);

      // Wait for async processing and retries
      await new Promise(resolve => setTimeout(resolve, 500));

      expect(mockClient.post).toHaveBeenCalledTimes(2);
    });

    test('should stop retrying after max attempts', async () => {
      const mockClient = {
        post: jest.fn().mockRejectedValue({ response: { status: 500 } }),
      };
      mockAxios.create.mockReturnValue(mockClient as any);

      const mockDocument = DocumentModel.create({
        filename: 'test.txt',
        originalName: 'test.txt',
        mimeType: 'text/plain',
        size: 100,
        content: 'Test document content.',
      });

      await AnalysisService.analyzeDocument(mockDocument);

      // Wait for async processing and all retries
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Should have tried 4 times (initial + 3 retries)
      expect(mockClient.post).toHaveBeenCalledTimes(4);
    });

    test('should not retry on client errors', async () => {
      const mockClient = {
        post: jest.fn().mockRejectedValue({ response: { status: 400 } }),
      };
      mockAxios.create.mockReturnValue(mockClient as any);

      const mockDocument = DocumentModel.create({
        filename: 'test.txt',
        originalName: 'test.txt',
        mimeType: 'text/plain',
        size: 100,
        content: 'Test document content.',
      });

      await AnalysisService.analyzeDocument(mockDocument);

      // Wait for async processing
      await new Promise(resolve => setTimeout(resolve, 300));

      // Should only try once for client errors
      expect(mockClient.post).toHaveBeenCalledTimes(1);
    });
  });

  describe('Analysis Status Management', () => {
    test('should return analysis status correctly', async () => {
      const status = await AnalysisService.getAnalysisStatus('test-analysis-id');
      expect(status).toBe('completed');
    });

    test('should cancel analysis successfully', async () => {
      const result = await AnalysisService.cancelAnalysis('test-analysis-id');
      expect(result).toBe(true);
    });
  });

  describe('Content Processing', () => {
    test('should handle large document content', async () => {
      const largeContent = 'Lorem ipsum '.repeat(1000); // Large content
      
      const mockDocument = DocumentModel.create({
        filename: 'large.txt',
        originalName: 'large.txt',
        mimeType: 'text/plain',
        size: largeContent.length,
        content: largeContent,
      });

      const analysisId = await AnalysisService.analyzeDocument(mockDocument);
      expect(analysisId).toBeDefined();
    });

    test('should handle special characters in content', async () => {
      const specialContent = 'Content with special chars: àáâãäå ñ ç 中文 🚀';
      
      const mockDocument = DocumentModel.create({
        filename: 'special.txt',
        originalName: 'special.txt',
        mimeType: 'text/plain',
        size: specialContent.length,
        content: specialContent,
      });

      const analysisId = await AnalysisService.analyzeDocument(mockDocument);
      expect(analysisId).toBeDefined();
    });
  });
});
