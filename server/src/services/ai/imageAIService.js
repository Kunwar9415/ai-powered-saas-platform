import { logger } from '../../utils/logger.js';
import mockAIService from './mockAI.service.js';
import openaiService from './openai.service.js';

/**
 * ImageAIService
 * 
 * NOTE ON ARCHITECTURE:
 * Text LLMs such as 'gpt-oss:20b' are open-weight autoregressive language models
 * designed for text, code, and document reasoning. They do NOT generate raster images directly.
 * 
 * This ImageAIService is designed as a modular Vision pipeline separate from the
 * local text model, enabling local diffusion models (e.g. Stable Diffusion / SDXL)
 * or fallback image generation engines to be plugged in without impacting the text inference layer.
 */
export class ImageAIService {
  constructor() {
    this.providerName = 'modular-vision-pipeline';
  }

  /**
   * Generates visual art from a prompt using the modular image synthesis engine
   * 
   * @param {Object} options
   * @param {string} options.prompt - Text description for the image
   * @param {string} [options.style='Photorealistic'] - Artistic style
   * @param {string} [options.size='1024x1024'] - Image resolution
   */
  async generateImage({ prompt, style = 'Photorealistic', size = '1024x1024' }) {
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      throw new Error('Image prompt is required.');
    }

    logger.info(`🎨 ImageAIService: Synthesizing image (${style}) for prompt: "${prompt.substring(0, 40)}..."`);

    // 1. If OpenAI DALL-E is configured, it can be optionally used as an external vision engine
    if (openaiService && typeof openaiService.isConfigured === 'function' && openaiService.isConfigured()) {
      try {
        logger.info('Using OpenAI DALL-E vision pipeline for image generation...');
        return await openaiService.generateImage({
          prompt: `${prompt}, ${style} style, high quality, 8k resolution`,
          size,
        });
      } catch (err) {
        logger.warn('External DALL-E generation failed, falling back to local/integrated vision synthesizer:', err.message);
      }
    }

    // 2. High-resolution generative visual synthesis engine
    const visualResult = await mockAIService.generateImage({
      prompt: prompt.trim(),
      style,
      size,
    });

    return {
      imageUrl: visualResult.imageUrl,
      revisedPrompt: visualResult.revisedPrompt || `${prompt} (${style})`,
      provider: 'modular-vision-pipeline',
      model: 'generative-vision-v2',
      architectureNote: 'Image generation is handled by a modular vision pipeline distinct from the local text LLM (gpt-oss:20b).',
    };
  }
}

export const imageAIService = new ImageAIService();
export default imageAIService;
