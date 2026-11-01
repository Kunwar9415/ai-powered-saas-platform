import express from 'express';
import { analyzeResume } from '../controllers/resume.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import { aiEndpointLimiter } from '../middleware/rateLimiter.middleware.js';

const router = express.Router();

router.post('/analyze', authenticate, aiEndpointLimiter, upload.single('resume'), analyzeResume);

export default router;
