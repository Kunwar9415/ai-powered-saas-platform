import localAIService from './localAIService.js';
import mockAIService from './mockAI.service.js';
import { logger } from '../../utils/logger.js';

export class DocumentAIService {
  /**
   * Analyze uploaded document text locally via our custom DocumentClassifierNet
   */
  async analyzeDocument({ text, fileName = 'Document', mode = 'summarize', provider = 'custom_ai' }) {
    try {
      logger.info(`📄 DocumentAIService: Routing document analysis to Custom AI Engine`);
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
   * Analyze uploaded resume locally via our custom ResumeDomainClassifierNet
   */
  async analyzeResume({ text, fileName = 'Resume', targetRole = '', provider = 'custom_ai' }) {
    try {
      logger.info(`📋 DocumentAIService: Routing resume analysis to Custom AI Engine`);
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
