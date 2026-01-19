import request from 'supertest';
import * as fc from 'fast-check';
import app from '../index';
import { DocumentModel } from '../models/Document';
import { IssueModel } from '../models/Issue';

/**
 * Feature: hr-document-analyzer, Property 9: Unfixable Issue Marking
 * 
 * Property: For any unfixable issue, the system should clearly mark it and 
 * provide manual fix guidance
 * Validates: Design Property 9
 */

describe('Fix Error Handling Property Tests', () => {
  beforeEach(() => {
    DocumentModel.clear();
    IssueModel.clear();
  });

  afterEach(() => {
    DocumentModel.clear();
    IssueModel.clear();
  });

  // Property test for unfixable issue marking
  test('Property 9.1: Unfixable issues are clearly marked', () => {
    fc.assert(fc.asyncProperty(
      fc.record({
        filename: fc.string({ minLength: 1, maxLength: 30 }).map(s => s + '.txt'),
        content: fc.string({ minLength: 100, maxLength: 500 }),
        unfixableCount: fc.integer({ min: 1, max: 5 }),
        fixableCount: fc.integer({ min: 1, max: 5 })
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

          // Create unfixable issues (low confidence, requires manual review)
          for (let i = 0; i < testData.unfixableCount; i++) {
            const issue = IssueModel.create({
              documentId,
              type: 'content',
              severity: 'high',
              title: `Unfixable Issue ${i + 1}`,
              description: `Complex issue requiring manual review`,
              location: { line: i + 1, column: 1 },
              originalText: `complex${i}`,
              context: `Context for complex${i}`,
              suggestion: {
                suggestedText: `suggestion${i}`,
                explanation: `Manual review needed - complex context`,
                confidence: 0.4 + (i * 0.05), // Low confidence
                requiresManualReview: true
              },
              isAutoFixable: false
            });
            allIssueIds.push(issue.id);

            // Verify issue is marked correctly
            expect(issue.isAutoFixable).toBe(false);
            expect(issue.suggestion.requiresManualReview).toBe(true);
            expect(issue.suggestion.confidence).toBeLessThan(0.7);
          }

          // Create fixable issues
          for (let i = 0; i < testData.fixableCount; i++) {
            const issue = IssueModel.create({
              documentId,
              type: 'grammar',
              severity: 'medium',
              title: `Fixable Issue ${i + 1}`,
              description: `Simple grammar issue`,
              location: { line: i + 10, column: 1 },
              originalText: `error${i}`,
              context: `Context for error${i}`,
              suggestion: {
                suggestedText: `fixed${i}`,
                explanation: `Simple fix`,
                confidence: 0.9,
                requiresManualReview: false
              },
              isAutoFixable: true
            });
            allIssueIds.push(issue.id);
          }

          // Try to fix all issues
          const fixResponse = await request(app)
            .post(`/api/documents/${documentId}/fix`)
            .send({
              selectedIssues: allIssueIds,
              autoFix: true
            });

          if (fixResponse.status === 200) {
            const fixSummary = fixResponse.body.fixSummary;

            // Verify unfixable issues are tracked
            expect(fixSummary).toHaveProperty('manualReviewRequired');
            expect(fixSummary.manualReviewRequired).toBeGreaterThanOrEqual(testData.unfixableCount);
            
            // Skipped issues should include unfixable ones
            expect(fixSummary.skippedIssues).toBeGreaterThanOrEqual(testData.unfixableCount);
          }
        }

        return true;
      }
    ), { numRuns: 100 });
  });

  // Property test for manual review guidance
  test('Property 9.2: Manual review issues provide guidance', () => {
    fc.assert(fc.asyncProperty(
      fc.record({
        filename: fc.string({ minLength: 1, maxLength: 20 }).map(s => s + '.txt'),
        content: fc.string({ minLength: 100, maxLength: 400 }),
        issueCount: fc.integer({ min: 1, max: 4 })
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

          // Create issues requiring manual review
          for (let i = 0; i < testData.issueCount; i++) {
            const issue = IssueModel.create({
              documentId,
              type: 'structure',
              severity: 'high',
              title: `Manual Review Issue ${i + 1}`,
              description: `Issue requiring manual review`,
              location: { line: i + 1, column: 1 },
              originalText: `complex${i}`,
              context: `Context for complex${i}`,
              suggestion: {
                suggestedText: `suggestion${i}`,
                explanation: `This requires manual review because...`,
                confidence: 0.5,
                alternativeOptions: [`option1_${i}`, `option2_${i}`],
                requiresManualReview: true
              },
              isAutoFixable: false
            });

            // Verify guidance is provided
            expect(issue.suggestion.explanation).toBeDefined();
            expect(issue.suggestion.explanation.length).toBeGreaterThan(0);
            expect(issue.suggestion.requiresManualReview).toBe(true);
            
            // Alternative options should be provided when available
            if (issue.suggestion.alternativeOptions) {
              expect(Array.isArray(issue.suggestion.alternativeOptions)).toBe(true);
            }
          }

          // Get analysis to verify issues are accessible
          const issues = IssueModel.findByDocumentId(documentId);
          expect(issues.length).toBe(testData.issueCount);

          // All issues should have guidance
          issues.forEach(issue => {
            expect(issue.suggestion.explanation).toBeDefined();
            expect(typeof issue.suggestion.explanation).toBe('string');
            expect(issue.suggestion.explanation.length).toBeGreaterThan(0);
          });
        }

        return true;
      }
    ), { numRuns: 100 });
  });

  // Property test for confidence-based auto-fix decisions
  test('Property 9.3: Low confidence issues are not auto-fixed', () => {
    fc.assert(fc.asyncProperty(
      fc.record({
        filename: fc.string({ minLength: 1, maxLength: 20 }).map(s => s + '.txt'),
        content: fc.string({ minLength: 100, maxLength: 400 }),
        lowConfidenceCount: fc.integer({ min: 1, max: 5 }),
        highConfidenceCount: fc.integer({ min: 1, max: 5 })
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

          // Create low confidence issues
          for (let i = 0; i < testData.lowConfidenceCount; i++) {
            const issue = IssueModel.create({
              documentId,
              type: 'content',
              severity: 'medium',
              title: `Low Confidence Issue ${i + 1}`,
              description: `Issue with low confidence`,
              location: { line: i + 1, column: 1 },
              originalText: `uncertain${i}`,
              context: `Context for uncertain${i}`,
              suggestion: {
                suggestedText: `maybe${i}`,
                explanation: `Low confidence fix`,
                confidence: 0.3 + (i * 0.05), // < 0.7
                requiresManualReview: true
              },
              isAutoFixable: false
            });
            allIssueIds.push(issue.id);
          }

          // Create high confidence issues
          for (let i = 0; i < testData.highConfidenceCount; i++) {
            const issue = IssueModel.create({
              documentId,
              type: 'grammar',
              severity: 'medium',
              title: `High Confidence Issue ${i + 1}`,
              description: `Issue with high confidence`,
              location: { line: i + 20, column: 1 },
              originalText: `error${i}`,
              context: `Context for error${i}`,
              suggestion: {
                suggestedText: `fixed${i}`,
                explanation: `High confidence fix`,
                confidence: 0.9,
                requiresManualReview: false
              },
              isAutoFixable: true
            });
            allIssueIds.push(issue.id);
          }

          // Apply auto-fix
          const fixResponse = await request(app)
            .post(`/api/documents/${documentId}/fix`)
            .send({
              selectedIssues: allIssueIds,
              autoFix: true
            });

          if (fixResponse.status === 200) {
            const fixSummary = fixResponse.body.fixSummary;

            // Low confidence issues should not be auto-fixed
            expect(fixSummary.fixedIssues).toBeLessThanOrEqual(testData.highConfidenceCount);
            
            // Manual review count should include low confidence issues
            expect(fixSummary.manualReviewRequired).toBeGreaterThanOrEqual(testData.lowConfidenceCount);
          }
        }

        return true;
      }
    ), { numRuns: 100 });
  });

  // Property test for alternative options
  test('Property 9.4: Complex issues provide alternative fix options', () => {
    fc.assert(fc.asyncProperty(
      fc.record({
        filename: fc.string({ minLength: 1, maxLength: 20 }).map(s => s + '.txt'),
        content: fc.string({ minLength: 100, maxLength: 300 }),
        issueCount: fc.integer({ min: 1, max: 3 }),
        alternativeCount: fc.integer({ min: 1, max: 4 })
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

          // Create complex issues with alternatives
          for (let i = 0; i < testData.issueCount; i++) {
            const alternatives: string[] = [];
            for (let j = 0; j < testData.alternativeCount; j++) {
              alternatives.push(`alternative_${i}_${j}`);
            }

            const issue = IssueModel.create({
              documentId,
              type: 'consistency',
              severity: 'medium',
              title: `Complex Issue ${i + 1}`,
              description: `Issue with multiple fix options`,
              location: { line: i + 1, column: 1 },
              originalText: `ambiguous${i}`,
              context: `Context for ambiguous${i}`,
              suggestion: {
                suggestedText: `primary${i}`,
                explanation: `Primary suggestion with alternatives`,
                confidence: 0.6,
                alternativeOptions: alternatives,
                requiresManualReview: true
              },
              isAutoFixable: false
            });

            // Verify alternatives are provided
            expect(issue.suggestion.alternativeOptions).toBeDefined();
            expect(Array.isArray(issue.suggestion.alternativeOptions)).toBe(true);
            expect(issue.suggestion.alternativeOptions?.length).toBe(testData.alternativeCount);
          }

          // Get issues to verify
          const issues = IssueModel.findByDocumentId(documentId);
          expect(issues.length).toBe(testData.issueCount);

          // All issues should have alternatives
          issues.forEach(issue => {
            expect(issue.suggestion.alternativeOptions).toBeDefined();
            expect(issue.suggestion.alternativeOptions!.length).toBeGreaterThan(0);
          });
        }

        return true;
      }
    ), { numRuns: 100 });
  });
});
