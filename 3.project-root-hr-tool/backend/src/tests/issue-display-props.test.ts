import * as fc from 'fast-check';
import { IssueModel, Issue, IssueCreateInput } from '../models/Issue';

/**
 * Feature: hr-document-analyzer, Property 5: Issue Display Contains Complete Information
 * 
 * Property: For any detected issue, interface display should include 
 * issue description, location information and fix suggestion preview
 * Validates: Design Property 5
 */

describe('Issue Display Property Tests', () => {
  beforeEach(() => {
    IssueModel.clear();
  });

  afterEach(() => {
    IssueModel.clear();
  });

  // Property test for complete issue information display
  test('Property 5.1: Issue display contains all required information', () => {
    fc.assert(fc.property(
      fc.array(fc.record({
        documentId: fc.string({ minLength: 1, maxLength: 20 }),
        type: fc.constantFrom('grammar', 'format', 'consistency', 'structure', 'content'),
        severity: fc.constantFrom('low', 'medium', 'high', 'critical'),
        title: fc.string({ minLength: 1, maxLength: 100 }),
        description: fc.string({ minLength: 10, maxLength: 200 }),
        location: fc.record({
          page: fc.option(fc.integer({ min: 1, max: 100 })),
          line: fc.option(fc.integer({ min: 1, max: 1000 })),
          column: fc.option(fc.integer({ min: 1, max: 100 })),
          range: fc.option(fc.record({
            start: fc.integer({ min: 0, max: 1000 }),
            end: fc.integer({ min: 0, max: 1000 })
          }))
        }),
        originalText: fc.string({ minLength: 1, maxLength: 100 }),
        context: fc.string({ minLength: 10, maxLength: 200 }),
        suggestion: fc.record({
          suggestedText: fc.string({ minLength: 1, maxLength: 100 }),
          explanation: fc.string({ minLength: 10, maxLength: 200 }),
          confidence: fc.float({ min: 0, max: 1 }),
          alternativeOptions: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 50 }), { maxLength: 3 })),
          requiresManualReview: fc.boolean()
        }),
        isAutoFixable: fc.boolean()
      }), { minLength: 1, maxLength: 10 }),
      (issueInputs) => {
        // Create issues
        const issues = issueInputs.map(input => {
          // Ensure range is valid
          if (input.location.range) {
            const start = Math.min(input.location.range.start, input.location.range.end);
            const end = Math.max(input.location.range.start, input.location.range.end);
            input.location.range = { start, end };
          }
          
          return IssueModel.create(input as IssueCreateInput);
        });

        // Verify each issue contains complete information
        for (const issue of issues) {
          // Core issue information
          expect(issue.id).toBeDefined();
          expect(typeof issue.id).toBe('string');
          expect(issue.id.length).toBeGreaterThan(0);
          
          expect(issue.documentId).toBeDefined();
          expect(typeof issue.documentId).toBe('string');
          
          expect(issue.type).toBeDefined();
          expect(['grammar', 'format', 'consistency', 'structure', 'content']).toContain(issue.type);
          
          expect(issue.severity).toBeDefined();
          expect(['low', 'medium', 'high', 'critical']).toContain(issue.severity);
          
          expect(issue.title).toBeDefined();
          expect(typeof issue.title).toBe('string');
          expect(issue.title.length).toBeGreaterThan(0);
          
          expect(issue.description).toBeDefined();
          expect(typeof issue.description).toBe('string');
          expect(issue.description.length).toBeGreaterThan(0);

          // Location information
          expect(issue.location).toBeDefined();
          expect(typeof issue.location).toBe('object');

          // Original text and context
          expect(issue.originalText).toBeDefined();
          expect(typeof issue.originalText).toBe('string');
          
          expect(issue.context).toBeDefined();
          expect(typeof issue.context).toBe('string');

          // Fix suggestion information
          expect(issue.suggestion).toBeDefined();
          expect(issue.suggestion.id).toBeDefined();
          expect(typeof issue.suggestion.id).toBe('string');
          expect(issue.suggestion.suggestedText).toBeDefined();
          expect(typeof issue.suggestion.suggestedText).toBe('string');
          expect(issue.suggestion.explanation).toBeDefined();
          expect(typeof issue.suggestion.explanation).toBe('string');
          expect(typeof issue.suggestion.confidence).toBe('number');
          expect(issue.suggestion.confidence).toBeGreaterThanOrEqual(0);
          expect(issue.suggestion.confidence).toBeLessThanOrEqual(1);
          expect(typeof issue.suggestion.requiresManualReview).toBe('boolean');

          // Auto-fixable flag
          expect(typeof issue.isAutoFixable).toBe('boolean');
        }

        return true;
      }
    ), { numRuns: 20 });
  });
});
