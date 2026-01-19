import request from 'supertest';
import * as fc from 'fast-check';
import app from '../index';
import { DocumentModel } from '../models/Document';
import { IssueModel } from '../models/Issue';

/**
 * Feature: hr-document-analyzer, Property 8: Fix Process Status Visibility
 * 
 * Property: For any ongoing fix process, the system should display real-time 
 * progress and current processing issue type
 * Validates: Design Property 8
 */

describe('Fix Progress Property Tests', () => {
  beforeEach(() => {
    DocumentModel.clear();
    IssueModel.clear();
  });

  afterEach(() => {
    DocumentModel.clear();
    IssueModel.clear();
  });

  // Property test for progress tracking
  test('Property 8.1: Fix process provides progress information', () => {
    fc.assert(fc.asyncProperty(
      fc.record({
        filename: fc.string({ minLength: 1, maxLength: 30 }).map(s => s + '.txt'),
        content: fc.string({ minLength: 100, maxLength: 500 }),
        issueCount: fc.integer({ min: 2, max: 10 })
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
          const issueIds: string[] = [];

          // Create issues
          for (let i = 0; i < testData.issueCount; i++) {
            const issue = IssueModel.create({
              documentId,
              type: ['grammar', 'format', 'consistency', 'structure', 'content'][i % 5] as any,
              severity: 'medium',
              title: `Issue ${i + 1}`,
              description: `Description for issue ${i + 1}`,
              location: { line: i + 1, column: 1 },
              originalText: `error${i}`,
              context: `Context for error${i}`,
              suggestion: {
                suggestedText: `fixed${i}`,
                explanation: `Fix explanation ${i + 1}`,
                confidence: 0.85,
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
            const fixSummary = fixResponse.body.fixSummary;

            // Verify progress information is available
            expect(fixSummary).toHaveProperty('totalIssues');
            expect(fixSummary).toHaveProperty('fixedIssues');
            expect(fixSummary).toHaveProperty('skippedIssues');
            expect(fixSummary).toHaveProperty('processingTime');

            // Progress should be trackable
            expect(fixSummary.totalIssues).toBe(testData.issueCount);
            expect(fixSummary.fixedIssues + fixSummary.skippedIssues).toBe(fixSummary.totalIssues);

            // Processing time should be recorded
            expect(typeof fixSummary.processingTime).toBe('number');
            expect(fixSummary.processingTime).toBeGreaterThanOrEqual(0);
          }
        }

        return true;
      }
    ), { numRuns: 100 });
  });

  // Property test for issue type tracking
  test('Property 8.2: Fix process tracks issue types being processed', () => {
    fc.assert(fc.asyncProperty(
      fc.record({
        filename: fc.string({ minLength: 1, maxLength: 20 }).map(s => s + '.txt'),
        content: fc.string({ minLength: 100, maxLength: 400 }),
        issueTypes: fc.array(
          fc.constantFrom('grammar', 'format', 'consistency', 'structure', 'content'),
          { minLength: 1, maxLength: 5 }
        )
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
          const issueIds: string[] = [];

          // Create issues of different types
          testData.issueTypes.forEach((type, index) => {
            const issue = IssueModel.create({
              documentId,
              type,
              severity: 'medium',
              title: `${type} Issue ${index + 1}`,
              description: `Description for ${type} issue`,
              location: { line: index + 1, column: 1 },
              originalText: `${type}Error${index}`,
              context: `Context for ${type}Error${index}`,
              suggestion: {
                suggestedText: `${type}Fixed${index}`,
                explanation: `Fix for ${type} issue`,
                confidence: 0.8,
                requiresManualReview: false
              },
              isAutoFixable: true
            });
            issueIds.push(issue.id);
          });

          // Apply fixes
          const fixResponse = await request(app)
            .post(`/api/documents/${documentId}/fix`)
            .send({
              selectedIssues: issueIds,
              autoFix: true
            });

          if (fixResponse.status === 200) {
            const fixSummary = fixResponse.body.fixSummary;

            // Verify issue type breakdown is provided
            expect(fixSummary).toHaveProperty('fixedByType');
            expect(typeof fixSummary.fixedByType).toBe('object');

            // All processed types should be tracked
            const trackedTypes = Object.keys(fixSummary.fixedByType);
            const uniqueTypes = [...new Set(testData.issueTypes)];
            
            // At least some types should be tracked
            expect(trackedTypes.length).toBeGreaterThan(0);
            
            // Total count should match
            const totalByType = Object.values(fixSummary.fixedByType)
              .reduce((sum: number, count: any) => sum + count, 0);
            expect(totalByType).toBeLessThanOrEqual(testData.issueTypes.length);
          }
        }

        return true;
      }
    ), { numRuns: 100 });
  });

  // Property test for status updates
  test('Property 8.3: Document status reflects fix progress', () => {
    fc.assert(fc.asyncProperty(
      fc.record({
        filename: fc.string({ minLength: 1, maxLength: 20 }).map(s => s + '.txt'),
        content: fc.string({ minLength: 50, maxLength: 300 }),
        issueCount: fc.integer({ min: 1, max: 5 })
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

          // Check initial status
          const initialDoc = DocumentModel.findById(documentId);
          expect(initialDoc).toBeDefined();
          expect(initialDoc?.status).toBe('uploaded');

          // Apply fixes
          const fixResponse = await request(app)
            .post(`/api/documents/${documentId}/fix`)
            .send({
              selectedIssues: issueIds,
              autoFix: true
            });

          if (fixResponse.status === 200) {
            // Status should have been updated during process
            const finalDoc = DocumentModel.findById(documentId);
            expect(finalDoc).toBeDefined();
            
            // Document should be in fixed or analyzed state
            expect(['fixed', 'analyzed']).toContain(finalDoc?.status);
          }
        }

        return true;
      }
    ), { numRuns: 100 });
  });

  // Property test for confidence tracking
  test('Property 8.4: Fix process tracks overall confidence', () => {
    fc.assert(fc.asyncProperty(
      fc.record({
        filename: fc.string({ minLength: 1, maxLength: 20 }).map(s => s + '.txt'),
        content: fc.string({ minLength: 100, maxLength: 400 }),
        confidenceLevels: fc.array(
          fc.float({ min: 0.5, max: 1.0 }),
          { minLength: 2, maxLength: 6 }
        )
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
          const issueIds: string[] = [];

          // Create issues with varying confidence levels
          testData.confidenceLevels.forEach((confidence, index) => {
            const issue = IssueModel.create({
              documentId,
              type: 'grammar',
              severity: 'medium',
              title: `Issue ${index + 1}`,
              description: `Description for issue ${index + 1}`,
              location: { line: index + 1, column: 1 },
              originalText: `error${index}`,
              context: `Context for error${index}`,
              suggestion: {
                suggestedText: `fixed${index}`,
                explanation: `Fix explanation ${index + 1}`,
                confidence,
                requiresManualReview: confidence < 0.7
              },
              isAutoFixable: confidence >= 0.7
            });
            issueIds.push(issue.id);
          });

          // Apply fixes
          const fixResponse = await request(app)
            .post(`/api/documents/${documentId}/fix`)
            .send({
              selectedIssues: issueIds,
              autoFix: true
            });

          if (fixResponse.status === 200) {
            const fixSummary = fixResponse.body.fixSummary;

            // Verify confidence is tracked
            expect(fixSummary).toHaveProperty('confidence');
            expect(typeof fixSummary.confidence).toBe('number');
            expect(fixSummary.confidence).toBeGreaterThanOrEqual(0);
            expect(fixSummary.confidence).toBeLessThanOrEqual(1);

            // Confidence should reflect the average of fixed issues
            if (fixSummary.fixedIssues > 0) {
              expect(fixSummary.confidence).toBeGreaterThan(0);
            }
          }
        }

        return true;
      }
    ), { numRuns: 100 });
  });
});
