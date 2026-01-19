import * as fc from 'fast-check';
import { DocumentModel, Document, DocumentCreateInput } from '../models/Document';

/**
 * Feature: hr-document-analyzer, Property 15: Temporary File Auto Cleanup
 * 
 * Property: For any completed processing document, the system should automatically 
 * clean up related temporary files and cache data
 * Validates: Design Property 15
 */

describe('Document Model Property Tests', () => {
  beforeEach(() => {
    DocumentModel.clear();
  });

  afterEach(() => {
    DocumentModel.clear();
  });

  // Property test for document creation
  test('Property 15.1: Document creation generates valid document with unique ID', () => {
    fc.assert(fc.property(
      fc.record({
        filename: fc.string({ minLength: 1, maxLength: 50 }),
        originalName: fc.string({ minLength: 1, maxLength: 100 }),
        mimeType: fc.constantFrom(
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain'
        ),
        size: fc.integer({ min: 1, max: 50 * 1024 * 1024 }),
        content: fc.string({ minLength: 1, maxLength: 1000 })
      }),
      (input) => {
        const document = DocumentModel.create(input as DocumentCreateInput);
        
        // Verify document properties
        expect(document.id).toBeDefined();
        expect(typeof document.id).toBe('string');
        expect(document.id.length).toBeGreaterThan(0);
        expect(document.filename).toBe(input.filename);
        expect(document.originalName).toBe(input.originalName);
        expect(document.mimeType).toBe(input.mimeType);
        expect(document.size).toBe(input.size);
        expect(document.content).toBe(input.content);
        expect(document.status).toBe('uploaded');
        expect(document.uploadedAt).toBeInstanceOf(Date);
        
        return true;
      }
    ), { numRuns: 50 });
  });

  // Property test for document cleanup
  test('Property 15.2: Cleanup removes old documents based on age and status', () => {
    fc.assert(fc.property(
      fc.array(fc.record({
        filename: fc.string({ minLength: 1, maxLength: 20 }),
        originalName: fc.string({ minLength: 1, maxLength: 20 }),
        mimeType: fc.constantFrom('application/pdf', 'text/plain'),
        size: fc.integer({ min: 100, max: 1000 }),
        content: fc.string({ minLength: 10, maxLength: 100 }),
        daysOld: fc.integer({ min: 1, max: 60 }),
        status: fc.constantFrom('error', 'fixed', 'analyzed', 'uploaded')
      }), { minLength: 1, maxLength: 10 }),
      (documentInputs) => {
        const documents: Document[] = [];
        
        // Create documents with different ages and statuses
        for (const input of documentInputs) {
          const doc = DocumentModel.create({
            filename: input.filename,
            originalName: input.originalName,
            mimeType: input.mimeType,
            size: input.size,
            content: input.content
          });
          
          // Simulate age by modifying upload date
          const oldDate = new Date();
          oldDate.setDate(oldDate.getDate() - input.daysOld);
          
          DocumentModel.update(doc.id, { 
            status: input.status as Document['status']
          });
          
          // Manually set upload date for testing
          const updatedDoc = DocumentModel.findById(doc.id);
          if (updatedDoc) {
            (updatedDoc as any).uploadedAt = oldDate;
            documents.push(updatedDoc);
          }
        }
        
        const initialCount = DocumentModel.findAll().length;
        
        // Cleanup documents older than 30 days
        const deletedCount = DocumentModel.cleanup(30);
        
        const finalCount = DocumentModel.findAll().length;
        
        // Verify cleanup logic
        const shouldBeDeleted = documentInputs.filter(input => 
          input.daysOld > 30 && (input.status === 'error' || input.status === 'fixed')
        ).length;
        
        expect(deletedCount).toBe(shouldBeDeleted);
        expect(finalCount).toBe(initialCount - deletedCount);
        
        return true;
      }
    ), { numRuns: 20 });
  });

  // Property test for status transitions
  test('Property 15.3: Document status transitions follow valid state machine', () => {
    fc.assert(fc.property(
      fc.record({
        filename: fc.string({ minLength: 1, maxLength: 20 }),
        originalName: fc.string({ minLength: 1, maxLength: 20 }),
        mimeType: fc.constantFrom('application/pdf', 'text/plain'),
        size: fc.integer({ min: 100, max: 1000 }),
        content: fc.string({ minLength: 10, maxLength: 100 })
      }),
      fc.array(fc.constantFrom(
        'uploaded', 'analyzing', 'analyzed', 'fixing', 'fixed', 'error'
      ), { minLength: 1, maxLength: 5 }),
      (input, statusSequence) => {
        const document = DocumentModel.create(input as DocumentCreateInput);
        let currentStatus = document.status;
        
        for (const newStatus of statusSequence) {
          const canTransition = DocumentModel.canTransitionTo(
            currentStatus, 
            newStatus as Document['status']
          );
          
          if (canTransition) {
            const updatedDoc = DocumentModel.updateStatus(document.id, newStatus as Document['status']);
            expect(updatedDoc).toBeDefined();
            expect(updatedDoc!.status).toBe(newStatus);
            currentStatus = newStatus as Document['status'];
          } else {
            // Should throw error for invalid transition
            expect(() => {
              DocumentModel.updateStatus(document.id, newStatus as Document['status']);
            }).toThrow();
          }
        }
        
        return true;
      }
    ), { numRuns: 30 });
  });

  // Property test for document search
  test('Property 15.4: Document search returns consistent results', () => {
    fc.assert(fc.property(
      fc.array(fc.record({
        filename: fc.string({ minLength: 1, maxLength: 20 }),
        originalName: fc.string({ minLength: 1, maxLength: 20 }),
        mimeType: fc.constantFrom('application/pdf', 'text/plain'),
        size: fc.integer({ min: 100, max: 1000 }),
        content: fc.string({ minLength: 10, maxLength: 100 })
      }), { minLength: 1, maxLength: 10 }),
      fc.string({ minLength: 1, maxLength: 10 }),
      (documentInputs, searchTerm) => {
        // Create documents
        const documents = documentInputs.map(input => 
          DocumentModel.create(input as DocumentCreateInput)
        );
        
        // Search for documents
        const searchResults = DocumentModel.search(searchTerm);
        
        // Verify search results
        for (const result of searchResults) {
          const searchTermLower = searchTerm.toLowerCase();
          const matchesFilename = result.filename.toLowerCase().includes(searchTermLower);
          const matchesOriginalName = result.originalName.toLowerCase().includes(searchTermLower);
          const matchesContent = result.content.toLowerCase().includes(searchTermLower);
          
          expect(matchesFilename || matchesOriginalName || matchesContent).toBe(true);
        }
        
        // Verify all matching documents are included
        const allDocuments = DocumentModel.findAll();
        for (const doc of allDocuments) {
          const searchTermLower = searchTerm.toLowerCase();
          const shouldMatch = 
            doc.filename.toLowerCase().includes(searchTermLower) ||
            doc.originalName.toLowerCase().includes(searchTermLower) ||
            doc.content.toLowerCase().includes(searchTermLower);
          
          if (shouldMatch) {
            expect(searchResults.some(result => result.id === doc.id)).toBe(true);
          }
        }
        
        return true;
      }
    ), { numRuns: 25 });
  });

  // Property test for document statistics
  test('Property 15.5: Document statistics are accurate and consistent', () => {
    fc.assert(fc.property(
      fc.array(fc.record({
        filename: fc.string({ minLength: 1, maxLength: 20 }),
        originalName: fc.string({ minLength: 1, maxLength: 20 }),
        mimeType: fc.constantFrom('application/pdf', 'text/plain'),
        size: fc.integer({ min: 100, max: 1000 }),
        content: fc.string({ minLength: 10, maxLength: 100 }),
        status: fc.constantFrom('uploaded', 'analyzing', 'analyzed', 'fixing', 'fixed', 'error')
      }), { minLength: 0, maxLength: 15 }),
      (documentInputs) => {
        // Create documents
        const documents = documentInputs.map(input => {
          const doc = DocumentModel.create({
            filename: input.filename,
            originalName: input.originalName,
            mimeType: input.mimeType,
            size: input.size,
            content: input.content
          });
          
          DocumentModel.update(doc.id, { status: input.status as Document['status'] });
          return DocumentModel.findById(doc.id)!;
        });
        
        const stats = DocumentModel.getStatistics();
        
        // Verify statistics accuracy
        expect(stats.totalDocuments).toBe(documents.length);
        
        if (documents.length > 0) {
          const totalSize = documents.reduce((sum, doc) => sum + doc.size, 0);
          expect(stats.totalSize).toBe(totalSize);
          expect(stats.averageSize).toBe(totalSize / documents.length);
          
          // Verify status counts
          const statusCounts = documents.reduce((counts, doc) => {
            counts[doc.status] = (counts[doc.status] || 0) + 1;
            return counts;
          }, {} as Record<Document['status'], number>);
          
          for (const [status, count] of Object.entries(statusCounts)) {
            expect(stats.statusCounts[status as Document['status']]).toBe(count);
          }
          
          // Verify type counts
          const typeCounts = documents.reduce((counts, doc) => {
            counts[doc.mimeType] = (counts[doc.mimeType] || 0) + 1;
            return counts;
          }, {} as Record<string, number>);
          
          for (const [type, count] of Object.entries(typeCounts)) {
            expect(stats.typeCounts[type]).toBe(count);
          }
        } else {
          expect(stats.totalSize).toBe(0);
          expect(stats.averageSize).toBe(0);
          expect(stats.oldestDocument).toBeNull();
          expect(stats.newestDocument).toBeNull();
        }
        
        return true;
      }
    ), { numRuns: 20 });
  });

  // Property test for document size filtering
  test('Property 15.6: Document size filtering returns accurate results', () => {
    fc.assert(fc.property(
      fc.array(fc.record({
        filename: fc.string({ minLength: 1, maxLength: 20 }),
        originalName: fc.string({ minLength: 1, maxLength: 20 }),
        mimeType: fc.constantFrom('application/pdf', 'text/plain'),
        size: fc.integer({ min: 100, max: 10000 }),
        content: fc.string({ minLength: 10, maxLength: 100 })
      }), { minLength: 1, maxLength: 10 }),
      fc.option(fc.integer({ min: 500, max: 5000 })),
      fc.option(fc.integer({ min: 5000, max: 15000 })),
      (documentInputs, minSize, maxSize) => {
        // Create documents
        documentInputs.forEach(input => 
          DocumentModel.create(input as DocumentCreateInput)
        );
        
        // Filter by size
        const filteredDocs = DocumentModel.getDocumentsBySize(minSize, maxSize);
        
        // Verify filtering logic
        for (const doc of filteredDocs) {
          if (minSize !== undefined) {
            expect(doc.size).toBeGreaterThanOrEqual(minSize);
          }
          if (maxSize !== undefined) {
            expect(doc.size).toBeLessThanOrEqual(maxSize);
          }
        }
        
        // Verify completeness
        const allDocs = DocumentModel.findAll();
        for (const doc of allDocs) {
          const shouldInclude = 
            (minSize === undefined || doc.size >= minSize) &&
            (maxSize === undefined || doc.size <= maxSize);
          
          if (shouldInclude) {
            expect(filteredDocs.some(filtered => filtered.id === doc.id)).toBe(true);
          } else {
            expect(filteredDocs.some(filtered => filtered.id === doc.id)).toBe(false);
          }
        }
        
        return true;
      }
    ), { numRuns: 25 });
  });
});
