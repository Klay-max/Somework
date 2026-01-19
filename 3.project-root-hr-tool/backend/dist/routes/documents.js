"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const DocumentController_1 = require("../controllers/DocumentController");
const validation_1 = require("../middleware/validation");
const router = express_1.default.Router();
// Configure multer for file uploads
const upload = (0, multer_1.default)({
    dest: process.env.UPLOAD_DIR || './uploads',
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800'), // 50MB default
        files: 1,
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain',
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Unsupported file type'));
        }
    },
});
// Document upload endpoint
router.post('/upload', upload.single('file'), validation_1.validateUpload, DocumentController_1.DocumentController.upload);
// Document analysis endpoint
router.post('/:id/analyze', validation_1.validateAnalyze, DocumentController_1.DocumentController.analyze);
// Get analysis results endpoint
router.get('/:id/analysis/:analysisId', DocumentController_1.DocumentController.getAnalysis);
// Apply fixes endpoint
router.post('/:id/fix', validation_1.validateFix, DocumentController_1.DocumentController.fix);
// Download document endpoint
router.get('/:id/download', DocumentController_1.DocumentController.download);
// Get document info endpoint
router.get('/:id', DocumentController_1.DocumentController.getDocument);
// List documents endpoint
router.get('/', DocumentController_1.DocumentController.listDocuments);
// Delete document endpoint
router.delete('/:id', DocumentController_1.DocumentController.deleteDocument);
exports.default = router;
//# sourceMappingURL=documents.js.map