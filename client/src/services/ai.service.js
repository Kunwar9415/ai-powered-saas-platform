import api from './api';

export const aiService = {
  /**
   * Health and status check for Custom AI Server (FastAPI)
   */
  async getStatus() {
    const response = await api.get('/ai/status');
    return response.data;
  },

  /**
   * Retrieve list of available AI providers
   */
  async getProviders() {
    const response = await api.get('/ai/providers');
    return response.data;
  },

  /**
   * Primary standardized text generation endpoint
   * React -> Express API -> localAIService -> Python FastAPI -> CustomTransformerLM-v1
   */
  async generate({ prompt, systemPrompt, temperature, maxTokens, model }) {
    const response = await api.post('/ai/generate', {
      prompt,
      systemPrompt,
      temperature,
      maxTokens,
      model,
    });
    return response.data;
  },

  /**
   * Text / Chat generation
   */
  async generateText({ prompt, provider = 'custom_ai', systemPrompt, temperature, maxTokens, model }) {
    const response = await api.post('/ai/generate-text', {
      prompt,
      provider,
      systemPrompt,
      temperature,
      maxTokens,
      model,
    });
    return response.data;
  },


  /**
   * Long-form article generator via custom model
   */
  async generateArticle({ topic, tone, length, keywords, provider = 'custom_ai' }) {
    const response = await api.post('/ai/generate-article', {
      topic,
      tone,
      length,
      keywords,
      provider,
    });
    return response.data;
  },

  /**
   * Headline and hook ideation via custom model
   */
  async generateTitles({ topic, description, contentType, provider = 'custom_ai' }) {
    const response = await api.post('/ai/generate-titles', {
      topic,
      description,
      contentType,
      provider,
    });
    return response.data;
  },

  /**
   * Resume ATS evaluation via local model
   */
  async analyzeResume(formData) {
    const response = await api.post('/resume/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default aiService;
