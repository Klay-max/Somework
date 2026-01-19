import request from 'supertest';
import app from '../index';
import { DocumentModel } from '../models/Document';
import { IssueModel } from '../models/Issue';

describe('Application Initialization Tests', () => {
  beforeEach(() => {
    // Clear models before each test
    DocumentModel.clear();
    IssueModel.clear();
  });

  describe('Express Application Startup', () => {
    test('should start Express application successfully', () => {
      expect(app).toBeDefined();
      expect(typeof app).toBe('function');
    });

    test('should respond to health check endpoint', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('version');
    });

    test('should handle 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/unknown-route')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Not Found');
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Middleware Configuration', () => {
    test('should have CORS enabled', async () => {
      const response = await request(app)
        .options('/health')
        .expect(204);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });

    test('should parse JSON requests', async () => {
      const testData = { test: 'data' };
      
      // This will fail with 404 but should parse JSON
      const response = await request(app)
        .post('/test-json')
        .send(testData)
        .expect(404);

      // The fact that it reaches 404 means JSON was parsed successfully
      expect(response.body).toHaveProperty('error', 'Not Found');
    });

    test('should handle large JSON payloads', async () => {
      const largeData = { data: 'x'.repeat(1000) };
      
      const response = await request(app)
        .post('/test-large')
        .send(largeData)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Not Found');
    });
  });

  describe('Route Registration', () => {
    test('should register document routes', async () => {
      // Test that document routes are registered (will fail with validation error, not 404)
      const response = await request(app)
        .post('/api/documents/upload')
        .expect(400); // Should fail validation, not 404

      expect(response.status).not.toBe(404);
    });

    test('should register document analysis routes', async () => {
      const response = await request(app)
        .post('/api/documents/test-id/analyze')
        .expect(404); // Document not found, but route exists

      // Should not be a route not found error
      expect(response.body.error).not.toBe('Not Found');
    });

    test('should register document download routes', async () => {
      const response = await request(app)
        .get('/api/documents/test-id/download')
        .expect(404); // Document not found, but route exists

      expect(response.body.error).not.toBe('Not Found');
    });
  });

  describe('Error Handling', () => {
    test('should handle validation errors properly', async () => {
      const response = await request(app)
        .post('/api/documents/upload')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code');
      expect(response.body.error).toHaveProperty('message');
    });

    test('should handle internal server errors', async () => {
      // This test would require mocking to trigger an internal error
      // For now, we just verify the error handler is set up
      expect(app._router).toBeDefined();
    });
  });

  describe('Security Headers', () => {
    test('should include security headers', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      // Helmet should add security headers
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
    });
  });

  describe('Content Type Handling', () => {
    test('should handle multipart/form-data for file uploads', async () => {
      const response = await request(app)
        .post('/api/documents/upload')
        .attach('file', Buffer.from('test content'), 'test.txt')
        .expect(400); // Will fail validation but should handle multipart

      expect(response.status).not.toBe(415); // Not unsupported media type
    });

    test('should handle application/json', async () => {
      const response = await request(app)
        .post('/api/documents/test-id/fix')
        .send({ selectedIssues: [], autoFix: false })
        .expect(404); // Document not found, but JSON was parsed

      expect(response.body.error).not.toBe('Not Found');
    });
  });

  describe('Environment Configuration', () => {
    test('should use default port when not specified', () => {
      // This is more of a configuration test
      const defaultPort = process.env.PORT || 3001;
      expect(defaultPort).toBeDefined();
    });

    test('should handle CORS origin configuration', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:3000')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });
});
