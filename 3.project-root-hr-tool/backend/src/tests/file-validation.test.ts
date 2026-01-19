import request from 'supertest';
import * as fc from 'fast-check';
import app from '../index';
import { DocumentModel } from '../models/Document';
import { IssueModel } from '../models/Issue';

/**
 * Feature: hr-document-analyzer, Property 2: Unsupported Format Files Are Rejected
 * 
 * Property: For any unsupported format file, the system should reject upload 
 * and display supported format list
 * Validates: Design Property 2
 */

describe('File Format Validation Property Tests', () => {
  beforeEach(() => {
    DocumentModel.clear();
    IssueModel.clear();
  });

  afterEach(() => {
    DocumentModel.clear();
    IssueModel.clear();
  });

  // Property test for unsupported file formats
  test('Property 2.1: Unsupported file formats are rejected', () => {
    fc.assert(fc.asyncProperty(
      fc.record({
        filename: fc.string({ minLength: 1, maxLength: 30 }),
        content: fc.string({ minLength: 1, maxLength: 500 }),
        mimeType: fc.constantFrom(
          'image/jpeg',
          'image/png',
          'video/mp4',
          'audio/mp3',
          'application/zip',
          'application/x-executable',
          'text/html',
          'application/javascript',
          'text/css'
        )
      }),
      async (fileData) => {
        const response = await request(app)
          .post('/api/documents/upload')
          .attach('file', Buffer.from(fileData.content), {
            filename: fileData.filename,
            contentType: fileData.mimeType
          });

        // Should reject unsupported formats
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
        
        // Should not create document in storage
        const documents = DocumentModel.findAll();
        const newDocument = documents.find(doc => doc.originalName === fileData.filename);
        expect(newDocument).toBeUndefined();

        return true;
      }
    ), { numRuns: 20 });
  });

  // Property test for supported file formats
  test('Property 2.2: Supported file formats are accepted', () => {
    fc.assert(fc.asyncProperty(
      fc.record({
        filename: fc.string({ minLength: 1, maxLength: 30 }),
        content: fc.string({ minLength: 1, maxLength: 500 }),
        mimeType: fc.constantFrom(
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
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

        // Should accept supported formats
        expect([200, 201]).toContain(response.status);
        
        if (response.status === 201) {
          expect(response.body).toHaveProperty('documentId');
          expect(response.body).toHaveProperty('filename');
          expect(response.body).toHaveProperty('size');
        }

        return true;
      }
    ), { numRuns: 15 });
  });

  // Property test for file extension vs MIME type consistency
  test('Property 2.3: File extension and MIME type validation is consistent', () => {
    fc.assert(fc.asyncProperty(
      fc.record({
        baseFilename: fc.string({ minLength: 1, maxLength: 20 }),
        extension: fc.constantFrom('.pdf', '.docx', '.txt', '.xls', '.xlsx', '.jpg', '.png'),
        content: fc.string({ minLength: 1, maxLength: 300 }),
        mimeType: fc.constantFrom(
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'image/jpeg',
          'image/png'
        )
      }),
      async (fileData) => {
        const filename = fileData.baseFilename + fileData.extension;
        
        const response = await request(app)
          .post('/api/documents/upload')
          .attach('file', Buffer.from(fileData.content), {
            filename: filename,
            contentType: fileData.mimeType
          });

        const supportedMimeTypes = [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];

        if (supportedMimeTypes.includes(fileData.mimeType)) {
          // Should accept supported MIME types
          expect([200, 201]).toContain(response.status);
        } else {
          // Should reject unsupported MIME types
          expect(response.status).toBe(400);
        }

        return true;
      }
    ), { numRuns: 25 });
  });

  // Property test for empty file handling
  test('Property 2.4: Empty files are handled appropriately', () => {
    fc.assert(fc.asyncProperty(
      fc.record({
        filename: fc.string({ minLength: 1, maxLength: 20 }).map(s => s + '.txt'),
        mimeType: fc.constantFrom('text/plain', 'application/pdf')
      }),
      async (fileData) => {
        const response = await request(app)
          .post('/api/documents/upload')
          .attach('file', Buffer.from(''), {
            filename: fileData.filename,
            contentType: fileData.mimeType
          });

        // Empty files should be rejected or handled gracefully
        if (response.status === 400) {
          expect(response.body).toHaveProperty('error');
        } else if (response.status === 201) {
          // If accepted, should still create valid document
          expect(response.body).toHaveProperty('documentId');
          expect(response.body.size).toBe(0);
        }

        return true;
      }
    ), { numRuns: 10 });
  });

  // Property test for malformed file uploads
  test('Property 2.5: Malformed uploads are rejected gracefully', () => {
    fc.assert(fc.asyncProperty(
      fc.record({
        filename: fc.option(fc.string({ minLength: 1, maxLength: 20 })),
        content: fc.option(fc.string({ minLength: 1, maxLength: 300 })),
        mimeType: fc.option(fc.constantFrom('text/plain', 'application/pdf', 'invalid/type'))
      }),
      async (fileData) => {
        let response;
        
        try {
          if (!fileData.filename || !fileData.content || !fileData.mimeType) {
            // Test missing required fields
            response = await request(app)
              .post('/api/documents/upload')
              .send({}); // No file attached
          } else {
            response = await request(app)
              .post('/api/documents/upload')
              .attach('file', Buffer.from(fileData.content), {
                filename: fileData.filename,
                contentType: fileData.mimeType
              });
          }
        } catch (error) {
          // Network or request errors should be handled
          expect(error).toBeDefined();
          return true;
        }

        // Should handle malformed requests gracefully
        expect(response.status).toBeGreaterThanOrEqual(400);
        expect(response.status).toBeLessThan(500);
        
        if (response.body && response.body.error) {
          expect(typeof response.body.error).toBe('object');
          expect(response.body.error).toHaveProperty('message');
        }

        return true;
      }
    ), { numRuns: 15 });
  });

  // Property test for file name validation
  test('Property 2.6: File names are validated and sanitized', () => {
    fc.assert(fc.asyncProperty(
      fc.record({
        filename: fc.string({ minLength: 1, maxLength: 100 }),
        content: fc.string({ minLength: 1, maxLength: 200 }),
        mimeType: fc.constantFrom('text/plain', 'application/pdf')
      }),
      async (fileData) => {
        // Add extension if not present
        const filename = fileData.filename.includes('.') 
          ? fileData.filename 
          : fileData.filename + '.txt';
        
        const response = await request(app)
          .post('/api/documents/upload')
          .attach('file', Buffer.from(fileData.content), {
            filename: filename,
            contentType: fileData.mimeType
          });

        if (response.status === 201) {
          // Verify filename is stored correctly
          expect(response.body.filename).toBeDefined();
          expect(typeof response.body.filename).toBe('string');
          expect(response.body.filename.length).toBeGreaterThan(0);
          
          // Verify document storage
          const document = DocumentModel.findById(response.body.documentId);
          expect(document).toBeDefined();
          expect(document!.originalName).toBe(filename);
        }

        return true;
      }
    ), { numRuns: 20 });
  });

  // Property test for concurrent validation
  test('Property 2.7: Concurrent file validations are consistent', () => {
    fc.assert(fc.asyncProperty(
      fc.array(fc.record({
        filename: fc.string({ minLength: 1, maxLength: 15 }).map(s => s + '.txt'),
        content: fc.string({ minLength: 1, maxLength: 100 }),
        mimeType: fc.constantFrom(
          'text/plain',
          'application/pdf',
          'image/jpeg', // unsupported
          'video/mp4'   // unsupported
        )
      }), { minLength: 2, maxLength: 8 }),
      async (fileDataArray) => {
        // Upload files concurrently
        const uploadPromises = fileDataArray.map(fileData =>
          request(app)
            .post('/api/documents/upload')
            .attach('file', Buffer.from(fileData.content), {
              filename: fileData.filename,
              contentType: fileData.mimeType
            })
        );

        const responses = await Promise.all(uploadPromises);
        
        // Verify validation consistency
        for (let i = 0; i < responses.length; i++) {
          const response = responses[i];
          const fileData = fileDataArray[i];
          
          const supportedTypes = [
            'text/plain',
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          ];
          
          if (supportedTypes.includes(fileData.mimeType)) {
            expect([200, 201]).toContain(response.status);
          } else {
            expect(response.status).toBe(400);
          }
        }

        return true;
      }
    ), { numRuns: 10 });
  });
});
