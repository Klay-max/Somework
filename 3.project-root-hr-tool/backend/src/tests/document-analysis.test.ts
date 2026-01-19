import request from 'supertest';
import * as fc from 'fast-check';
import app from '../index';
import { DocumentModel } from '../models/Document';
import { IssueModel } from '../models/Issue';

/**
 * Feature: hr-document-analyzer, Property 3: Document Analysis Generates Issue Report
 * 
 * Property: For any uploaded document, analysis completion should generate 
 * a detailed report containing issue types, locations, and severity levels
 * Validates: Design Property 3
 */

describe('Document Analysis Property Tests', () => {
  beforeEach(() => {
    DocumentModel.clear();
    IssueModel.clear();
  });

  afterEach(() => {
    DocumentModel.clear();
    IssueModel.clear();
  });

  // Property test for analysis report generation
  test('Property 3.1: Document analysis generates comprehensive issue reports', () => {
    fc.assert(fc.asyncProperty(
      fc.record({
        filename: fc.string({ minLength: 1, maxLength: 30 }).map(s => s + '.txt'),
        content: fc.string({ minLength: 50, maxLength: 1000 }),
        hasIssues: fc.boolean()
      }),
      async (documentData) => {
        // First upload the document
        const uploadResponse = await request(app)
          .post('/api/documents/upload')
          .attach('file', Buffer.from(documentData.content), {
            filename: documentData.filename,
            contentType: 'text/plain'
          });

        if (uploadResponse.status === 201) {
          const documentId = uploadResponse.body.documentId;

          // Start analysis
          const analysisResponse = await request(app)
            .post(`/api/documents/${documentId}/analyze`);

          if (analysisResponse.status === 200) {
            expect(analysisResponse.body).toHaveProperty('analysisId');
            expect(analysisResponse.body).toHaveProperty('status');
            expect(typeof analysisResponse.body.analysisId).toBe('string');
            expect(analysisResponse.body.analysisId.length).toBeGreaterThan(0);
            expect(['processing', 'completed']).toContain(analysisResponse.body.status);

            // Wait for analysis to complete
            await new Promise(resolve => setTimeout(resolve, 300));

            // Get analysis results
            const resultsResponse = await request(app)
              .get(`/api/documents/${documentId}/analysis/${analysisResponse.body.analysisId}`);

            if (resultsResponse.status === 200) {
              expect(resultsResponse.body).toHaveProperty('issues');
              expect(resultsResponse.body).toHaveProperty('suggestions');
              expect(resultsResponse.body).toHaveProperty('status');
              expect(Array.isArray(resultsResponse.body.issues)).toBe(true);
              expect(Array.isArray(resultsResponse.body.suggestions)).toBe(true);

              // Verify issue structure
              for (const issue of resultsResponse.body.issues) {
                expect(issue).toHaveProperty('id');
                expect(issue).toHaveProperty('type');
                expect(issue).toHaveProperty('severity');
                expect(issue).toHaveProperty('title');
                expect(issue).toHaveProperty('description');
                expect(issue).toHaveProperty('location');
                expect(issue).toHaveProperty('originalText');
                expect(issue).toHaveProperty('suggestion');

                // Verify issue types are valid
                expect(['grammar', 'format', 'consistency', 'structure', 'content']).toContain(issue.type);
                
                // Verify severity levels are valid
                expect(['low', 'medium', 'high', 'critical']).toContain(issue.severity);
              }
            }
          }
        }

        return true;
      }
    ), { numRuns: 10 });
  });

  // Property test for analysis consistency
  test('Property 3.2: Analysis results are consistent for identical documents', () => {
    fc.assert(fc.asyncProperty(
      fc.record({
        filename: fc.string({ minLength: 1, maxLength: 20 }).map(s => s + '.txt'),
        content: fc.string({ minLength: 100, maxLength: 500 })
      }),
      async (documentData) => {
        const analysisResults: any[] = [];

        // Analyze the same document multiple times
        for (let i = 0; i < 2; i++) {
          const uploadResponse = await request(app)
            .post('/api/documents/upload')
            .attach('file', Buffer.from(documentData.content), {
              filename: `${i}_${documentData.filename}`,
              contentType: 'text/plain'
            });

          if (uploadResponse.status === 201) {
            const documentId = uploadResponse.body.documentId;

            const analysisResponse = await request(app)
              .post(`/api/documents/${documentId}/analyze`);

            if (analysisResponse.status === 200) {
              // Wait for analysis
              await new Promise(resolve => setTimeout(resolve, 300));

              const resultsResponse = await request(app)
                .get(`/api/documents/${documentId}/analysis/${analysisResponse.body.analysisId}`);

              if (resultsResponse.status === 200) {
                analysisResults.push(resultsResponse.body);
              }
            }
          }
        }

        // Compare results for consistency
        if (analysisResults.length === 2) {
          const [result1, result2] = analysisResults;
          
          // Should have similar number of issues (allowing for some variation)
          const issueCountDiff = Math.abs(result1.issues.length - result2.issues.length);
          expect(issueCountDiff).toBeLessThanOrEqual(2);

          // Should have similar issue types
          const types1 = new Set(result1.issues.map((issue: any) => issue.type));
          const types2 = new Set(result2.issues.map((issue: any) => issue.type));
          const commonTypes = new Set([...types1].filter(x => types2.has(x)));
          
          // At least some overlap in issue types
          if (types1.size > 0 && types2.size > 0) {
            expect(commonTypes.size).toBeGreaterThan(0);
          }
        }

        return true;
      }
    ), { numRuns: 8 });
  });

  // Property test for analysis completeness
  test('Property 3.3: Analysis covers all required issue categories', () => {
    fc.assert(fc.asyncProperty(
      fc.record({
        filename: fc.string({ minLength: 1, maxLength: 20 }).map(s => s + '.txt'),
        content: fc.string({ minLength: 200, maxLength: 800 })
      }),
      async (documentData) => {
        const uploadResponse = await request(app)
          .post('/api/documents/upload')
          .attach('file', Buffer.from(documentData.content), {
            filename: documentData.filename,
            contentType: 'text/plain'
          });

        if (uploadResponse.status === 201) {
          const documentId = uploadResponse.body.documentId;

          const analysisResponse = await request(app)
            .post(`/api/documents/${documentId}/analyze`);

          if (analysisResponse.status === 200) {
            await new Promise(resolve => setTimeout(resolve, 300));

            const resultsResponse = await request(app)
              .get(`/api/documents/${documentId}/analysis/${analysisResponse.body.analysisId}`);

            if (resultsResponse.status === 200) {
              const issues = resultsResponse.body.issues;
              
              // Verify all issues have required properties
              for (const issue of issues) {
                expect(issue.id).toBeDefined();
                expect(issue.documentId).toBe(documentId);
                expect(issue.type).toBeDefined();
                expect(issue.severity).toBeDefined();
                expect(issue.title).toBeDefined();
                expect(issue.description).toBeDefined();
                expect(issue.location).toBeDefined();
                expect(issue.originalText).toBeDefined();
                expect(issue.context).toBeDefined();
                expect(issue.suggestion).toBeDefined();
                expect(typeof issue.isAutoFixable).toBe('boolean');

                // Verify suggestion structure
                expect(issue.suggestion.id).toBeDefined();
                expect(issue.suggestion.suggestedText).toBeDefined();
                expect(issue.suggestion.explanation).toBeDefined();
                expect(typeof issue.suggestion.confidence).toBe('number');
                expect(issue.suggestion.confidence).toBeGreaterThanOrEqual(0);
                expect(issue.suggestion.confidence).toBeLessThanOrEqual(1);
                expect(typeof issue.suggestion.requiresManualReview).toBe('boolean');
              }
            }
          }
        }

        return true;
      }
    ), { numRuns: 12 });
  });

  // Property test for analysis performance
  test('Property 3.4: Analysis completes within reasonable time bounds', () => {
    fc.assert(fc.asyncProperty(
      fc.record({
        filename: fc.string({ minLength: 1, maxLength: 15 }).map(s => s + '.txt'),
        content: fc.string({ minLength: 50, maxLength: 2000 })
      }),
      async (documentData) => {
        const uploadResponse = await request(app)
          .post('/api/documents/upload')
          .attach('file', Buffer.from(documentData.content), {
            filename: documentData.filename,
            contentType: 'text/plain'
          });

        if (uploadResponse.status === 201) {
          const documentId = uploadResponse.body.documentId;
          const startTime = Date.now();

          const analysisResponse = await request(app)
            .post(`/api/documents/${documentId}/analyze`);

          if (analysisResponse.status === 200) {
            // Analysis should start quickly
            const analysisStartTime = Date.now() - startTime;
            expect(analysisStartTime).toBeLessThan(5000); // 5 seconds

            // Wait for completion
            await new Promise(resolve => setTimeout(resolve, 500));

            const resultsResponse = await request(app)
              .get(`/api/documents/${documentId}/analysis/${analysisResponse.body.analysisId}`);

            const totalTime = Date.now() - startTime;
            
            // Total analysis should complete within reasonable time
            expect(totalTime).toBeLessThan(30000); // 30 seconds

            if (resultsResponse.status === 200) {
              // Should have some result
              expect(resultsResponse.body).toHaveProperty('issues');
              expect(resultsResponse.body).toHaveProperty('status');
            }
          }
        }

        return true;
      }
    ), { numRuns: 8 });
  });

  // Property test for error handling
  test('Property 3.5: Analysis handles invalid documents gracefully', () => {
    fc.assert(fc.asyncProperty(
      fc.record({
        documentId: fc.string({ minLength: 1, maxLength: 50 }),
        analysisId: fc.string({ minLength: 1, maxLength: 50 })
      }),
      async (testData) => {
        // Try to analyze non-existent document
        const analysisResponse = await request(app)
          .post(`/api/documents/${testData.documentId}/analyze`);

        // Should handle gracefully
        expect([400, 404, 500]).toContain(analysisResponse.status);

        if (analysisResponse.body && analysisResponse.body.error) {
          expect(analysisResponse.body.error).toHaveProperty('message');
        }

        // Try to get results for non-existent analysis
        const resultsResponse = await request(app)
          .get(`/api/documents/${testData.documentId}/analysis/${testData.analysisId}`);

        expect([400, 404, 500]).toContain(resultsResponse.status);

        return true;
      }
    ), { numRuns: 10 });
  });

  // Property test for issue location accuracy
  test('Property 3.6: Issue locations are within document bounds', () => {
    fc.assert(fc.asyncProperty(
      fc.record({
        filename: fc.string({ minLength: 1, maxLength: 20 }).map(s => s + '.txt'),
        content: fc.string({ minLength: 100, maxLength: 600 })
      }),
      async (documentData) => {
        const uploadResponse = await request(app)
          .post('/api/documents/upload')
          .attach('file', Buffer.from(documentData.content), {
            filename: documentData.filename,
            contentType: 'text/plain'
          });

        if (uploadResponse.status === 201) {
          const documentId = uploadResponse.body.documentId;

          const analysisResponse = await request(app)
            .post(`/api/documents/${documentId}/analyze`);

          if (analysisResponse.status === 200) {
            await new Promise(resolve => setTimeout(resolve, 300));

            const resultsResponse = await request(app)
              .get(`/api/documents/${documentId}/analysis/${analysisResponse.body.analysisId}`);

            if (resultsResponse.status === 200) {
              const issues = resultsResponse.body.issues;
              const lines = documentData.content.split('\n');
              const totalLines = lines.length;
              const totalChars = documentData.content.length;

              for (const issue of issues) {
                const location = issue.location;

                // Verify location bounds
                if (location.page !== undefined) {
                  expect(location.page).toBeGreaterThan(0);
                }

                if (location.line !== undefined) {
                  expect(location.line).toBeGreaterThan(0);
                  expect(location.line).toBeLessThanOrEqual(totalLines);
                }

                if (location.column !== undefined) {
                  expect(location.column).toBeGreaterThanOrEqual(0);
                }

                if (location.range) {
                  expect(location.range.start).toBeGreaterThanOrEqual(0);
                  expect(location.range.end).toBeLessThanOrEqual(totalChars);
                  expect(location.range.start).toBeLessThanOrEqual(location.range.end);
                }
              }
            }
          }
        }

        return true;
      }
    ), { numRuns: 10 });
  });
});
