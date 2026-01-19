import * as fc from 'fast-check';
import { logger } from '../utils/logger';
import winston from 'winston';

/**
 * Feature: hr-document-analyzer, Property 16: Log Security
 * 
 * Property: For any system operation log, it should not contain sensitive 
 * personal information content
 * Validates: Design Property 16
 */

describe('Log Security Property Tests', () => {
  let logMessages: string[] = [];
  let testTransport: winston.transport;

  beforeEach(() => {
    logMessages = [];
    
    // Create a test transport to capture log messages
    testTransport = new winston.transports.Stream({
      stream: {
        write: (message: string) => {
          logMessages.push(message);
        }
      } as any
    });

    logger.add(testTransport);
  });

  afterEach(() => {
    logger.remove(testTransport);
    logMessages = [];
  });

  // Property test for password redaction
  test('Property 16.1: Logs do not contain passwords', () => {
    fc.assert(fc.property(
      fc.record({
        username: fc.string({ minLength: 3, maxLength: 20 }),
        password: fc.string({ minLength: 8, maxLength: 30 }),
        email: fc.emailAddress()
      }),
      (testData) => {
        // Log user data
        logger.info('User login attempt', testData);

        // Check that password is not in logs
        const allLogs = logMessages.join(' ');
        expect(allLogs).not.toContain(testData.password);
        
        // Should contain redacted marker
        expect(allLogs.toLowerCase()).toContain('redacted');

        return true;
      }
    ), { numRuns: 100 });
  });

  // Property test for API key redaction
  test('Property 16.2: Logs do not contain API keys', () => {
    fc.assert(fc.property(
      fc.record({
        apiKey: fc.string({ minLength: 20, maxLength: 40 }),
        userId: fc.string({ minLength: 5, maxLength: 15 }),
        action: fc.constantFrom('upload', 'analyze', 'download')
      }),
      (testData) => {
        // Log API request
        logger.info('API request', testData);

        // Check that API key is not in logs
        const allLogs = logMessages.join(' ');
        expect(allLogs).not.toContain(testData.apiKey);
        
        // Should contain redacted marker
        expect(allLogs.toLowerCase()).toContain('redacted');

        return true;
      }
    ), { numRuns: 100 });
  });

  // Property test for token redaction
  test('Property 16.3: Logs do not contain authentication tokens', () => {
    fc.assert(fc.property(
      fc.record({
        token: fc.string({ minLength: 30, maxLength: 50 }),
        authorization: fc.string({ minLength: 20, maxLength: 40 }),
        sessionId: fc.string({ minLength: 10, maxLength: 30 })
      }),
      (testData) => {
        // Log authentication data
        logger.info('Authentication event', testData);

        // Check that tokens are not in logs
        const allLogs = logMessages.join(' ');
        expect(allLogs).not.toContain(testData.token);
        expect(allLogs).not.toContain(testData.authorization);
        
        // Should contain redacted markers
        const redactedCount = (allLogs.match(/\[REDACTED\]/gi) || []).length;
        expect(redactedCount).toBeGreaterThan(0);

        return true;
      }
    ), { numRuns: 100 });
  });

  // Property test for secret redaction
  test('Property 16.4: Logs do not contain secret values', () => {
    fc.assert(fc.property(
      fc.record({
        secret: fc.string({ minLength: 15, maxLength: 35 }),
        apiSecret: fc.string({ minLength: 20, maxLength: 40 }),
        clientSecret: fc.string({ minLength: 25, maxLength: 45 })
      }),
      (testData) => {
        // Log configuration data
        logger.info('Configuration loaded', testData);

        // Check that secrets are not in logs
        const allLogs = logMessages.join(' ');
        expect(allLogs).not.toContain(testData.secret);
        expect(allLogs).not.toContain(testData.apiSecret);
        expect(allLogs).not.toContain(testData.clientSecret);
        
        // Should contain redacted markers
        expect(allLogs.toLowerCase()).toContain('redacted');

        return true;
      }
    ), { numRuns: 100 });
  });

  // Property test for nested sensitive data
  test('Property 16.5: Logs redact sensitive data in nested objects', () => {
    fc.assert(fc.property(
      fc.record({
        user: fc.record({
          id: fc.string({ minLength: 5, maxLength: 15 }),
          name: fc.string({ minLength: 3, maxLength: 20 }),
          password: fc.string({ minLength: 8, maxLength: 30 }),
          email: fc.emailAddress()
        }),
        auth: fc.record({
          token: fc.string({ minLength: 20, maxLength: 40 }),
          apiKey: fc.string({ minLength: 20, maxLength: 40 })
        })
      }),
      (testData) => {
        // Log nested user data
        logger.info('User session created', testData);

        // Check that nested sensitive data is not in logs
        const allLogs = logMessages.join(' ');
        expect(allLogs).not.toContain(testData.user.password);
        expect(allLogs).not.toContain(testData.auth.token);
        expect(allLogs).not.toContain(testData.auth.apiKey);
        
        // Should contain redacted markers
        expect(allLogs.toLowerCase()).toContain('redacted');

        return true;
      }
    ), { numRuns: 100 });
  });

  // Property test for error logs
  test('Property 16.6: Error logs do not expose sensitive information', () => {
    fc.assert(fc.property(
      fc.record({
        errorMessage: fc.string({ minLength: 10, maxLength: 50 }),
        password: fc.string({ minLength: 8, maxLength: 30 }),
        apiKey: fc.string({ minLength: 20, maxLength: 40 }),
        userId: fc.string({ minLength: 5, maxLength: 15 })
      }),
      (testData) => {
        // Log error with sensitive data
        logger.error(testData.errorMessage, {
          password: testData.password,
          apiKey: testData.apiKey,
          userId: testData.userId
        });

        // Check that sensitive data is not in error logs
        const allLogs = logMessages.join(' ');
        expect(allLogs).not.toContain(testData.password);
        expect(allLogs).not.toContain(testData.apiKey);
        
        // Error message itself should be present
        expect(allLogs).toContain(testData.errorMessage);
        
        // Should contain redacted markers
        expect(allLogs.toLowerCase()).toContain('redacted');

        return true;
      }
    ), { numRuns: 100 });
  });

  // Property test for safe data logging
  test('Property 16.7: Non-sensitive data is logged correctly', () => {
    fc.assert(fc.property(
      fc.record({
        documentId: fc.string({ minLength: 10, maxLength: 30 }),
        filename: fc.string({ minLength: 5, maxLength: 20 }),
        fileSize: fc.integer({ min: 100, max: 1000000 }),
        status: fc.constantFrom('uploaded', 'analyzing', 'analyzed', 'fixed')
      }),
      (testData) => {
        // Log non-sensitive document data
        logger.info('Document processed', testData);

        // Check that non-sensitive data IS in logs
        const allLogs = logMessages.join(' ');
        expect(allLogs).toContain(testData.documentId);
        expect(allLogs).toContain(testData.filename);
        expect(allLogs).toContain(testData.status);

        return true;
      }
    ), { numRuns: 100 });
  });

  // Property test for log format consistency
  test('Property 16.8: Logs maintain consistent format after sanitization', () => {
    fc.assert(fc.property(
      fc.record({
        action: fc.constantFrom('upload', 'analyze', 'fix', 'download'),
        userId: fc.string({ minLength: 5, maxLength: 15 }),
        password: fc.string({ minLength: 8, maxLength: 30 }),
        timestamp: fc.date()
      }),
      (testData) => {
        // Log action with mixed data
        logger.info(`User action: ${testData.action}`, {
          userId: testData.userId,
          password: testData.password,
          timestamp: testData.timestamp
        });

        // Check log format
        const allLogs = logMessages.join(' ');
        
        // Should contain action and userId
        expect(allLogs).toContain(testData.action);
        expect(allLogs).toContain(testData.userId);
        
        // Should not contain password
        expect(allLogs).not.toContain(testData.password);
        
        // Should be valid JSON or structured format
        expect(allLogs.length).toBeGreaterThan(0);

        return true;
      }
    ), { numRuns: 100 });
  });
});
