import express from 'express';
import multer from 'multer';
import { DocumentController } from '../controllers/DocumentController';
import { validateUpload, validateAnalyze, validateFix } from '../middleware/validation';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
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
    } else {
      cb(new Error('Unsupported file type'));
    }
  },
});

// Document upload endpoint
router.post('/upload', upload.single('file'), validateUpload, DocumentController.upload);

// Document analysis endpoint
router.post('/:id/analyze', validateAnalyze, DocumentController.analyze);

// Get analysis results endpoint
router.get('/:id/analysis/:analysisId', DocumentController.getAnalysis);

// Apply fixes endpoint
router.post('/:id/fix', validateFix, DocumentController.fix);

// Download document endpoint
router.get('/:id/download', DocumentController.download);

// Get document info endpoint
router.get('/:id', DocumentController.getDocument);

// List documents endpoint
router.get('/', DocumentController.listDocuments);

// Delete document endpoint
router.delete('/:id', DocumentController.deleteDocument);

export default router;