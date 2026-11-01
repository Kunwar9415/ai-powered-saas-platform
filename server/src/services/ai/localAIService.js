import axios from 'axios';
import { logger } from '../../utils/logger.js';

export class LocalAIService {
  constructor() {
    this.baseUrl = (process.env.OLLAMA_BASE_URL || 'http://localhost:11434').replace(/\/+$/, '');
    this.defaultModel = process.env.OLLAMA_MODEL || 'llama3.2:1b';
    this.timeoutMs = parseInt(process.env.OLLAMA_TIMEOUT_MS, 10) || 120000; // 2 minutes default for local inference
  }

  /**
   * Returns whether the local AI service configuration is active
   */
  isConfigured() {
    return Boolean(this.baseUrl);
  }

  /**
   * Health check / ping to verify if Ollama server is running locally
   */
  async checkHealth() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tags`, {
        timeout: 5000,
      });

      const installedModels = (response.data?.models || []).map((m) => m.name || m.model);
      const isTargetModelInstalled = installedModels.some(
        (name) => name === this.defaultModel || name.startsWith(this.defaultModel.split(':')[0])
      );

      return {
        online: true,
        baseUrl: this.baseUrl,
        configuredModel: this.defaultModel,
        isModelInstalled: isTargetModelInstalled,
        installedModels,
      };
    } catch (error) {
      return {
        online: false,
        baseUrl: this.baseUrl,
        configuredModel: this.defaultModel,
        isModelInstalled: false,
        installedModels: [],
        error: error.code === 'ECONNREFUSED'
          ? 'Local AI server is unavailable. Please make sure Ollama is running.'
          : error.message,
      };
    }
  }

  /**
   * Generate text using the local Ollama instance (e.g. gpt-oss:20b)
   * 
   * @param {Object} options
   * @param {string} options.prompt - Prompt to send to the local model
   * @param {string} [options.systemPrompt] - System instruction for the model
   * @param {number} [options.temperature=0.7] - Sampling temperature
   * @param {number} [options.maxTokens=2000] - Max output tokens (num_predict in Ollama)
   * @param {string} [options.model] - Specific model override
   */
  async generateText({
    prompt,
    systemPrompt = '',
    temperature = 0.7,
    maxTokens = 2000,
    model,
  }) {
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      throw new Error('Prompt is required for AI generation.');
    }

    const targetModel = model || this.defaultModel;
    const cleanPrompt = prompt.trim();

    logger.info(`🤖 Local AI Service: Sending inference request to [${targetModel}] at ${this.baseUrl}`);

    try {
      const payload = {
        model: targetModel,
        prompt: cleanPrompt,
        stream: false,
        options: {
          temperature: typeof temperature === 'number' ? temperature : parseFloat(temperature) || 0.7,
          num_predict: typeof maxTokens === 'number' ? maxTokens : parseInt(maxTokens, 10) || 2000,
        },
      };

      if (systemPrompt && systemPrompt.trim()) {
        payload.system = systemPrompt.trim();
      }

      const response = await axios.post(`${this.baseUrl}/api/generate`, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: this.timeoutMs,
      });

      const responseText = response.data?.response;

      if (typeof responseText !== 'string') {
        throw new Error('Local AI model returned an unexpected response structure.');
      }

      if (responseText.trim() === '') {
        throw new Error('Local AI model returned an empty response.');
      }

      const promptTokens = response.data?.prompt_eval_count || 0;
      const completionTokens = response.data?.eval_count || 0;
      const totalTokens = promptTokens + completionTokens;
      const totalDurationMs = response.data?.total_duration
        ? Math.round(response.data.total_duration / 1e6)
        : null;

      logger.success(
        `✅ Local AI Inference complete [${targetModel}]: ${completionTokens} tokens in ${totalDurationMs || 'N/A'}ms`
      );

      return {
        text: responseText.trim(),
        provider: 'ollama',
        model: targetModel,
        isLocal: true,
        usage: {
          promptTokens,
          completionTokens,
          totalTokens,
          totalDurationMs,
        },
      };
    } catch (error) {
      // Map Ollama error scenarios to user-friendly messages
      if (error.code === 'ECONNREFUSED' || error.message?.includes('ECONNREFUSED')) {
        logger.error(`Local AI server unavailable at ${this.baseUrl}:`, error.message);
        const err = new Error(
          'Local AI server is unavailable. Please make sure Ollama is running.'
        );
        err.statusCode = 503;
        err.isOllamaUnavailable = true;
        throw err;
      }

      if (error.response?.status === 404 || error.message?.includes('not found')) {
        const notFoundMsg = error.response?.data?.error || `Model '${targetModel}' not found.`;
        logger.error(`Local model not found: ${notFoundMsg}`);
        const err = new Error(
          `Local AI model '${targetModel}' is not installed in Ollama. Please download it using: 'ollama pull ${targetModel}'`
        );
        err.statusCode = 404;
        throw err;
      }

      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        logger.error(`Local AI inference timed out after ${this.timeoutMs}ms`);
        const err = new Error(
          `Local AI inference timed out. The local model '${targetModel}' may be loading or hardware resources are strained.`
        );
        err.statusCode = 504;
        throw err;
      }

      logger.error('Local AI generation error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || error.message || 'Local AI generation failed.');
    }
  }

  /**
   * Generate conversational chat response via Ollama /api/chat
   */
  async generateChat({ messages, temperature = 0.7, model }) {
    const targetModel = model || this.defaultModel;

    try {
      const response = await axios.post(
        `${this.baseUrl}/api/chat`,
        {
          model: targetModel,
          messages,
          stream: false,
          options: {
            temperature: parseFloat(temperature) || 0.7,
          },
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: this.timeoutMs,
        }
      );

      const content = response.data?.message?.content || '';
      return {
        text: content.trim(),
        provider: 'ollama',
        model: targetModel,
        isLocal: true,
        usage: {
          promptTokens: response.data?.prompt_eval_count || 0,
          completionTokens: response.data?.eval_count || 0,
        },
      };
    } catch (error) {
      if (error.code === 'ECONNREFUSED' || error.message?.includes('ECONNREFUSED')) {
        const err = new Error('Local AI server is unavailable. Please make sure Ollama is running.');
        err.statusCode = 503;
        throw err;
      }
      throw error;
    }
  }
}

export const localAIService = new LocalAIService();
export default localAIService;
