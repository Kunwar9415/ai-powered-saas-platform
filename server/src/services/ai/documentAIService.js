import localAIService from './localAIService.js';
import geminiService from './gemini.service.js';
import mockAIService from './mockAI.service.js';
import { logger } from '../../utils/logger.js';

export class DocumentAIService {
  /**
   * Analyze uploaded document text:
   * Uses Google Gemini API if configured (Hybrid architecture),
   * with automatic fallback to local DocumentClassifierNet.
   */
  async analyzeDocument({ text, fileName = 'Document', mode = 'summarize', provider }) {
    if ((provider === 'gemini' || geminiService.isConfigured()) && provider !== 'custom_ai_forced') {
      try {
        logger.info(`[Hybrid Document AI] Routing document analysis to Google Gemini API...`);
        return await geminiService.analyzeDocument({ text, fileName, mode });
      } catch (geminiErr) {
        logger.warn(`Google Gemini document analysis failed (${geminiErr.message}). Falling back to local model...`);
      }
    }

    try {
      logger.info(`[Hybrid Document AI] Routing document analysis to Custom AI Engine (DocumentClassifierNet-v1)...`);
      return await localAIService.analyzeDocument({ text, fileName, mode });
    } catch (error) {
      if (error.isCustomAiUnavailable) {
        throw error;
      }
      logger.warn(`Custom AI document analysis error (${error.message}). Checking offline fallback...`);
      return await mockAIService.analyzeDocument({ text, fileName, mode });
    }
  }

  /**
   * Analyze uploaded resume:
   * STRICTLY ROUTED 100% to our in-house custom ResumeDomainClassifierNet-v1.
   * Candidate personal data (PII) stays entirely local and private with zero external API calls.
   */
  async analyzeResume({ text, fileName = 'Resume', targetRole = '', provider = 'custom_ai' }) {
    try {
      logger.info(`[Sovereign Resume AI] Routing resume analysis to In-House Custom PyTorch Engine (ResumeDomainClassifierNet-v1)...`);
      return await localAIService.analyzeResume({ text, fileName, targetRole });
    } catch (error) {
      if (error.isCustomAiUnavailable) {
        throw error;
      }
      logger.warn(`Custom AI resume analysis error (${error.message}). Checking offline fallback...`);
      return await mockAIService.analyzeResume({ text, fileName, targetRole });
    }
  }
}

export const documentAIService = new DocumentAIService();
export default documentAIService;
