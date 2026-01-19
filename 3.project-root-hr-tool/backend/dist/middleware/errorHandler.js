"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.notFoundHandler = exports.errorHandler = exports.createError = void 0;
const logger_1 = require("../utils/logger");
const createError = (message, statusCode = 500, code = 'INTERNAL_ERROR', details) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.code = code;
    error.details = details;
    error.isOperational = true;
    return error;
};
exports.createError = createError;
const errorHandler = (err, req, res, next) => {
    const error = err;
    // Default error values
    const statusCode = error.statusCode || 500;
    const code = error.code || 'INTERNAL_ERROR';
    const message = error.message || 'An unexpected error occurred';
    // Log error
    logger_1.logger.error('Error occurred', {
        statusCode,
        code,
        message,
        path: req.path,
        method: req.method,
        stack: error.stack,
        details: error.details,
    });
    // Send error response
    res.status(statusCode).json({
        error: {
            code,
            message,
            ...(process.env.NODE_ENV === 'development' && {
                stack: error.stack,
                details: error.details,
            }),
        },
    });
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res, next) => {
    const error = (0, exports.createError)(`Route not found: ${req.method} ${req.path}`, 404, 'NOT_FOUND');
    next(error);
};
exports.notFoundHandler = notFoundHandler;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
//# sourceMappingURL=errorHandler.js.map