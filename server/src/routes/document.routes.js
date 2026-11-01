import express from 'express';
import {
  uploadDocument,
  analyzeDocument,
  getUserDocuments,
  getDocumentById,
  deleteDocument,
} from '../controllers/document.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import { aiEndpointLimiter } from '../middleware/rateLimiter.middleware.js';

const router = express.Router();

router.post('/upload', authenticate, upload.single('file'), uploadDocument);
router.post('/analyze', authenticate, aiEndpointLimiter, analyzeDocument);
router.get('/', authenticate, getUserDocuments);
router.get('/:id', authenticate, getDocumentById);
router.delete('/:id', authenticate, deleteDocument);

export default router;
