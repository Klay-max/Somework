import * as fc from 'fast-check';
import { IssueModel, Issue, IssueCreateInput } from '../models/Issue';

/**
 * Feature: hr-document-analyzer, Property 4: Issues Sorted by Priority
 * 
 * Property: For any collection of issues, they should be sorted by severity 
 * in a consistent priority order (critical > high > medium > low)
 * Validates: Design Property 4
 */

describe('Issue Model Priority Property Tests', () => {
  beforeEach(() => {
    IssueModel.clear();
  });

  afterEach(() => {
    IssueModel.clear();
  });

  // Property test for issue priority sorting
  test('Property 4.1: Issues are consistently sorted by severity priority', () => {
    fc.assert(fc.property(
      fc.array(fc.record({
        documentId: fc.string({ minLength: 1, maxLength: 20 }),
        type: fc.constantFrom('grammar', 'format', 'consistency', 'structure', 'content'),
        severity: fc.constantFrom('low', 'medium', 'high', 'critical'),
        title: fc.string({ minLength: 1, maxLength: 50 }),
        description: fc.string({ minLength: 1, maxLength: 100 }),
        location: fc.record({
          page: fc.option(fc.integer({ min: 1, max: 100 })),
          line: fc.option(fc.integer({ min: 1, max: 1000 })),
          column: fc.option(fc.integer({ min: 1, max: 100 }))
        }),
        originalText: fc.string({ minLength: 1, maxLength: 50 }),
        context: fc.string({ minLength: 1, maxLength: 100 }),
        suggestion: fc.record({
          suggestedText: fc.string({ minLength: 1, maxLength: 50 }),
          explanation: fc.string({ minLength: 1, maxLength: 100 }),
          confidence: fc.float({ min: 0, max: 1 }),
          requiresManualReview: fc.boolean()
        }),
        isAutoFixable: fc.boolean()
      }), { minLength: 1, maxLength: 20 }),
      (issueInputs) => {
        // Create issues
        const issues = issueInputs.map(input => 
          IssueModel.create(input as IssueCreateInput)
        );
        
        // Sort by severity
        const sortedIssues = IssueModel.sortBySeverity(issues);
        
        // Verify sorting order
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        
        for (let i = 0; i < sortedIssues.length - 1; i++) {
          const currentSeverity = severityOrder[sortedIssues[i].severity];
          const nextSeverity = severityOrder[sortedIssues[i + 1].severity];
          
          expect(currentSeverity).toBeGreaterThanOrEqual(nextSeverity);
        }
        
        // Verify all issues are included
        expect(sortedIssues.length).toBe(issues.length);
        
        // Verify no issues are lost or duplicated
        const originalIds = issues.map(issue => issue.id).sort();
        const sortedIds = sortedIssues.map(issue => issue.id).sort();
        expect(sortedIds).toEqual(originalIds);
        
        return true;
      }
    ), { numRuns: 30 });
  });

  // Property test for issue type sorting
  test('Property 4.2: Issues can be sorted by type consistently', () => {
    fc.assert(fc.property(
      fc.array(fc.record({
        documentId: fc.string({ minLength: 1, maxLength: 20 }),
        type: fc.constantFrom('grammar', 'format', 'consistency', 'structure', 'content'),
        severity: fc.constantFrom('low', 'medium', 'high', 'critical'),
        title: fc.string({ minLength: 1, maxLength: 50 }),
        description: fc.string({ minLength: 1, maxLength: 100 }),
        location: fc.record({
          page: fc.option(fc.integer({ min: 1, max: 100 })),
          line: fc.option(fc.integer({ min: 1, max: 1000 }))
        }),
        originalText: fc.string({ minLength: 1, maxLength: 50 }),
        context: fc.string({ minLength: 1, maxLength: 100 }),
        suggestion: fc.record({
          suggestedText: fc.string({ minLength: 1, maxLength: 50 }),
          explanation: fc.string({ minLength: 1, maxLength: 100 }),
          confidence: fc.float({ min: 0, max: 1 }),
          requiresManualReview: fc.boolean()
        }),
        isAutoFixable: fc.boolean()
      }), { minLength: 1, maxLength: 15 }),
      (issueInputs) => {
        // Create issues
        const issues = issueInputs.map(input => 
          IssueModel.create(input as IssueCreateInput)
        );
        
        // Sort by type
        const sortedIssues = IssueModel.sortByType(issues);
        
        // Verify sorting order
        const typeOrder = { grammar: 1, format: 2, consistency: 3, structure: 4, content: 5 };
        
        for (let i = 0; i < sortedIssues.length - 1; i++) {
          const currentType = typeOrder[sortedIssues[i].type];
          const nextType = typeOrder[sortedIssues[i + 1].type];
          
          expect(currentType).toBeLessThanOrEqual(nextType);
        }
        
        // Verify completeness
        expect(sortedIssues.length).toBe(issues.length);
        
        return true;
      }
    ), { numRuns: 25 });
  });

  // Property test for issue confidence sorting
  test('Property 4.3: Issues can be sorted by confidence level', () => {
    fc.assert(fc.property(
      fc.array(fc.record({
        documentId: fc.string({ minLength: 1, maxLength: 20 }),
        type: fc.constantFrom('grammar', 'format', 'consistency', 'structure', 'content'),
        severity: fc.constantFrom('low', 'medium', 'high', 'critical'),
        title: fc.string({ minLength: 1, maxLength: 50 }),
        description: fc.string({ minLength: 1, maxLength: 100 }),
        location: fc.record({
          page: fc.option(fc.integer({ min: 1, max: 100 }))
        }),
        originalText: fc.string({ minLength: 1, maxLength: 50 }),
        context: fc.string({ minLength: 1, maxLength: 100 }),
        suggestion: fc.record({
          suggestedText: fc.string({ minLength: 1, maxLength: 50 }),
          explanation: fc.string({ minLength: 1, maxLength: 100 }),
          confidence: fc.float({ min: 0, max: 1 }),
          requiresManualReview: fc.boolean()
        }),
        isAutoFixable: fc.boolean()
      }), { minLength: 1, maxLength: 15 }),
      (issueInputs) => {
        // Create issues
        const issues = issueInputs.map(input => 
          IssueModel.create(input as IssueCreateInput)
        );
        
        // Sort by confidence
        const sortedIssues = IssueModel.sortByConfidence(issues);
        
        // Verify sorting order (highest confidence first)
        for (let i = 0; i < sortedIssues.length - 1; i++) {
          const currentConfidence = sortedIssues[i].suggestion.confidence;
          const nextConfidence = sortedIssues[i + 1].suggestion.confidence;
          
          expect(currentConfidence).toBeGreaterThanOrEqual(nextConfidence);
        }
        
        // Verify completeness
        expect(sortedIssues.length).toBe(issues.length);
        
        return true;
      }
    ), { numRuns: 25 });
  });

  // Property test for issue location sorting
  test('Property 4.4: Issues can be sorted by document location', () => {
    fc.assert(fc.property(
      fc.array(fc.record({
        documentId: fc.string({ minLength: 1, maxLength: 20 }),
        type: fc.constantFrom('grammar', 'format', 'consistency', 'structure', 'content'),
        severity: fc.constantFrom('low', 'medium', 'high', 'critical'),
        title: fc.string({ minLength: 1, maxLength: 50 }),
        description: fc.string({ minLength: 1, maxLength: 100 }),
        location: fc.record({
          page: fc.option(fc.integer({ min: 1, max: 10 })),
          line: fc.option(fc.integer({ min: 1, max: 100 })),
          column: fc.option(fc.integer({ min: 1, max: 50 }))
        }),
        originalText: fc.string({ minLength: 1, maxLength: 50 }),
        context: fc.string({ minLength: 1, maxLength: 100 }),
        suggestion: fc.record({
          suggestedText: fc.string({ minLength: 1, maxLength: 50 }),
          explanation: fc.string({ minLength: 1, maxLength: 100 }),
          confidence: fc.float({ min: 0, max: 1 }),
          requiresManualReview: fc.boolean()
        }),
        isAutoFixable: fc.boolean()
      }), { minLength: 1, maxLength: 15 }),
      (issueInputs) => {
        // Create issues
        const issues = issueInputs.map(input => 
          IssueModel.create(input as IssueCreateInput)
        );
        
        // Sort by location
        const sortedIssues = IssueModel.sortByLocation(issues);
        
        // Verify sorting order (page, then line, then column)
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

  // Property test for issue filtering
  test('Property 4.5: Issue filtering returns accurate subsets', () => {
    fc.assert(fc.property(
      fc.array(fc.record({
        documentId: fc.string({ minLength: 1, maxLength: 20 }),
        type: fc.constantFrom('grammar', 'format', 'consistency', 'structure', 'content'),
        severity: fc.constantFrom('low', 'medium', 'high', 'critical'),
        title: fc.string({ minLength: 1, maxLength: 50 }),
        description: fc.string({ minLength: 1, maxLength: 100 }),
        location: fc.record({
          page: fc.option(fc.integer({ min: 1, max: 10 }))
        }),
        originalText: fc.string({ minLength: 1, maxLength: 50 }),
        context: fc.string({ minLength: 1, maxLength: 100 }),
        suggestion: fc.record({
          suggestedText: fc.string({ minLength: 1, maxLength: 50 }),
          explanation: fc.string({ minLength: 1, maxLength: 100 }),
          confidence: fc.float({ min: 0, max: 1 }),
          requiresManualReview: fc.boolean()
        }),
        isAutoFixable: fc.boolean()
      }), { minLength: 1, maxLength: 20 }),
      fc.constantFrom('grammar', 'format', 'consistency', 'structure', 'content'),
      fc.constantFrom('low', 'medium', 'high', 'critical'),
      (issueInputs, filterType, filterSeverity) => {
        // Create issues
        const issues = issueInputs.map(input => 
          IssueModel.create(input as IssueCreateInput)
        );
        
        // Filter by type
        const typeFiltered = IssueModel.filterByType(issues, filterType as Issue['type']);
        
        // Verify type filtering
        for (const issue of typeFiltered) {
          expect(issue.type).toBe(filterType);
        }
        
        // Verify completeness of type filtering
        const expectedTypeCount = issues.filter(issue => issue.type === filterType).length;
        expect(typeFiltered.length).toBe(expectedTypeCount);
        
        // Filter by severity
        const severityFiltered = IssueModel.filterBySeverity(issues, filterSeverity as Issue['severity']);
        
        // Verify severity filtering
        for (const issue of severityFiltered) {
          expect(issue.severity).toBe(filterSeverity);
        }
        
        // Verify completeness of severity filtering
        const expectedSeverityCount = issues.filter(issue => issue.severity === filterSeverity).length;
        expect(severityFiltered.length).toBe(expectedSeverityCount);
        
        return true;
      }
    ), { numRuns: 25 });
  });

  // Property test for issue statistics
  test('Property 4.6: Issue statistics are accurate and comprehensive', () => {
    fc.assert(fc.property(
      fc.array(fc.record({
        documentId: fc.string({ minLength: 1, maxLength: 20 }),
        type: fc.constantFrom('grammar', 'format', 'consistency', 'structure', 'content'),
        severity: fc.constantFrom('low', 'medium', 'high', 'critical'),
        title: fc.string({ minLength: 1, maxLength: 50 }),
        description: fc.string({ minLength: 1, maxLength: 100 }),
        location: fc.record({
          page: fc.option(fc.integer({ min: 1, max: 10 }))
        }),
        originalText: fc.string({ minLength: 1, maxLength: 50 }),
        context: fc.string({ minLength: 1, maxLength: 100 }),
        suggestion: fc.record({
          suggestedText: fc.string({ minLength: 1, maxLength: 50 }),
          explanation: fc.string({ minLength: 1, maxLength: 100 }),
          confidence: fc.float({ min: 0, max: 1 }),
          requiresManualReview: fc.boolean()
        }),
        isAutoFixable: fc.boolean()
      }), { minLength: 0, maxLength: 20 }),
      (issueInputs) => {
        // Create issues
        const issues = issueInputs.map(input => 
          IssueModel.create(input as IssueCreateInput)
        );
        
        const stats = IssueModel.getIssueStatistics(issues);
        
        // Verify basic statistics
        expect(stats.totalIssues).toBe(issues.length);
        
        if (issues.length > 0) {
          // Verify type counts
          const typeCounts = issues.reduce((counts, issue) => {
            counts[issue.type] = (counts[issue.type] || 0) + 1;
            return counts;
          }, {} as Record<Issue['type'], number>);
          
          for (const [type, count] of Object.entries(typeCounts)) {
            expect(stats.typeCounts[type as Issue['type']]).toBe(count);
          }
          
          // Verify severity counts
          const severityCounts = issues.reduce((counts, issue) => {
            counts[issue.severity] = (counts[issue.severity] || 0) + 1;
            return counts;
          }, {} as Record<Issue['severity'], number>);
          
          for (const [severity, count] of Object.entries(severityCounts)) {
            expect(stats.severityCounts[severity as Issue['severity']]).toBe(count);
          }
          
          // Verify auto-fixable count
          const autoFixableCount = issues.filter(issue => issue.isAutoFixable).length;
          expect(stats.autoFixableCount).toBe(autoFixableCount);
          
          // Verify manual review count
          const manualReviewCount = issues.filter(issue => issue.suggestion.requiresManualReview).length;
          expect(stats.manualReviewCount).toBe(manualReviewCount);
          
          // Verify average confidence
          const totalConfidence = issues.reduce((sum, issue) => sum + issue.suggestion.confidence, 0);
          const expectedAverage = totalConfidence / issues.length;
          expect(Math.abs(stats.averageConfidence - expectedAverage)).toBeLessThan(0.001);
          
          // Verify high priority count
          const highPriorityCount = issues.filter(issue => 
            issue.severity === 'critical' || issue.severity === 'high'
          ).length;
          expect(stats.highPriorityCount).toBe(highPriorityCount);
        } else {
          expect(stats.averageConfidence).toBe(0);
          expect(stats.autoFixableCount).toBe(0);
          expect(stats.manualReviewCount).toBe(0);
          expect(stats.highPriorityCount).toBe(0);
        }
        
        return true;
      }
    ), { numRuns: 25 });
  });
});
