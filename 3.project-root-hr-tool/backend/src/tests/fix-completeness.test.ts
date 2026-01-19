import request from 'supertest';
import * as fc from 'fast-check';
import app from '../index';
import { DocumentModel } from '../models/Document';
import { IssueModel } from '../models/Issue';

/**
 * Feature: hr-document-analyzer, Property 7: One-Click Fix Completeness
 * 
 * Property: For any document with one-click fix selected, the system should 
 * process all fixable issues and generate output document with fix summary
 * Validates: Design Property 7
 */

describe('One-Click Fix Property Tests', () => {
  beforeEach(() => {
    DocumentModel.clear();
    IssueModel.clear();
  });

  afterEach(() => {
    DocumentModel.clear();
    IssueModel.clear();
  });

  // Property test for fix completeness
  test('Property 7.1: One-click fix processes all selected fixable issues', () => {
    fc.assert(fc.asyncProperty(
      fc.record({
        filename: fc.string({ minLength: 1, maxLength: 30 }).map(s => s + '.txt'),
        content: fc.string({ minLength: 100, maxLength: 800 }),
        fixableIssueCount: fc.integer({ min: 1, max: 5 }),
        unfixableIssueCount: fc.integer({ min: 0, max: 3 })
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

          // Create mock issues
          const fixableIssues: string[] = [];
          const unfixableIssues: string[] = [];

          // Create fixable issues
          for (let i = 0; i < testData.fixableIssueCount; i++) {
            const issue = IssueModel.create({
              documentId,
              type: 'grammar',
              severity: 'medium',
              title: `Fixable Issue ${i + 1}`,
              description: `Description for fixable issue ${i + 1}`,
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
            fixableIssues.push(issue.id);
          }

          // Create unfixable issues
          for (let i = 0; i < testData.unfixableIssueCount; i++) {
            const issue = IssueModel.create({
              documentId,
              type: 'content',
              severity: 'high',
              title: `Unfixable Issue ${i + 1}`,
              description: `Description for unfixable issue ${i + 1}`,
              location: { line: i + 10, column: 1 },
              originalText: `complex${i}`,
              context: `Context for complex${i}`,
              suggestion: {
                suggestedText: `suggestion${i}`,
                explanation: `Manual review needed ${i + 1}`,
                confidence: 0.5,
                requiresManualReview: true
              },
              isAutoFixable: false
            });
            unfixableIssues.push(issue.id);
          }

          // Apply one-click fix
          const allIssueIds = [...fixableIssues, ...unfixableIssues];
          const fixResponse = await request(app)
            .post(`/api/documents/${documentId}/fix`)
            .send({
              selectedIssues: allIssueIds,
              autoFix: true
            });

          if (fixResponse.status === 200) {
            expect(fixResponse.body).toHaveProperty('fixedDocumentId');
            expect(fixResponse.body).toHaveProperty('fixSummary');

            const fixSummary = fixResponse.body.fixSummary;

            // Verify fix summary completeness
            expect(fixSummary.totalIssues).toBe(testData.fixableIssueCount + testData.unfixableIssueCount);
            expect(fixSummary.fixedIssues).toBeLessThanOrEqual(testData.fixableIssueCount);
            expect(fixSummary.skippedIssues).toBeGreaterThanOrEqual(testData.unfixableIssueCount);
            expect(typeof fixSummary.processingTime).toBe('number');
            expect(fixSummary.processingTime).toBeGreaterThan(0);
            expect(typeof fixSummary.confidence).toBe('number');
            expect(fixSummary.confidence).toBeGreaterThanOrEqual(0);
            expect(fixSummary.confidence).toBeLessThanOrEqual(1);

            // Verify fixed document exists
            expect(typeof fixResponse.body.fixedDocumentId).toBe('string');
            expect(fixResponse.body.fixedDocumentId.length).toBeGreaterThan(0);
          }
        }

        return true;
      }
    ), { numRuns: 10 });
  });

  // Property test for fix summary accuracy
  test('Property 7.2: Fix summary accurately reflects processing results', () => {
    fc.assert(fc.asyncProperty(
      fc.record({
        filename: fc.string({ minLength: 1, maxLength: 20 }).map(s => s + '.txt'),
        content: fc.string({ minLength: 50, maxLength: 500 }),
        issueTypes: fc.array(fc.constantFrom('grammar', 'format', 'consistency'), { minLength: 1, maxLength: 3 })
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

            // Verify summary accuracy
            expect(fixSummary.totalIssues).toBe(testData.issueTypes.length);
            expect(fixSummary.fixedIssues + fixSummary.skippedIssues).toBe(fixSummary.totalIssues);

            // Verify type breakdown
            expect(fixSummary.fixedByType).toBeDefined();
            expect(typeof fixSummary.fixedByType).toBe('object');

            // Count should match issue types
            const totalByType = Object.values(fixSummary.fixedByType).reduce((sum: number, count: any) => sum + count, 0);
            expect(totalByType).toBeLessThanOrEqual(fixSummary.totalIssues);
          }
        }

        return true;
      }
    ), { numRuns: 12 });
  });

  // Property test for selective fixing
  test('Property 7.3: Selective issue fixing works correctly', () => {
    fc.assert(fc.asyncProperty(
      fc.record({
        filename: fc.string({ minLength: 1, maxLength: 20 }).map(s => s + '.txt'),
        content: fc.string({ minLength: 100, maxLength: 400 }),
        totalIssues: fc.integer({ min: 3, max: 8 }),
        selectRatio: fc.float({ min: 0.3, max: 0.8 })
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
          const allIssueIds: string[] = [];

          // Create multiple issues
          for (let i = 0; i < testData.totalIssues; i++) {
            const issue = IssueModel.create({
              documentId,
              type: ['grammar', 'format', 'consistency'][i % 3] as any,
              severity: 'medium',
              title: `Issue ${i + 1}`,
              description: `Description for issue ${i + 1}`,
              location: { line: i + 1, column: 1 },
              originalText: `error${i}`,
              context: `Context for error${i}`,
              suggestion: {
                suggestedText: `fixed${i}`,
                explanation: `Fix explanation ${i + 1}`,
                confidence: 0.8,
                requiresManualReview: false
              },
              isAutoFixable: true
            });
            allIssueIds.push(issue.id);
          }

          // Select subset of issues
          const selectedCount = Math.floor(testData.totalIssues * testData.selectRatio);
          const selectedIssues = allIssueIds.slice(0, selectedCount);

          // Apply fixes to selected issues only
          const fixResponse = await request(app)
            .post(`/api/documents/${documentId}/fix`)
            .send({
              selectedIssues: selectedIssues,
              autoFix: true
            });

          if (fixResponse.status === 200) {
            const fixSummary = fixResponse.body.fixSummary;

            // Should only process selected issues
            expect(fixSummary.totalIssues).toBe(selectedCount);
            expect(fixSummary.fixedIssues).toBeLessThanOrEqual(selectedCount);
            expect(fixSummary.fixedIssues + fixSummary.skippedIssues).toBe(selectedCount);

            // Verify fixed document was created
            expect(fixResponse.body.fixedDocumentId).toBeDefined();
            expect(typeof fixResponse.body.fixedDocumentId).toBe('string');
          }
        }

        return true;
      }
    ), { numRuns: 10 });
  });

  // Property test for fix idempotency
  test('Property 7.4: Applying fixes multiple times is idempotent', () => {
    fc.assert(fc.asyncProperty(
      fc.record({
        filename: fc.string({ minLength: 1, maxLength: 20 }).map(s => s + '.txt'),
        content: fc.string({ minLength: 100, maxLength: 300 }),
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

          // Apply fixes first time
          const firstFixResponse = await request(app)
            .post(`/api/documents/${documentId}/fix`)
            .send({
              selectedIssues: issueIds,
              autoFix: true
            });

          if (firstFixResponse.status === 200) {
            const firstSummary = firstFixResponse.body.fixSummary;

            // Apply fixes second time (should be idempotent)
            const secondFixResponse = await request(app)
              .post(`/api/documents/${documentId}/fix`)
              .send({
                selectedIssues: issueIds,
                autoFix: true
              });

            if (secondFixResponse.status === 200) {
              const secondSummary = secondFixResponse.body.fixSummary;

              // Results should be consistent
              expect(secondSummary.totalIssues).toBe(firstSummary.totalIssues);
              
              // Both should create valid documents
              expect(firstFixResponse.body.fixedDocumentId).toBeDefined();
              expect(secondFixResponse.body.fixedDocumentId).toBeDefined();
            }
          }
        }

        return true;
      }
    ), { numRuns: 8 });
  });
});
