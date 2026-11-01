import dotenv from 'dotenv';
dotenv.config();

export const AI_PROVIDERS = {
  OLLAMA: 'ollama',
  LOCAL_OLLAMA: 'local_ollama',
  MODULAR_IMAGE: 'modular_image',
  SIMULATION: 'simulation',
  OPENAI: 'openai',
  GEMINI: 'gemini',
  GROQ: 'groq',
};

export const PROVIDER_CONFIG = {
  ollama: {
    name: `Local Ollama Runtime (${process.env.OLLAMA_MODEL || 'llama3.2:1b'})`,
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    defaultModel: process.env.OLLAMA_MODEL || 'llama3.2:1b',
    isLocal: true,
    isAvailable: true,
    description: 'On-premise open-weight LLM inference running locally via Ollama HTTP API.',
  },
  modular_image: {
    name: 'Modular Vision Pipeline',
    baseUrl: 'local-pipeline',
    defaultModel: 'generative-vision-v2',
    isLocal: true,
    isAvailable: true,
    description: 'Decoupled visual synthesizer architecture separate from the local text LLM.',
  },
  simulation: {
    name: 'Built-in Fallback AI Engine',
    apiKey: 'INTERNAL_ACTIVE',
    defaultModel: 'generative-pipeline-v1',
    isAvailable: true,
    description: 'In-memory contextual engine for zero-downtime development resilience.',
  },
  openai: {
    name: 'OpenAI DALL-E Vision Engine',
    apiKey: process.env.OPENAI_API_KEY || '',
    defaultModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    imageModel: 'dall-e-3',
    endpoint: 'https://api.openai.com/v1',
    isAvailable: Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim() !== ''),
  },
  gemini: {
    name: 'Google Gemini',
    apiKey: process.env.GEMINI_API_KEY || '',
    defaultModel: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta',
    isAvailable: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== ''),
  },
  groq: {
    name: 'Groq Cloud',
    apiKey: process.env.GROQ_API_KEY || '',
    defaultModel: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    endpoint: 'https://api.groq.com/openai/v1',
    isAvailable: Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim() !== ''),
  },
};

/**
 * Returns list of currently active and configured AI providers
 */
export const getAvailableProviders = () => {
  return [
    {
      id: 'ollama',
      name: PROVIDER_CONFIG.ollama.name,
      defaultModel: PROVIDER_CONFIG.ollama.defaultModel,
      isLocal: true,
      baseUrl: PROVIDER_CONFIG.ollama.baseUrl,
      description: PROVIDER_CONFIG.ollama.description,
      status: 'active',
    },
    {
      id: 'modular_image',
      name: PROVIDER_CONFIG.modular_image.name,
      defaultModel: PROVIDER_CONFIG.modular_image.defaultModel,
      isLocal: true,
      description: PROVIDER_CONFIG.modular_image.description,
      status: 'active',
    },
    {
      id: 'simulation',
      name: PROVIDER_CONFIG.simulation.name,
      defaultModel: PROVIDER_CONFIG.simulation.defaultModel,
      isLocal: true,
      description: PROVIDER_CONFIG.simulation.description,
      status: 'standby',
    },
  ];
};
