import { Request, Response, NextFunction } from 'express';
export declare class DocumentController {
    static upload(req: Request, res: Response, next: NextFunction): Promise<void>;
    static analyze(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getAnalysis(req: Request, res: Response, next: NextFunction): Promise<void>;
    static fix(req: Request, res: Response, next: NextFunction): Promise<void>;
    static download(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getDocument(req: Request, res: Response, next: NextFunction): Promise<void>;
    static listDocuments(req: Request, res: Response, next: NextFunction): Promise<void>;
    static deleteDocument(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=DocumentController.d.ts.map