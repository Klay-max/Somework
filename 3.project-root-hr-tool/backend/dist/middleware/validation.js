"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeObject = exports.sanitizeInput = exports.filterSchema = exports.paginationSchema = exports.validateQuery = exports.validateFix = exports.validateAnalyze = exports.validateDocumentId = exports.validateUpload = void 0;
const joi_1 = __importDefault(require("joi"));
const errorHandler_1 = require("./errorHandler");
// Validation schemas
const uploadSchema = joi_1.default.object({
    file: joi_1.default.object().required(),
});
const analyzeSchema = joi_1.default.object({
    id: joi_1.default.string().required(),
});
const fixSchema = joi_1.default.object({
    selectedIssues: joi_1.default.array().items(joi_1.default.string()).required(),
    autoFix: joi_1.default.boolean().default(false),
});
// Validation middleware factory
const validate = (schema, source = 'body') => {
    return (req, res, next) => {
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
            return next((0, errorHandler_1.createError)('Validation failed', 400, 'VALIDATION_ERROR', { details }));
        }
        // Replace the original data with validated data
        if (source === 'body') {
            req.body = value;
        }
        else if (source === 'params') {
            req.params = value;
        }
        else {
            req.query = value;
        }
        next();
    };
};
// File upload validation
const validateUpload = (req, res, next) => {
    if (!req.file) {
        return next((0, errorHandler_1.createError)('No file uploaded', 400, 'NO_FILE'));
    }
    // Additional file validation
    const maxSize = parseInt(process.env.MAX_FILE_SIZE || '52428800'); // 50MB
    if (req.file.size > maxSize) {
        return next((0, errorHandler_1.createError)(`File size too large. Maximum size is ${maxSize / (1024 * 1024)}MB`, 400, 'FILE_TOO_LARGE'));
    }
    const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
    ];
    if (!allowedTypes.includes(req.file.mimetype)) {
        return next((0, errorHandler_1.createError)('Unsupported file type', 400, 'UNSUPPORTED_FILE_TYPE', { supportedTypes: allowedTypes }));
    }
    next();
};
exports.validateUpload = validateUpload;
// Document ID validation
const validateDocumentId = (req, res, next) => {
    const { id } = req.params;
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
        return next((0, errorHandler_1.createError)('Invalid document ID', 400, 'INVALID_DOCUMENT_ID'));
    }
    next();
};
exports.validateDocumentId = validateDocumentId;
// Analysis validation
exports.validateAnalyze = [
    exports.validateDocumentId,
    validate(analyzeSchema, 'params'),
];
// Fix validation
exports.validateFix = [
    exports.validateDocumentId,
    validate(fixSchema, 'body'),
];
// Query parameter validation
const validateQuery = (schema) => {
    return validate(schema, 'query');
};
exports.validateQuery = validateQuery;
// Common query schemas
exports.paginationSchema = joi_1.default.object({
    page: joi_1.default.number().integer().min(1).default(1),
    limit: joi_1.default.number().integer().min(1).max(100).default(10),
    sort: joi_1.default.string().valid('createdAt', 'updatedAt', 'name', 'size').default('createdAt'),
    order: joi_1.default.string().valid('asc', 'desc').default('desc'),
});
exports.filterSchema = joi_1.default.object({
    status: joi_1.default.string().valid('uploaded', 'analyzing', 'analyzed', 'fixing', 'fixed', 'error'),
    type: joi_1.default.string(),
    search: joi_1.default.string().max(100),
});
// Sanitization helpers
const sanitizeInput = (input) => {
    return input.trim().replace(/[<>]/g, '');
};
exports.sanitizeInput = sanitizeInput;
const sanitizeObject = (obj) => {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            sanitized[key] = (0, exports.sanitizeInput)(value);
        }
        else if (typeof value === 'object' && value !== null) {
            sanitized[key] = (0, exports.sanitizeObject)(value);
        }
        else {
            sanitized[key] = value;
        }
    }
    return sanitized;
};
exports.sanitizeObject = sanitizeObject;
//# sourceMappingURL=validation.js.map