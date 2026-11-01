import express from 'express';
import {
  generate,
  generateText,
  generateImage,
  generateArticle,
  generateTitles,
  getProviders,
  getAiStatus,
} from '../controllers/ai.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { aiEndpointLimiter } from '../middleware/rateLimiter.middleware.js';

const router = express.Router();

// 1. Health & Configuration Status
router.get('/status', authenticate, getAiStatus);
router.get('/providers', authenticate, getProviders);

// 2. Primary Standard AI Generation (Architecture: React -> Express -> localAIService -> Ollama -> gpt-oss-20b)
router.post('/generate', authenticate, aiEndpointLimiter, generate);

// 3. Feature-Specific Local AI Endpoints
router.post('/generate-text', authenticate, aiEndpointLimiter, generateText);
router.post('/generate-article', authenticate, aiEndpointLimiter, generateArticle);
router.post('/generate-titles', authenticate, aiEndpointLimiter, generateTitles);
router.post('/generate-image', authenticate, aiEndpointLimiter, generateImage);

export default router;
