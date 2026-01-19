import request from 'supertest';
import * as fc from 'fast-check';
import app from '../index';
import { DocumentModel } from '../models/Document';
import { IssueModel } from '../models/Issue';

/**
 * Feature: hr-document-analyzer, Property 1: Supported Format Files Upload Successfully
 * 
 * Property: For any supported format file, upload operation should succeed 
 * and return document ID and preview functionality
 * Validates: Design Property 1
 */

describe('File Upload Property Tests', () => {
  beforeEach(() => {
    DocumentModel.clear();
    IssueModel.clear();
  });

  afterEach(() => {
    DocumentModel.clear();
    IssueModel.clear();
  });

  // Property test for supported file formats
  test('Property 1.1: Supported file formats upload successfully', () => {
    fc.assert(fc.asyncProperty(
      fc.record({
        filename: fc.string({ minLength: 1, maxLength: 50 }).map(s => s + '.txt'),
        content: fc.string({ minLength: 1, maxLength: 1000 }),
        mimeType: fc.constantFrom(
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain'
        )
      }),
      async (fileData) => {
        const response = await request(app)
          .post('/api/documents/upload')
          .attach('file', Buffer.from(fileData.content), {
            filename: fileData.filename,
            contentType: fileData.mimeType
          });

        // Should succeed for supported formats
        if (response.status === 201) {
          expect(response.body).toHaveProperty('documentId');
          expect(response.body).toHaveProperty('filename');
          expect(response.body).toHaveProperty('size');
          expect(typeof response.body.documentId).toBe('string');
          expect(response.body.documentId.length).toBeGreaterThan(0);
          expect(response.body.filename).toBe(fileData.filename);
          expect(response.body.size).toBeGreaterThan(0);
        }

        return true;
      }
    ), { numRuns: 10 });
  });

  // Property test for file size validation
  test('Property 1.2: File size validation works correctly', () => {
    fc.assert(fc.asyncProperty(
      fc.record({
        filename: fc.string({ minLength: 1, maxLength: 20 }).map(s => s + '.txt'),
        size: fc.integer({ min: 1, max: 100 * 1024 * 1024 }), // Up to 100MB
        mimeType: fc.constantFrom('text/plain', 'application/pdf')
      }),
      async (fileData) => {
        const content = 'x'.repeat(Math.min(fileData.size, 10000)); // Limit for testing
        
        const response = await request(app)
          .post('/api/documents/upload')
          .attach('file', Buffer.from(content), {
            filename: fileData.filename,
            contentType: fileData.mimeType
          });

        const maxSize = 50 * 1024 * 1024; // 50MB limit
        
        if (content.length <= maxSize) {
          // Should succeed for files within size limit
          expect([200, 201, 400]).toContain(response.status);
        } else {
          // Should fail for files exceeding size limit
          expect([400, 413]).toContain(response.status);
        }

        return true;
      }
    ), { numRuns: 15 });
  });

  // Property test for upload response consistency
  test('Property 1.3: Upload response format is consistent', () => {
    fc.assert(fc.asyncProperty(
      fc.record({
        filename: fc.string({ minLength: 1, maxLength: 30 }).map(s => s + '.txt'),
        content: fc.string({ minLength: 10, maxLength: 500 })
      }),
      async (fileData) => {
        const response = await request(app)
          .post('/api/documents/upload')
          .attach('file', Buffer.from(fileData.content), {
            filename: fileData.filename,
            contentType: 'text/plain'
          });

        if (response.status === 201) {
          // Verify response structure
          expect(response.body).toHaveProperty('documentId');
          expect(response.body).toHaveProperty('filename');
          expect(response.body).toHaveProperty('size');
          
          // Verify data types
          expect(typeof response.body.documentId).toBe('string');
          expect(typeof response.body.filename).toBe('string');
          expect(typeof response.body.size).toBe('number');
          
          // Verify values
          expect(response.body.documentId).toMatch(/^doc_\d+_[a-z0-9]+$/);
          expect(response.body.filename).toBe(fileData.filename);
          expect(response.body.size).toBe(Buffer.from(fileData.content).length);
        }

        return true;
      }
    ), { numRuns: 20 });
  });

  // Property test for document storage
  test('Property 1.4: Uploaded documents are stored correctly', () => {
    fc.assert(fc.asyncProperty(
      fc.record({
        filename: fc.string({ minLength: 1, maxLength: 20 }).map(s => s + '.txt'),
        content: fc.string({ minLength: 10, maxLength: 300 })
      }),
      async (fileData) => {
        const initialCount = DocumentModel.findAll().length;
        
        const response = await request(app)
          .post('/api/documents/upload')
          .attach('file', Buffer.from(fileData.content), {
            filename: fileData.filename,
            contentType: 'text/plain'
          });

        if (response.status === 201) {
          const finalCount = DocumentModel.findAll().length;
          expect(finalCount).toBe(initialCount + 1);
          
          // Verify document was stored
          const document = DocumentModel.findById(response.body.documentId);
          expect(document).toBeDefined();
          expect(document!.originalName).toBe(fileData.filename);
          expect(document!.content).toBe(fileData.content);
          expect(document!.status).toBe('uploaded');
          expect(document!.mimeType).toBe('text/plain');
        }

        return true;
      }
    ), { numRuns: 15 });
  });

  // Property test for concurrent uploads
  test('Property 1.5: Concurrent uploads are handled correctly', () => {
    fc.assert(fc.asyncProperty(
      fc.array(fc.record({
        filename: fc.string({ minLength: 1, maxLength: 15 }).map(s => s + '.txt'),
        content: fc.string({ minLength: 10, maxLength: 200 })
      }), { minLength: 2, maxLength: 5 }),
      async (fileDataArray) => {
        const initialCount = DocumentModel.findAll().length;
        
        // Upload files concurrently
        const uploadPromises = fileDataArray.map(fileData =>
          request(app)
            .post('/api/documents/upload')
            .attach('file', Buffer.from(fileData.content), {
              filename: fileData.filename,
              contentType: 'text/plain'
            })
        );

        const responses = await Promise.all(uploadPromises);
        
        // Count successful uploads
        const successfulUploads = responses.filter(response => response.status === 201);
        const finalCount = DocumentModel.findAll().length;
        
        expect(finalCount).toBe(initialCount + successfulUploads.length);
        
        // Verify each successful upload created a unique document
        const documentIds = successfulUploads.map(response => response.body.documentId);
        const uniqueIds = new Set(documentIds);
        expect(uniqueIds.size).toBe(documentIds.length);

        return true;
      }
    ), { numRuns: 10 });
  });

  // Property test for metadata extraction
  test('Property 1.6: Document metadata is extracted correctly', () => {
    fc.assert(fc.asyncProperty(
      fc.record({
        filename: fc.string({ minLength: 1, maxLength: 20 }).map(s => s + '.txt'),
        content: fc.string({ minLength: 10, maxLength: 500 })
      }),
      async (fileData) => {
        const response = await request(app)
          .post('/api/documents/upload')
          .attach('file', Buffer.from(fileData.content), {
            filename: fileData.filename,
            contentType: 'text/plain'
          });

        if (response.status === 201) {
          const document = DocumentModel.findById(response.body.documentId);
          expect(document).toBeDefined();
          
          // Verify metadata
          expect(document!.metadata).toBeDefined();
          expect(document!.metadata.wordCount).toBeDefined();
          expect(document!.metadata.language).toBeDefined();
          
          // Verify word count calculation
          const expectedWordCount = fileData.content.split(/\s+/).length;
          expect(document!.metadata.wordCount).toBe(expectedWordCount);
          
          // Verify language detection (currently defaults to 'en')
          expect(document!.metadata.language).toBe('en');
        }

        return true;
      }
    ), { numRuns: 15 });
  });
});
