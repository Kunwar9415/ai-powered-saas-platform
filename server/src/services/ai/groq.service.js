import axios from 'axios';
import { PROVIDER_CONFIG } from '../../config/aiProviders.js';
import { logger } from '../../utils/logger.js';

export class GroqService {
  constructor() {
    this.config = PROVIDER_CONFIG?.groq || {};
  }

  isConfigured() {
    return Boolean(this.config?.apiKey && this.config.apiKey.trim() !== '');
  }

  async generateText({ prompt, systemPrompt = '', temperature = 0.7, maxTokens = 2000 }) {
    if (!this.isConfigured()) {
      throw new Error('Groq API key is not configured in server environment variables.');
    }

    const messages = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    try {
      logger.ai('groq', `Sending request to Groq model: ${this.config.defaultModel}`);
      const response = await axios.post(
        `${this.config.endpoint}/chat/completions`,
        {
          model: this.config.defaultModel,
          messages,
          temperature,
          max_tokens: maxTokens,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.config.apiKey}`,
          },
          timeout: 45000,
        }
      );

      const choice = response.data?.choices?.[0];
      const content = choice?.message?.content || '';
      const usage = response.data?.usage || {};

      return {
        text: content,
        provider: 'groq',
        model: this.config.defaultModel,
        usage: {
          promptTokens: usage.prompt_tokens || 0,
          completionTokens: usage.completion_tokens || 0,
          totalTokens: usage.total_tokens || 0,
        },
      };
    } catch (error) {
      const errMsg = error.response?.data?.error?.message || error.message;
      logger.error('Groq generation error:', errMsg);
      throw new Error(`Groq Provider Error: ${errMsg}`);
    }
  }
}

export default new GroqService();
