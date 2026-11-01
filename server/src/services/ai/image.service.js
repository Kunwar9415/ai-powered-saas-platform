import openaiService from './openai.service.js';
import mockAIService from './mockAI.service.js';
import { logger } from '../../utils/logger.js';

export class ImageService {
  async generateImage({ prompt, style = 'Photorealistic', size = '1024x1024' }) {
    // If OpenAI API key is set and user wants DALL-E, try OpenAI first
    if (openaiService.isConfigured()) {
      try {
        logger.info('Attempting image generation with OpenAI DALL-E...');
        return await openaiService.generateImage({
          prompt: `${prompt}, ${style} style, high quality`,
          size,
        });
      } catch (error) {
        logger.warn('OpenAI image generation failed, falling back to Pollinations generator:', error.message);
      }
    }

    // High-resolution generative image synthesizer
    return await mockAIService.generateImage({ prompt, style, size });
  }
}

export default new ImageService();
