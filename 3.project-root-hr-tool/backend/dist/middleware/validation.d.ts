import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
export declare const validateUpload: (req: Request, res: Response, next: NextFunction) => void;
export declare const validateDocumentId: (req: Request, res: Response, next: NextFunction) => void;
export declare const validateAnalyze: ((req: Request, res: Response, next: NextFunction) => void)[];
export declare const validateFix: ((req: Request, res: Response, next: NextFunction) => void)[];
export declare const validateQuery: (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => void;
export declare const paginationSchema: Joi.ObjectSchema<any>;
export declare const filterSchema: Joi.ObjectSchema<any>;
export declare const sanitizeInput: (input: string) => string;
export declare const sanitizeObject: (obj: Record<string, any>) => Record<string, any>;
//# sourceMappingURL=validation.d.ts.map