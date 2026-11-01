import localAIService from './localAIService.js';
import documentAIService from './documentAIService.js';
import imageAIService from './imageAIService.js';
import mockAIService from './mockAI.service.js';
import { logger } from '../../utils/logger.js';

export class AIRouterService {
  constructor() {
    this.localAIService = localAIService;
    this.documentAIService = documentAIService;
    this.imageAIService = imageAIService;
  }

  /**
   * Main text generation dispatcher prioritizing local Ollama model (gpt-oss:20b)
   */
  async generateText({
    prompt,
    provider = 'ollama',
    systemPrompt = '',
    temperature = 0.7,
    maxTokens = 2000,
    model,
  }) {
    // 1. Route primary text generation to Local AI Service (Ollama + gpt-oss:20b)
    try {
      logger.info(`Routing text generation to Local AI engine (Ollama)...`);
      return await this.localAIService.generateText({
        prompt,
        systemPrompt,
        temperature,
        maxTokens,
        model,
      });
    } catch (error) {
      // If Ollama is unavailable, pass error forward so client receives specific 503 message
      if (error.isOllamaUnavailable || error.statusCode === 503) {
        throw error;
      }

      logger.warn(`Local AI Service encountered an error (${error.message}). Checking fallback...`);

      // 2. Resilient simulation fallback if local model execution fails with unrecoverable error
      logger.info('Using Adaptive Simulation Engine as fallback...');
      return await mockAIService.generateText({ prompt, systemPrompt });
    }
  }

  /**
   * Long-form Article Generator with structured prompts executed on local model
   */
  async generateArticle({
    topic,
    tone = 'Professional',
    length = 'Medium',
    keywords = [],
    provider = 'ollama',
  }) {
    const prompt = `Write a comprehensive, high-quality article about "${topic}".\n` +
      `Tone: ${tone}\n` +
      `Length Target: ${length}\n` +
      `Target Keywords to include: ${Array.isArray(keywords) ? keywords.join(', ') : keywords}\n` +
      `Please format in Markdown with a catchy H2 title, Introduction, clear subheadings for the main body, and a strong Conclusion.`;

    const systemPrompt = `You are a professional SaaS content strategist and technical writer. Provide engaging, well-researched, and SEO-optimized articles in clean Markdown.`;

    try {
      const res = await this.localAIService.generateText({
        prompt,
        systemPrompt,
        temperature: 0.7,
        maxTokens: 2500,
      });

      return {
        text: res.text,
        provider: res.provider || 'ollama',
        model: res.model || 'gpt-oss:20b',
        metadata: { topic, tone, length, keywords },
        isLocal: true,
      };
    } catch (error) {
      if (error.isOllamaUnavailable) {
        throw error;
      }
      logger.warn(`Article generation via local AI failed: ${error.message}. Using fallback...`);
      return await mockAIService.generateArticle({ topic, tone, length, keywords });
    }
  }

  /**
   * Title / Headline Generator executed on local model
   */
  async generateTitles({
    topic,
    description = '',
    contentType = 'Blog Post',
    provider = 'ollama',
  }) {
    const prompt = `Generate 7 catchy, viral, and high-CTR titles for a ${contentType} about "${topic}".\n` +
      (description ? `Context details: ${description}\n` : '') +
      `Return only the numbered list of 7 titles without unnecessary conversational filler.`;

    const systemPrompt = `You are a viral marketing copywriter and headline specialist.`;

    try {
      const res = await this.localAIService.generateText({
        prompt,
        systemPrompt,
        temperature: 0.8,
        maxTokens: 600,
      });

      const titles = res.text
        .split('\n')
        .map((line) => line.replace(/^\d+[\.\)]\s*/, '').trim())
        .filter(Boolean);

      return {
        text: res.text,
        titles: titles.length > 0 ? titles : [res.text],
        provider: res.provider || 'ollama',
        model: res.model || 'gpt-oss:20b',
        isLocal: true,
      };
    } catch (error) {
      if (error.isOllamaUnavailable) {
        throw error;
      }
      logger.warn(`Title generation via local AI failed: ${error.message}. Using fallback...`);
      return await mockAIService.generateTitles({ topic, description, contentType });
    }
  }

  /**
   * Modular Image Generation Dispatcher
   */
  async generateImage({ prompt, style = 'Photorealistic', size = '1024x1024' }) {
    return await this.imageAIService.generateImage({ prompt, style, size });
  }

  /**
   * Document Analysis Dispatcher via DocumentAIService
   */
  async analyzeDocument({ text, fileName = 'Document', mode = 'summarize', provider = 'ollama' }) {
    return await this.documentAIService.analyzeDocument({ text, fileName, mode, provider });
  }

  /**
   * Resume Analysis & ATS Optimization Dispatcher via DocumentAIService
   */
  async analyzeResume({ text, fileName = 'Resume', targetRole = '', provider = 'ollama' }) {
    return await this.documentAIService.analyzeResume({ text, fileName, targetRole, provider });
  }
}

export default new AIRouterService();
