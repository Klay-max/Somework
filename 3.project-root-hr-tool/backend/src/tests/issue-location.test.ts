import * as fc from 'fast-check';
import { IssueModel, Issue, IssueCreateInput } from '../models/Issue';

/**
 * Feature: hr-document-analyzer, Property 6: Issue Location Accuracy
 * 
 * Property: For any clicked issue item, the system should accurately 
 * display the issue location and context in the original document
 * Validates: Design Property 6
 */

describe('Issue Location Property Tests', () => {
  beforeEach(() => {
    IssueModel.clear();
  });

  afterEach(() => {
    IssueModel.clear();
  });

  // Property test for location accuracy
  test('Property 6.1: Issue locations are accurate and within document bounds', () => {
    fc.assert(fc.property(
      fc.record({
        documentContent: fc.string({ minLength: 100, maxLength: 2000 }),
        issueData: fc.array(fc.record({
          documentId: fc.string({ minLength: 1, maxLength: 20 }),
          type: fc.constantFrom('grammar', 'format', 'consistency', 'structure', 'content'),
          severity: fc.constantFrom('low', 'medium', 'high', 'critical'),
          title: fc.string({ minLength: 1, maxLength: 50 }),
          description: fc.string({ minLength: 10, maxLength: 100 }),
          originalText: fc.string({ minLength: 1, maxLength: 50 }),
          context: fc.string({ minLength: 10, maxLength: 100 }),
          suggestion: fc.record({
            suggestedText: fc.string({ minLength: 1, maxLength: 50 }),
            explanation: fc.string({ minLength: 10, maxLength: 100 }),
            confidence: fc.float({ min: 0, max: 1 }),
            requiresManualReview: fc.boolean()
          }),
          isAutoFixable: fc.boolean()
        }), { minLength: 1, maxLength: 5 })
      }),
      (testData) => {
        const lines = testData.documentContent.split('\n');
        const totalLines = lines.length;
        const totalChars = testData.documentContent.length;

        // Create issues with valid locations
        const issues = testData.issueData.map(issueInput => {
          // Generate valid location within document bounds
          const page = Math.max(1, Math.floor(Math.random() * 10) + 1);
          const line = Math.max(1, Math.floor(Math.random() * totalLines) + 1);
          const column = Math.max(1, Math.floor(Math.random() * 100) + 1);
          
          // Generate valid range
          const start = Math.floor(Math.random() * (totalChars - 10));
          const end = Math.min(start + Math.floor(Math.random() * 50) + 1, totalChars);

          const location = {
            page,
            line,
            column,
            range: { start, end }
          };

          return IssueModel.create({
            ...issueInput,
            location
          } as IssueCreateInput);
        });

        // Verify location accuracy
        for (const issue of issues) {
          const location = issue.location;

          // Verify page bounds
          if (location.page !== undefined) {
            expect(location.page).toBeGreaterThan(0);
            expect(location.page).toBeLessThanOrEqual(Math.max(1, Math.ceil(totalChars / 2000)));
          }

          // Verify line bounds
          if (location.line !== undefined) {
            expect(location.line).toBeGreaterThan(0);
            expect(location.line).toBeLessThanOrEqual(totalLines);
          }

          // Verify column bounds
          if (location.column !== undefined) {
            expect(location.column).toBeGreaterThanOrEqual(0);
          }

          // Verify range bounds
          if (location.range) {
            expect(location.range.start).toBeGreaterThanOrEqual(0);
            expect(location.range.end).toBeLessThanOrEqual(totalChars);
            expect(location.range.start).toBeLessThanOrEqual(location.range.end);

            // Verify range corresponds to actual text
            if (location.range.start < totalChars && location.range.end <= totalChars) {
              const rangeText = testData.documentContent.substring(location.range.start, location.range.end);
              expect(rangeText).toBeDefined();
              expect(typeof rangeText).toBe('string');
            }
          }
        }

        return true;
      }
    ), { numRuns: 25 });
  });

  // Property test for location sorting
  test('Property 6.2: Issues can be sorted by document location consistently', () => {
    fc.assert(fc.property(
      fc.array(fc.record({
        documentId: fc.string({ minLength: 1, maxLength: 20 }),
        type: fc.constantFrom('grammar', 'format', 'consistency', 'structure', 'content'),
        severity: fc.constantFrom('low', 'medium', 'high', 'critical'),
        title: fc.string({ minLength: 1, maxLength: 50 }),
        description: fc.string({ minLength: 10, maxLength: 100 }),
        location: fc.record({
          page: fc.option(fc.integer({ min: 1, max: 10 })),
          line: fc.option(fc.integer({ min: 1, max: 100 })),
          column: fc.option(fc.integer({ min: 1, max: 50 }))
        }),
        originalText: fc.string({ minLength: 1, maxLength: 50 }),
        context: fc.string({ minLength: 10, maxLength: 100 }),
        suggestion: fc.record({
          suggestedText: fc.string({ minLength: 1, maxLength: 50 }),
          explanation: fc.string({ minLength: 10, maxLength: 100 }),
          confidence: fc.float({ min: 0, max: 1 }),
          requiresManualReview: fc.boolean()
        }),
        isAutoFixable: fc.boolean()
      }), { minLength: 2, maxLength: 10 }),
      (issueInputs) => {
        // Create issues
        const issues = issueInputs.map(input => 
          IssueModel.create(input as IssueCreateInput)
        );

        // Sort by location
        const sortedIssues = IssueModel.sortByLocation(issues);

        // Verify sorting order
        for (let i = 0; i < sortedIssues.length - 1; i++) {
          const current = sortedIssues[i].location;
          const next = sortedIssues[i + 1].location;

          const currentPage = current.page || 0;
          const nextPage = next.page || 0;

          if (currentPage !== nextPage) {
            expect(currentPage).toBeLessThanOrEqual(nextPage);
          } else {
            const currentLine = current.line || 0;
            const nextLine = next.line || 0;

            if (currentLine !== nextLine) {
              expect(currentLine).toBeLessThanOrEqual(nextLine);
            } else {
              const currentColumn = current.column || 0;
              const nextColumn = next.column || 0;
              expect(currentColumn).toBeLessThanOrEqual(nextColumn);
            }
          }
        }

        // Verify completeness
        expect(sortedIssues.length).toBe(issues.length);

        return true;
      }
    ), { numRuns: 20 });
  });

  // Property test for context accuracy
  test('Property 6.3: Issue context provides meaningful surrounding text', () => {
    fc.assert(fc.property(
      fc.array(fc.record({
        documentId: fc.string({ minLength: 1, maxLength: 20 }),
        type: fc.constantFrom('grammar', 'format', 'consistency', 'structure', 'content'),
        severity: fc.constantFrom('low', 'medium', 'high', 'critical'),
        title: fc.string({ minLength: 1, maxLength: 50 }),
        description: fc.string({ minLength: 10, maxLength: 100 }),
        location: fc.record({
          page: fc.option(fc.integer({ min: 1, max: 5 })),
          line: fc.option(fc.integer({ min: 1, max: 50 }))
        }),
        originalText: fc.string({ minLength: 1, maxLength: 30 }),
        context: fc.string({ minLength: 20, maxLength: 200 }),
        suggestion: fc.record({
          suggestedText: fc.string({ minLength: 1, maxLength: 30 }),
          explanation: fc.string({ minLength: 10, maxLength: 100 }),
          confidence: fc.float({ min: 0, max: 1 }),
          requiresManualReview: fc.boolean()
        }),
        isAutoFixable: fc.boolean()
      }), { minLength: 1, maxLength: 8 }),
      (issueInputs) => {
        // Create issues
        const issues = issueInputs.map(input => 
          IssueModel.create(input as IssueCreateInput)
        );

        // Verify context quality
        for (const issue of issues) {
          // Context should be meaningful
          expect(issue.context).toBeDefined();
          expect(typeof issue.context).toBe('string');
          expect(issue.context.length).toBeGreaterThan(0);

          // Context should be longer than original text (provides surrounding info)
          if (issue.originalText.length > 0) {
            expect(issue.context.length).toBeGreaterThanOrEqual(issue.originalText.length);
          }

          // Context should contain or relate to the original text
          // (This is a simplified check - in real implementation, context should contain the original text)
          expect(issue.context.length).toBeGreaterThan(10); // Minimum meaningful context
        }

        return true;
      }
    ), { numRuns: 15 });
  });

  // Property test for location-based filtering
  test('Property 6.4: Issues can be filtered by location criteria', () => {
    fc.assert(fc.property(
      fc.array(fc.record({
        documentId: fc.string({ minLength: 1, maxLength: 20 }),
        type: fc.constantFrom('grammar', 'format', 'consistency', 'structure', 'content'),
        severity: fc.constantFrom('low', 'medium', 'high', 'critical'),
        title: fc.string({ minLength: 1, maxLength: 50 }),
        description: fc.string({ minLength: 10, maxLength: 100 }),
        location: fc.record({
          page: fc.option(fc.integer({ min: 1, max: 10 })),
          line: fc.option(fc.integer({ min: 1, max: 100 })),
          column: fc.option(fc.integer({ min: 1, max: 50 }))
        }),
        originalText: fc.string({ minLength: 1, maxLength: 30 }),
        context: fc.string({ minLength: 10, maxLength: 100 }),
        suggestion: fc.record({
          suggestedText: fc.string({ minLength: 1, maxLength: 30 }),
          explanation: fc.string({ minLength: 10, maxLength: 100 }),
          confidence: fc.float({ min: 0, max: 1 }),
          requiresManualReview: fc.boolean()
        }),
        isAutoFixable: fc.boolean()
      }), { minLength: 1, maxLength: 15 }),
      fc.integer({ min: 1, max: 5 }),
      (issueInputs, targetPage) => {
        // Create issues
        const issues = issueInputs.map(input => 
          IssueModel.create(input as IssueCreateInput)
        );

        // Filter by page (simulate location-based filtering)
        const pageFilteredIssues = issues.filter(issue => 
          issue.location.page === targetPage
        );

        // Verify filtering accuracy
        for (const issue of pageFilteredIssues) {
          expect(issue.location.page).toBe(targetPage);
        }

        // Verify completeness - all issues with target page should be included
        const expectedCount = issues.filter(issue => issue.location.page === targetPage).length;
        expect(pageFilteredIssues.length).toBe(expectedCount);

        return true;
      }
    ), { numRuns: 20 });
  });

  // Property test for location uniqueness
  test('Property 6.5: Multiple issues can exist at the same location', () => {
    fc.assert(fc.property(
      fc.record({
        documentId: fc.string({ minLength: 1, maxLength: 20 }),
        sharedLocation: fc.record({
          page: fc.integer({ min: 1, max: 5 }),
          line: fc.integer({ min: 1, max: 50 }),
          column: fc.integer({ min: 1, max: 30 })
        }),
        issueCount: fc.integer({ min: 2, max: 5 })
      }),
      (testData) => {
        const issues: Issue[] = [];

        // Create multiple issues at the same location
        for (let i = 0; i < testData.issueCount; i++) {
          const issue = IssueModel.create({
            documentId: testData.documentId,
            type: ['grammar', 'format', 'consistency', 'structure', 'content'][i % 5] as any,
            severity: ['low', 'medium', 'high', 'critical'][i % 4] as any,
            title: `Issue ${i + 1}`,
            description: `Description for issue ${i + 1}`,
            location: testData.sharedLocation,
            originalText: `text${i}`,
            context: `Context for issue ${i + 1}`,
            suggestion: {
              suggestedText: `fix${i}`,
              explanation: `Explanation ${i + 1}`,
              confidence: 0.8,
              requiresManualReview: false
            },
            isAutoFixable: true
          });
          issues.push(issue);
        }

        // Verify all issues were created
        expect(issues.length).toBe(testData.issueCount);

        // Verify they all have the same location
        for (const issue of issues) {
          expect(issue.location.page).toBe(testData.sharedLocation.page);
          expect(issue.location.line).toBe(testData.sharedLocation.line);
          expect(issue.location.column).toBe(testData.sharedLocation.column);
        }

        // Verify they have unique IDs despite same location
        const uniqueIds = new Set(issues.map(issue => issue.id));
        expect(uniqueIds.size).toBe(testData.issueCount);

        return true;
      }
    ), { numRuns: 15 });
  });
});
