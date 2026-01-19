import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { createError } from './errorHandler';

// Validation schemas
const uploadSchema = Joi.object({
  file: Joi.object().required(),
});

const analyzeSchema = Joi.object({
  id: Joi.string().required(),
});

const fixSchema = Joi.object({
  selectedIssues: Joi.array().items(Joi.string()).required(),
  autoFix: Joi.boolean().default(false),
});

// Validation middleware factory
const validate = (schema: Joi.ObjectSchema, source: 'body' | 'params' | 'query' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const data = source === 'body' ? req.body : source === 'params' ? req.params : req.query;
    
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return next(createError(
        'Validation failed',
        400,
        'VALIDATION_ERROR',
        { details }
      ));
    }

    // Replace the original data with validated data
    if (source === 'body') {
      req.body = value;
    } else if (source === 'params') {
      req.params = value;
    } else {
      req.query = value;
    }

    next();
  };
};

// File upload validation
export const validateUpload = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return next(createError('No file uploaded', 400, 'NO_FILE'));
  }

  // Additional file validation
  const maxSize = parseInt(process.env.MAX_FILE_SIZE || '52428800'); // 50MB
  if (req.file.size > maxSize) {
    return next(createError(
      `File size too large. Maximum size is ${maxSize / (1024 * 1024)}MB`,
      400,
      'FILE_TOO_LARGE'
    ));
  }

  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
  ];

  if (!allowedTypes.includes(req.file.mimetype)) {
    return next(createError(
      'Unsupported file type',
      400,
      'UNSUPPORTED_FILE_TYPE',
      { supportedTypes: allowedTypes }
    ));
  }

  next();
};

// Document ID validation
export const validateDocumentId = (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  
  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    return next(createError('Invalid document ID', 400, 'INVALID_DOCUMENT_ID'));
  }

  next();
};

// Analysis validation
export const validateAnalyze = [
  validateDocumentId,
  validate(analyzeSchema, 'params'),
];

// Fix validation
export const validateFix = [
  validateDocumentId,
  validate(fixSchema, 'body'),
];

// Query parameter validation
export const validateQuery = (schema: Joi.ObjectSchema) => {
  return validate(schema, 'query');
};

// Common query schemas
export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sort: Joi.string().valid('createdAt', 'updatedAt', 'name', 'size').default('createdAt'),
  order: Joi.string().valid('asc', 'desc').default('desc'),
});

export const filterSchema = Joi.object({
  status: Joi.string().valid('uploaded', 'analyzing', 'analyzed', 'fixing', 'fixed', 'error'),
  type: Joi.string(),
  search: Joi.string().max(100),
});

// Sanitization helpers
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const sanitizeObject = (obj: Record<string, any>): Record<string, any> => {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};