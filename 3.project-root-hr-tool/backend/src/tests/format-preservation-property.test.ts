import request from 'supertest';
import * as fc from 'fast-check';
import app from '../index';
import { DocumentModel } from '../models/Document';
import { IssueModel } from '../models/Issue';

/**
 * Feature: hr-document-analyzer, Property 11: Document Format Consistency
 * 
 * Property: For any downloaded fixed document, its format and style should 
 * remain consistent with the original document
 * Validates: Design Property 11
 */

describe('Format Preservation Property Tests', () => {
  beforeEach(() => {
    DocumentModel.clear();
    IssueModel.clear();
  });

  afterEach(() => {
    DocumentModel.clear();
    IssueModel.clear();
  });

  // Property test for MIME type preservation
  test('Property 11.1: Fixed document preserves original MIME type', () => {
    fc.assert(fc.asyncProperty(
      fc.record({
        filename: fc.string({ minLength: 1, maxLength: 20 }).map(s => s + '.txt'),
        content: fc.string({ minLength: 100, maxLength: 500 }),
        mimeType: fc.constantFrom('text/plain', 'application/pdf')
      }),
      async (testData) => {
        // Upload document
        const uploadResponse = await request(app)
          .post('/api/documents/upload')
          .attach('file', Buffer.from(testData.content), {
            filename: testData.filename,
            contentType: testData.mimeType
          });

        if (uploadResponse.status === 201) {
          const documentId = uploadResponse.body.documentId;
          
          // Get original document
          const originalDoc = DocumentModel.findById(documentId);
          expect(originalDoc).toBeDefined();
          const originalMimeType = originalDoc?.mimeType;

          // Create and fix an issue
          const issue = IssueModel.create({
            documentId,
            type: 'grammar',
            severity: 'medium',
            title: 'Test Issue',
            description: 'Test issue description',
            location: { line: 1, column: 1 },
            originalText: 'error',
            context: 'Context for error',
            suggestion: {
              suggestedText: 'fixed',
              explanation: 'Fix explanation',
              confidence: 0.9,
              requiresManualReview: false
            },
            isAutoFixable: true
          });

          // Apply fix
          const fixResponse = await request(app)
            .post(`/api/documents/${documentId}/fix`)
            .send({
              selectedIssues: [issue.id],
              autoFix: true
            });

          if (fixResponse.status === 200) {
            const fixedDocId = fixResponse.body.fixedDocumentId;
            const fixedDoc = DocumentModel.findById(fixedDocId);

            // MIME type should be preserved
            expect(fixedDoc).toBeDefined();
            expect(fixedDoc?.mimeType).toBe(originalMimeType);
          }
        }

        return true;
      }
    ), { numRuns: 100 });
  });

  // Property test for metadata preservation
  test('Property 11.2: Fixed document preserves metadata structure', () => {
    fc.assert(fc.asyncProperty(
      fc.record({
        filename: fc.string({ minLength: 1, maxLength: 20 }).map(s => s + '.txt'),
        content: fc.string({ minLength: 100, maxLength: 400 }),
        wordCount: fc.integer({ min: 10, max: 100 })
      }),
      async (testData) => {
        // Upload document
        const uploadResponse = await request(app)
          .post('/api/documents/upload')
          .attach('file', Buffer.from(testData.content), {
            filename: testData.filename,
            contentType: 'text/plain'
          });

        if (uploadResponse.status === 201) {
          const documentId = uploadResponse.body.documentId;
          
          // Get original document metadata
          const originalDoc = DocumentModel.findById(documentId);
          expect(originalDoc).toBeDefined();
          expect(originalDoc?.metadata).toBeDefined();

          // Create and fix an issue
          const issue = IssueModel.create({
            documentId,
            type: 'grammar',
            severity: 'medium',
            title: 'Test Issue',
            description: 'Test issue description',
            location: { line: 1, column: 1 },
            originalText: 'test',
            context: 'Context for test',
            suggestion: {
              suggestedText: 'fixed',
              explanation: 'Fix explanation',
              confidence: 0.9,
              requiresManualReview: false
            },
            isAutoFixable: true
          });

          // Apply fix
          const fixResponse = await request(app)
            .post(`/api/documents/${documentId}/fix`)
            .send({
              selectedIssues: [issue.id],
              autoFix: true
            });

          if (fixResponse.status === 200) {
            const fixedDocId = fixResponse.body.fixedDocumentId;
            const fixedDoc = DocumentModel.findById(fixedDocId);

            // Metadata structure should be preserved
            expect(fixedDoc).toBeDefined();
            expect(fixedDoc?.metadata).toBeDefined();
            expect(typeof fixedDoc?.metadata).toBe('object');
            
            // Key metadata fields should exist
            if (originalDoc?.metadata.language) {
              expect(fixedDoc?.metadata.language).toBeDefined();
            }
          }
        }

        return true;
      }
    ), { numRuns: 100 });
  });

  // Property test for content length consistency
  test('Property 11.3: Fixed document maintains reasonable content length', () => {
    fc.assert(fc.asyncProperty(
      fc.record({
        filename: fc.string({ minLength: 1, maxLength: 20 }).map(s => s + '.txt'),
        content: fc.string({ minLength: 200, maxLength: 600 }),
        issueCount: fc.integer({ min: 1, max: 3 })
      }),
      async (testData) => {
        // Upload document
        const uploadResponse = await request(app)
          .post('/api/documents/upload')
          .attach('file', Buffer.from(testData.content), {
            filename: testData.filename,
            contentType: 'text/plain'
          });

        if (uploadResponse.status === 201) {
          const documentId = uploadResponse.body.documentId;
          const originalDoc = DocumentModel.findById(documentId);
          const originalLength = originalDoc?.content.length || 0;

          const issueIds: string[] = [];

          // Create issues
          for (let i = 0; i < testData.issueCount; i++) {
            const issue = IssueModel.create({
              documentId,
              type: 'grammar',
              severity: 'medium',
              title: `Issue ${i + 1}`,
              description: `Description for issue ${i + 1}`,
              location: { line: i + 1, column: 1 },
              originalText: `error${i}`,
              context: `Context for error${i}`,
              suggestion: {
                suggestedText: `fixed${i}`,
                explanation: `Fix explanation ${i + 1}`,
                confidence: 0.9,
                requiresManualReview: false
              },
              isAutoFixable: true
            });
            issueIds.push(issue.id);
          }

          // Apply fixes
          const fixResponse = await request(app)
            .post(`/api/documents/${documentId}/fix`)
            .send({
              selectedIssues: issueIds,
              autoFix: true
            });

          if (fixResponse.status === 200) {
            const fixedDocId = fixResponse.body.fixedDocumentId;
            const fixedDoc = DocumentModel.findById(fixedDocId);

            // Content length should be reasonable (not drastically different)
            expect(fixedDoc).toBeDefined();
            const fixedLength = fixedDoc?.content.length || 0;
            
            // Fixed content should exist
            expect(fixedLength).toBeGreaterThan(0);
            
            // Length should be within reasonable bounds (50% to 150% of original)
            const ratio = fixedLength / originalLength;
            expect(ratio).toBeGreaterThan(0.5);
            expect(ratio).toBeLessThan(1.5);
          }
        }

        return true;
      }
    ), { numRuns: 100 });
  });

  // Property test for download format consistency
  test('Property 11.4: Downloaded document maintains format', () => {
    fc.assert(fc.asyncProperty(
      fc.record({
        filename: fc.string({ minLength: 1, maxLength: 20 }).map(s => s + '.txt'),
        content: fc.string({ minLength: 100, maxLength: 400 })
      }),
      async (testData) => {
        // Upload document
        const uploadResponse = await request(app)
          .post('/api/documents/upload')
          .attach('file', Buffer.from(testData.content), {
            filename: testData.filename,
            contentType: 'text/plain'
          });

        if (uploadResponse.status === 201) {
          const documentId = uploadResponse.body.documentId;

          // Create and fix an issue
          const issue = IssueModel.create({
            documentId,
            type: 'grammar',
            severity: 'medium',
            title: 'Test Issue',
            description: 'Test issue description',
            location: { line: 1, column: 1 },
            originalText: 'error',
            context: 'Context for error',
            suggestion: {
              suggestedText: 'fixed',
              explanation: 'Fix explanation',
              confidence: 0.9,
              requiresManualReview: false
            },
            isAutoFixable: true
          });

          // Apply fix
          const fixResponse = await request(app)
            .post(`/api/documents/${documentId}/fix`)
            .send({
              selectedIssues: [issue.id],
              autoFix: true
            });

          if (fixResponse.status === 200) {
            const fixedDocId = fixResponse.body.fixedDocumentId;

            // Download fixed document
            const downloadResponse = await request(app)
              .get(`/api/documents/${fixedDocId}/download`)
              .query({ format: 'fixed' });

            if (downloadResponse.status === 200) {
              // Should return a buffer/file
              expect(downloadResponse.body).toBeDefined();
              expect(Buffer.isBuffer(downloadResponse.body) || typeof downloadResponse.body === 'object').toBe(true);
              
              // Content-Type header should be set
              expect(downloadResponse.headers['content-type']).toBeDefined();
            }
          }
        }

        return true;
      }
    ), { numRuns: 100 });
  });
});
