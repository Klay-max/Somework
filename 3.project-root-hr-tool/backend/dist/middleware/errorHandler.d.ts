import { Request, Response, NextFunction } from 'express';
export interface AppError extends Error {
    statusCode: number;
    code: string;
    details?: any;
    isOperational: boolean;
}
export declare const createError: (message: string, statusCode?: number, code?: string, details?: any) => AppError;
export declare const errorHandler: (err: AppError | Error, req: Request, res: Response, next: NextFunction) => void;
export declare const notFoundHandler: (req: Request, res: Response, next: NextFunction) => void;
export declare const asyncHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=errorHandler.d.ts.map