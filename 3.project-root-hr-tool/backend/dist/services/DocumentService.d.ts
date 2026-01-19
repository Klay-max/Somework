import { Document } from '../models/document';
export declare class DocumentService {
    static parseDocument(file: Express.Multer.File): Promise<string>;
    private static parsePDF;
    private static parseWord;
    private static parseExcel;
    private static parseText;
    static applyFixes(document: Document, selectedIssueIds: string[], autoFix: boolean): Promise<Document>;
    static generateDownload(document: Document, format: string): Promise<Buffer>;
    static getFileExtension(mimeType: string): string;
    private static cleanupFile;
    static cleanupOldFiles(): Promise<void>;
    static validateFileContent(content: string, mimeType: string): boolean;
    static extractMetadata(content: string, mimeType: string): {
        pageCount?: number;
        wordCount?: number;
        language?: string;
    };
    static validateParsedContent(content: string, originalFile: Express.Multer.File): Promise<boolean>;
}
//# sourceMappingURL=DocumentService.d.ts.map