import axios from 'axios';
import { PROVIDER_CONFIG } from '../../config/aiProviders.js';
import { logger } from '../../utils/logger.js';

export class OpenAIService {
  constructor() {
    this.config = PROVIDER_CONFIG?.openai || {};
  }

  isConfigured() {
    return Boolean(this.config?.apiKey && this.config.apiKey.trim() !== '');
  }

  async generateText({ prompt, systemPrompt = '', temperature = 0.7, maxTokens = 2000 }) {
    if (!this.isConfigured()) {
      throw new Error('OpenAI API key is not configured in server environment variables.');
    }

    const messages = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    try {
      logger.ai('openai', `Sending request to model: ${this.config.defaultModel}`);
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
        provider: 'openai',
        model: this.config.defaultModel,
        usage: {
          promptTokens: usage.prompt_tokens || 0,
          completionTokens: usage.completion_tokens || 0,
          totalTokens: usage.total_tokens || 0,
        },
      };
    } catch (error) {
      const errMsg = error.response?.data?.error?.message || error.message;
      logger.error('OpenAI generation error:', errMsg);
      throw new Error(`OpenAI Provider Error: ${errMsg}`);
    }
  }

  async generateImage({ prompt, size = '1024x1024', quality = 'standard' }) {
    if (!this.isConfigured()) {
      throw new Error('OpenAI API key is not configured for image generation.');
    }

    try {
      logger.ai('openai', `Generating image with prompt: "${prompt.substring(0, 40)}..."`);
      const response = await axios.post(
        `${this.config.endpoint}/images/generations`,
        {
          model: this.config.imageModel || 'dall-e-3',
          prompt,
          n: 1,
          size,
          quality,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.config.apiKey}`,
          },
          timeout: 60000,
        }
      );

      const imageUrl = response.data?.data?.[0]?.url;
      const revisedPrompt = response.data?.data?.[0]?.revised_prompt || prompt;

      return {
        imageUrl,
        revisedPrompt,
        provider: 'openai',
        model: this.config.imageModel || 'dall-e-3',
      };
    } catch (error) {
      const errMsg = error.response?.data?.error?.message || error.message;
      logger.error('OpenAI Image Error:', errMsg);
      throw new Error(`OpenAI Image Generation Error: ${errMsg}`);
    }
  }
}

export default new OpenAIService();
