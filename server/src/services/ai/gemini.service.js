import axios from 'axios';
import { PROVIDER_CONFIG } from '../../config/aiProviders.js';
import { logger } from '../../utils/logger.js';

export class GeminiService {
  constructor() {
    this.config = PROVIDER_CONFIG?.gemini || {};
  }

  isConfigured() {
    return Boolean(this.config?.apiKey && this.config.apiKey.trim() !== '');
  }

  async generateText({ prompt, systemPrompt = '', temperature = 0.7, maxTokens = 2000 }) {
    if (!this.isConfigured()) {
      throw new Error('Google Gemini API key is not configured in server environment variables.');
    }

    const modelName = this.config.defaultModel || 'gemini-1.5-flash';
    const url = `${this.config.endpoint}/models/${modelName}:generateContent?key=${this.config.apiKey}`;

    const contents = [];
    if (systemPrompt) {
      contents.push({
        role: 'user',
        parts: [{ text: `[System Instruction]: ${systemPrompt}\n\n[User Request]: ${prompt}` }],
      });
    } else {
      contents.push({
        role: 'user',
        parts: [{ text: prompt }],
      });
    }

    try {
      logger.ai('gemini', `Sending request to Gemini model: ${modelName}`);
      const response = await axios.post(
        url,
        {
          contents,
          generationConfig: {
            temperature,
            maxOutputTokens: maxTokens,
          },
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 45000,
        }
      );

      const candidate = response.data?.candidates?.[0];
      const text = candidate?.content?.parts?.[0]?.text || '';
      const usage = response.data?.usageMetadata || {};

      return {
        text,
        provider: 'gemini',
        model: modelName,
        usage: {
          promptTokens: usage.promptTokenCount || 0,
          completionTokens: usage.candidatesTokenCount || 0,
          totalTokens: usage.totalTokenCount || 0,
        },
      };
    } catch (error) {
      const errMsg = error.response?.data?.error?.message || error.message;
      logger.error('Gemini generation error:', errMsg);
      throw new Error(`Google Gemini Provider Error: ${errMsg}`);
    }
  }
}

export default new GeminiService();
