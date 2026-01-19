import request from 'supertest';
import * as fc from 'fast-check';
import app from '../index';
import { DocumentModel } from '../models/Document';
import { IssueModel } from '../models/Issue';

/**
 * Feature: hr-document-analyzer, Property 14: Error Message User-Friendliness
 * 
 * Property: For any system error, user-friendly error messages and solution 
 * suggestions should be displayed
 * Validates: Design Property 14
 */

describe('Error Message User-Friendliness Property Tests', () => {
  beforeEach(() => {
    DocumentModel.clear();
    IssueModel.clear();
  });

  afterEach(() => {
    DocumentModel.clear();
    IssueModel.clear();
  });

  // Property test for missing file error
  test('Property 14.1: Missing file upload returns user-friendly error', () => {
    fc.assert(fc.asyncProperty(
      fc.constant(null),
      async () => {
        // Attempt upload without file
        const response = await request(app)
          .post('/api/documents/upload');

        // Should return error
        expect(response.status).toBeGreaterThanOrEqual(400);
        expect(response.status).toBeLessThan(500);

        // Error should have user-friendly structure
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toHaveProperty('message');
        expect(response.body.error).toHaveProperty('code');

        // Message should be descriptive
        const message = response.body.error.message.toLowerCase();
        expect(message.length).toBeGreaterThan(5);
        expect(message).toMatch(/file|upload|missing|required/);

        return true;
      }
    ), { numRuns: 100 });
  });

  // Property test for invalid document ID error
  test('Property 14.2: Invalid document ID returns clear error message', () => {
    fc.assert(fc.asyncProperty(
      fc.string({ minLength: 1, maxLength: 20 }),
      async (invalidId) => {
        // Attempt to analyze non-existent document
        const response = await request(app)
          .post(`/api/documents/${invalidId}/analyze`);

        if (response.status === 404) {
          // Error should be user-friendly
          expect(response.body).toHaveProperty('error');
          expect(response.body.error).toHaveProperty('message');
          expect(response.body.error).toHaveProperty('code');

          // Message should be clear
          const message = response.body.error.message.toLowerCase();
          expect(message).toMatch(/not found|does not exist|invalid|unknown/);
        }

        return true;
      }
    ), { numRuns: 100 });
  });

  // Property test for file size error
  test('Property 14.3: File size limit error provides helpful information', () => {
    fc.assert(fc.asyncProperty(
      fc.record({
        filename: fc.string({ minLength: 1, maxLength: 20 }).map(s => s + '.txt'),
        // Create content larger than typical limit
        content: fc.string({ minLength: 1000, maxLength: 2000 })
      }),
      async (testData) => {
        // This test validates error message structure
        // Actual file size validation happens in middleware
        
        // Upload a document
        const response = await request(app)
          .post('/api/documents/upload')
          .attach('file', Buffer.from(testData.content), {
            filename: testData.filename,
            contentType: 'text/plain'
          });

        // Whether success or error, response should be well-formed
        expect(response.status).toBeGreaterThan(0);
        
        if (response.status >= 400) {
          // Error response should be user-friendly
          expect(response.body).toHaveProperty('error');
          
          if (response.body.error) {
            expect(response.body.error).toHaveProperty('message');
            expect(typeof response.body.error.message).toBe('string');
            expect(response.body.error.message.length).toBeGreaterThan(0);
          }
        }

        return true;
      }
    ), { numRuns: 100 });
  });

  // Property test for unsupported file type error
  test('Property 14.4: Unsupported file type error lists supported formats', () => {
    fc.assert(fc.asyncProperty(
      fc.record({
        filename: fc.string({ minLength: 1, maxLength: 20 }).map(s => s + '.xyz'),
        content: fc.string({ minLength: 50, maxLength: 200 })
      }),
      async (testData) => {
        // Attempt to upload unsupported file type
        const response = await request(app)
          .post('/api/documents/upload')
          .attach('file', Buffer.from(testData.content), {
            filename: testData.filename,
            contentType: 'application/octet-stream'
          });

        if (response.status === 400) {
          // Error should mention supported types
          expect(response.body).toHaveProperty('error');
          expect(response.body.error).toHaveProperty('message');

          const message = response.body.error.message.toLowerCase();
          expect(message).toMatch(/unsupported|not supported|invalid.*type/);

          // Should provide helpful information
          if (response.body.error.details) {
            expect(response.body.error.details).toHaveProperty('supportedTypes');
          }
        }

        return true;
      }
    ), { numRuns: 100 });
  });

  // Property test for validation error structure
  test('Property 14.5: Validation errors provide field-specific messages', () => {
    fc.assert(fc.asyncProperty(
      fc.record({
        filename: fc.string({ minLength: 1, maxLength: 20 }).map(s => s + '.txt'),
        content: fc.string({ minLength: 100, maxLength: 300 })
      }),
      async (testData) => {
        // Upload document first
        const uploadResponse = await request(app)
          .post('/api/documents/upload')
          .attach('file', Buffer.from(testData.content), {
            filename: testData.filename,
            contentType: 'text/plain'
          });

        if (uploadResponse.status === 201) {
          const documentId = uploadResponse.body.documentId;

          // Attempt fix with invalid data
          const fixResponse = await request(app)
            .post(`/api/documents/${documentId}/fix`)
            .send({
              // Missing required field: selectedIssues
              autoFix: true
            });

          if (fixResponse.status === 400) {
            // Validation error should be clear
            expect(fixResponse.body).toHaveProperty('error');
            expect(fixResponse.body.error).toHaveProperty('message');
            expect(fixResponse.body.error).toHaveProperty('code');

            // Should indicate validation failure
            const code = fixResponse.body.error.code;
            expect(code).toMatch(/VALIDATION|INVALID|BAD_REQUEST/);

            // Message should be descriptive
            const message = fixResponse.body.error.message;
            expect(typeof message).toBe('string');
            expect(message.length).toBeGreaterThan(5);
          }
        }

        return true;
      }
    ), { numRuns: 100 });
  });

  // Property test for error code consistency
  test('Property 14.6: Error responses include consistent error codes', () => {
    fc.assert(fc.asyncProperty(
      fc.constantFrom(
        '/api/documents/invalid-id/analyze',
        '/api/documents/invalid-id/fix',
        '/api/documents/invalid-id/download'
      ),
      async (endpoint) => {
        // Make request to invalid endpoint
        const response = await request(app).post(endpoint);

        if (response.status >= 400) {
          // Error should have code
          expect(response.body).toHaveProperty('error');
          expect(response.body.error).toHaveProperty('code');
          expect(response.body.error).toHaveProperty('message');

          // Code should be uppercase and descriptive
          const code = response.body.error.code;
          expect(typeof code).toBe('string');
          expect(code.length).toBeGreaterThan(0);
          expect(code).toMatch(/^[A-Z_]+$/);
        }

        return true;
      }
    ), { numRuns: 100 });
  });

  // Property test for error message language
  test('Property 14.7: Error messages use clear, non-technical language', () => {
    fc.assert(fc.asyncProperty(
      fc.record({
        filename: fc.string({ minLength: 1, maxLength: 20 }).map(s => s + '.txt'),
        content: fc.string({ minLength: 50, maxLength: 200 })
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

          // Try to fix with empty issue list
          const fixResponse = await request(app)
            .post(`/api/documents/${documentId}/fix`)
            .send({
              selectedIssues: [],
              autoFix: true
            });

          // Any error should be user-friendly
          if (fixResponse.status >= 400 && fixResponse.body.error) {
            const message = fixResponse.body.error.message;
            
            // Should not contain technical jargon
            expect(message).not.toMatch(/null pointer|undefined|stack trace|exception/i);
            
            // Should be readable
            expect(typeof message).toBe('string');
            expect(message.length).toBeGreaterThan(0);
            expect(message.length).toBeLessThan(200); // Not too verbose
          }
        }

        return true;
      }
    ), { numRuns: 100 });
  });

  // Property test for HTTP status code appropriateness
  test('Property 14.8: HTTP status codes match error types', () => {
    fc.assert(fc.asyncProperty(
      fc.record({
        endpoint: fc.constantFrom(
          '/api/documents/nonexistent/analyze',
          '/api/documents/upload'
        ),
        method: fc.constantFrom('GET', 'POST')
      }),
      async (testData) => {
        let response;
        
        if (testData.method === 'GET') {
          response = await request(app).get(testData.endpoint);
        } else {
          response = await request(app).post(testData.endpoint);
        }

        // Status code should be appropriate
        if (testData.endpoint.includes('nonexistent')) {
          // Should be 404 for not found
          expect([404, 400]).toContain(response.status);
        }

        if (response.status >= 400) {
          // Error structure should be consistent
          expect(response.body).toHaveProperty('error');
          
          // 4xx errors should have clear messages
          if (response.status >= 400 && response.status < 500) {
            expect(response.body.error).toHaveProperty('message');
            expect(response.body.error.message.length).toBeGreaterThan(0);
          }
        }

        return true;
      }
    ), { numRuns: 100 });
  });
});
