import api from './api';

export const aiService = {
  /**
   * Health and status check for Local AI Server (Ollama)
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
   * React -> Express API -> localAIService -> Ollama -> gpt-oss-20b
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
  async generateText({ prompt, provider = 'ollama', systemPrompt, temperature, maxTokens, model }) {
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
   * Modular visual synthesis
   */
  async generateImage({ prompt, style = 'Photorealistic', size = '1024x1024' }) {
    const response = await api.post('/ai/generate-image', {
      prompt,
      style,
      size,
    });
    return response.data;
  },

  /**
   * Long-form article generator via local model
   */
  async generateArticle({ topic, tone, length, keywords, provider = 'ollama' }) {
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
   * Headline and hook ideation via local model
   */
  async generateTitles({ topic, description, contentType, provider = 'ollama' }) {
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
