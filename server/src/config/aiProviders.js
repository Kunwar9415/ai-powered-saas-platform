import dotenv from 'dotenv';
dotenv.config();

export const AI_PROVIDERS = {
  GEMINI: 'gemini',
  CUSTOM_AI: 'custom_ai',
  SIMULATION: 'simulation',
};

export const PROVIDER_CONFIG = {
  gemini: {
    name: 'Google Gemini (Cloud LLM)',
    apiKey: process.env.GEMINI_API_KEY || '',
    defaultModel: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta',
    isLocal: false,
    isAvailable: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '' && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here'),
    description: 'High-speed, multi-domain Google Gemini API for creative text generation and document intelligence.',
  },
  custom_ai: {
    name: 'Custom In-House Neural Engine (PyTorch)',
    baseUrl: process.env.CUSTOM_AI_SERVICE_URL || 'http://localhost:8000',
    defaultModel: 'ResumeDomainClassifierNet-v1',
    isLocal: true,
    isAvailable: true,
    description: 'Sovereign custom-trained neural models running on local CPU for private resume detection and NLP.',
  },
  simulation: {
    name: 'Built-in Fallback AI Engine',
    apiKey: 'INTERNAL_ACTIVE',
    defaultModel: 'custom-pipeline-v1',
    isAvailable: true,
    description: 'In-memory contextual engine for zero-downtime resilience.',
  },
};

/**
 * Returns list of currently active and configured AI providers in Hybrid Architecture
 */
export const getAvailableProviders = () => {
  const isGeminiReady = PROVIDER_CONFIG.gemini.isAvailable;
  return [
    {
      id: 'gemini',
      name: PROVIDER_CONFIG.gemini.name,
      defaultModel: PROVIDER_CONFIG.gemini.defaultModel,
      isLocal: false,
      status: isGeminiReady ? 'active' : 'standby',
      description: PROVIDER_CONFIG.gemini.description,
    },
    {
      id: 'custom_ai',
      name: PROVIDER_CONFIG.custom_ai.name,
      defaultModel: PROVIDER_CONFIG.custom_ai.defaultModel,
      isLocal: true,
      baseUrl: PROVIDER_CONFIG.custom_ai.baseUrl,
      description: PROVIDER_CONFIG.custom_ai.description,
      status: 'active',
    },
  ];
};
