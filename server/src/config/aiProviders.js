import dotenv from 'dotenv';
dotenv.config();

export const AI_PROVIDERS = {
  CUSTOM_AI: 'custom_ai',
  SIMULATION: 'simulation',
};

export const PROVIDER_CONFIG = {
  custom_ai: {
    name: 'Custom Trained AI Engine (PyTorch)',
    baseUrl: process.env.CUSTOM_AI_SERVICE_URL || 'http://localhost:8000',
    defaultModel: 'custom-transformer-v1',
    isLocal: true,
    isAvailable: true,
    description: 'Custom-trained neural network models running locally via FastAPI inference server.',
  },
  simulation: {
    name: 'Built-in Fallback AI Engine',
    apiKey: 'INTERNAL_ACTIVE',
    defaultModel: 'custom-pipeline-v1',
    isAvailable: true,
    description: 'In-memory contextual engine for zero-downtime development resilience.',
  },
};

/**
 * Returns list of currently active and configured AI providers
 */
export const getAvailableProviders = () => {
  return [
    {
      id: 'custom_ai',
      name: PROVIDER_CONFIG.custom_ai.name,
      defaultModel: PROVIDER_CONFIG.custom_ai.defaultModel,
      isLocal: true,
      baseUrl: PROVIDER_CONFIG.custom_ai.baseUrl,
      description: PROVIDER_CONFIG.custom_ai.description,
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
