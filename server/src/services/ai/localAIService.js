import axios from 'axios';
import { logger } from '../../utils/logger.js';

export class LocalAIService {
  constructor() {
    this.baseUrl = (process.env.CUSTOM_AI_SERVICE_URL || 'http://localhost:8000').replace(/\/+$/, '');
    this.defaultModel = 'CustomTransformerLM-v1';
    this.timeoutMs = parseInt(process.env.CUSTOM_AI_TIMEOUT_MS, 10) || 60000;
  }

  /**
   * Returns whether the custom AI service configuration is active
   */
  isConfigured() {
    return Boolean(this.baseUrl);
  }

  /**
   * Health check / ping to verify if the Python FastAPI service is active
   */
  async checkHealth() {
    try {
      const response = await axios.get(`${this.baseUrl}/health`, {
        timeout: 5000,
      });

      const data = response.data;
      return {
        online: data?.status === 'healthy',
        baseUrl: this.baseUrl,
        service: data?.service || 'Custom PyTorch AI Model Server',
        configuredModel: this.defaultModel,
        modelsLoaded: data?.modelsLoaded || false,
        models: data?.models || {},
      };
    } catch (error) {
      return {
        online: false,
        baseUrl: this.baseUrl,
        configuredModel: this.defaultModel,
        modelsLoaded: false,
        models: {},
        error: error.code === 'ECONNREFUSED'
          ? 'Custom AI FastAPI service is unavailable. Please start python ai-model/api/server.py.'
          : error.message,
      };
    }
  }

  /**
   * Generate text using our custom trained Transformer Language Model
   */
  async generateText({
    prompt,
    systemPrompt = '',
    temperature = 0.7,
    maxTokens = 150,
    model = 'CustomTransformerLM-v1',
  }) {
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      throw new Error('Prompt is required for AI generation.');
    }

    const cleanPrompt = prompt.trim();
    logger.info(`🧠 Custom AI Service: Sending text generation request to [${this.baseUrl}/generate]`);

    try {
      const payload = {
        prompt: cleanPrompt,
        systemPrompt: systemPrompt || undefined,
        temperature: typeof temperature === 'number' ? temperature : parseFloat(temperature) || 0.7,
        maxTokens: typeof maxTokens === 'number' ? maxTokens : parseInt(maxTokens, 10) || 150,
        model,
      };

      const response = await axios.post(`${this.baseUrl}/generate`, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: this.timeoutMs,
      });

      const data = response.data;
      if (!data || !data.success) {
        throw new Error(data?.message || 'Custom AI server did not return a valid result.');
      }

      return {
        text: data.result,
        provider: 'custom_ai',
        model: data.model || this.defaultModel,
        usage: data.usage || { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        isLocal: true,
      };
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        const customErr = new Error('Custom AI server is unreachable at ' + this.baseUrl + '. Ensure python ai-model/api/server.py is running.');
        customErr.statusCode = 503;
        customErr.isCustomAiUnavailable = true;
        throw customErr;
      }
      logger.error('Custom AI generation error:', error.response?.data?.detail || error.message);
      throw error;
    }
  }

  /**
   * Analyze document using custom DocumentClassifierNet
   */
  async analyzeDocument({ text, filePath, fileName = 'Document', mode = 'summarize' }) {
    logger.info(`📄 Custom AI Service: Sending document analysis request to [${this.baseUrl}/analyze-document]`);
    try {
      const payload = { text, filePath, fileName, mode };
      const response = await axios.post(`${this.baseUrl}/analyze-document`, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: this.timeoutMs,
      });

      const data = response.data;
      if (!data || !data.success) {
        throw new Error(data?.message || 'Custom AI server did not return valid document analysis.');
      }

      return {
        ...data.analysis,
        provider: 'custom_ai',
        model: data.model || 'DocumentClassifierNet-v1',
        isLocal: true,
      };
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        const customErr = new Error('Custom AI server is unreachable at ' + this.baseUrl);
        customErr.statusCode = 503;
        customErr.isCustomAiUnavailable = true;
        throw customErr;
      }
      logger.error('Custom AI document analysis error:', error.response?.data?.detail || error.message);
      throw error;
    }
  }

  /**
   * Analyze resume using custom ResumeDomainClassifierNet
   */
  async analyzeResume({ text, filePath, fileName = 'Resume', targetRole }) {
    logger.info(`📋 Custom AI Service: Sending resume analysis request to [${this.baseUrl}/analyze-resume]`);
    try {
      const payload = { text, filePath, fileName, targetRole };
      const response = await axios.post(`${this.baseUrl}/analyze-resume`, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: this.timeoutMs,
      });

      const data = response.data;
      if (!data || !data.success) {
        throw new Error(data?.message || 'Custom AI server did not return valid resume analysis.');
      }

      return {
        ...data.analysis,
        provider: 'custom_ai',
        model: data.model || 'ResumeDomainClassifierNet-v1',
        isLocal: true,
      };
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        const customErr = new Error('Custom AI server is unreachable at ' + this.baseUrl);
        customErr.statusCode = 503;
        customErr.isCustomAiUnavailable = true;
        throw customErr;
      }
      logger.error('Custom AI resume analysis error:', error.response?.data?.detail || error.message);
      throw error;
    }
  }
}

export const localAIService = new LocalAIService();
export default localAIService;
