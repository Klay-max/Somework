import { DocumentModel } from '../models/Document';
import { IssueModel } from '../models/Issue';

// Global test setup
beforeAll(() => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.LOG_LEVEL = 'error';
  
  // Suppress console output during tests
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'info').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

beforeEach(() => {
  // Clear all models before each test
  DocumentModel.clear();
  IssueModel.clear();
});

afterAll(() => {
  // Restore console methods
  jest.restoreAllMocks();
});

// Mock external dependencies
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  unlinkSync: jest.fn(),
  existsSync: jest.fn(() => true),
  mkdirSync: jest.fn(),
  readdirSync: jest.fn(() => []),
  statSync: jest.fn(() => ({
    mtime: new Date(),
    isDirectory: () => false,
    isFile: () => true,
  })),
}));

jest.mock('mammoth', () => ({
  extractRawText: jest.fn(() => Promise.resolve({ value: 'Mock Word content' })),
}));

jest.mock('pdf-parse', () => 
  jest.fn(() => Promise.resolve({ text: 'Mock PDF content' }))
);

jest.mock('xlsx', () => ({
  readFile: jest.fn(() => ({
    SheetNames: ['Sheet1'],
    Sheets: {
      Sheet1: {},
    },
  })),
  utils: {
    sheet_to_csv: jest.fn(() => 'Mock Excel content'),
  },
}));

// Mock axios for API calls
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    post: jest.fn(() => Promise.resolve({ data: { issues: [] } })),
    get: jest.fn(() => Promise.resolve({ data: {} })),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  })),
}));

// Add custom matchers if needed
expect.extend({
  toBeValidDocument(received) {
    const pass = received && 
                 typeof received.id === 'string' &&
                 typeof received.filename === 'string' &&
                 typeof received.content === 'string' &&
                 received.uploadedAt instanceof Date;

    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid document`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid document`,
        pass: false,
      };
    }
  },
});

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidDocument(): R;
    }
  }
}