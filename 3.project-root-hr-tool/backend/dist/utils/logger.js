"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const logLevel = process.env.LOG_LEVEL || 'info';
exports.logger = winston_1.default.createLogger({
    level: logLevel,
    format: winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.splat(), winston_1.default.format.json()),
    defaultMeta: { service: 'hr-document-analyzer' },
    transports: [
        new winston_1.default.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        new winston_1.default.transports.File({
            filename: 'logs/combined.log',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
    ],
});
// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
    exports.logger.add(new winston_1.default.transports.Console({
        format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple()),
    }));
}
// Sanitize sensitive information from logs
const sanitizeLogData = (data) => {
    if (typeof data !== 'object' || data === null) {
        return data;
    }
    const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'authorization'];
    const sanitized = { ...data };
    for (const key of Object.keys(sanitized)) {
        if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
            sanitized[key] = '[REDACTED]';
        }
        else if (typeof sanitized[key] === 'object') {
            sanitized[key] = sanitizeLogData(sanitized[key]);
        }
    }
    return sanitized;
};
// Override logger methods to sanitize data
const originalInfo = exports.logger.info.bind(exports.logger);
const originalError = exports.logger.error.bind(exports.logger);
const originalWarn = exports.logger.warn.bind(exports.logger);
const originalDebug = exports.logger.debug.bind(exports.logger);
exports.logger.info = (message, meta) => {
    return originalInfo(message, meta ? sanitizeLogData(meta) : undefined);
};
exports.logger.error = (message, meta) => {
    return originalError(message, meta ? sanitizeLogData(meta) : undefined);
};
exports.logger.warn = (message, meta) => {
    return originalWarn(message, meta ? sanitizeLogData(meta) : undefined);
};
exports.logger.debug = (message, meta) => {
    return originalDebug(message, meta ? sanitizeLogData(meta) : undefined);
};
//# sourceMappingURL=logger.js.map