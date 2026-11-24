import localAIService from '../services/ai/localAIService.js';
import aiRouter from '../services/ai/aiRouter.service.js';
import dbRepo from '../config/dbRepository.js';
import { getAvailableProviders } from '../config/aiProviders.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';

/**
 * Health and status check for Local AI Server (Ollama)
 * GET /api/ai/status
 */
export const getAiStatus = async (req, res, next) => {
  try {
    const health = await localAIService.checkHealth();
    return successResponse(
      res,
      health,
      health.online
        ? `Local AI server is active and reachable at ${health.baseUrl}.`
        : `Local AI server is offline. ${health.error || ''}`
    );
  } catch (error) {
    next(error);
  }
};

/**
 * List available AI engine providers
 * GET /api/ai/providers
 */
export const getProviders = async (req, res, next) => {
  try {
    const providers = getAvailableProviders();
    const health = await localAIService.checkHealth();

    const enrichedProviders = providers.map((p) => {
      if (p.id === 'custom_ai') {
        return {
          ...p,
          isOnline: health.online,
          models: health.models || {},
          modelsLoaded: health.modelsLoaded,
        };
      }
      return p;
    });

    return successResponse(res, { providers: enrichedProviders }, 'Available AI providers retrieved.');
  } catch (error) {
    next(error);
  }
};

/**
 * Primary Custom AI generation endpoint
 * POST /api/ai/generate
 * 
 * Target Architecture:
 * React -> Express API -> localAIService -> Python FastAPI -> CustomTransformerLM-v1 -> Express -> PostgreSQL -> React
 */
export const generate = async (req, res, next) => {
  try {
    const { prompt, provider, systemPrompt, temperature, maxTokens, model } = req.body;
    const userId = req.user?.id || 'usr_guest';

    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Invalid prompt. Please provide non-empty prompt text.',
      });
    }

    logger.info(`Processing hybrid AI generation request for user [${userId}]`);

    let aiResult;
    try {
      aiResult = await aiRouter.generateText({
        prompt: prompt.trim(),
        provider,
        systemPrompt,
        temperature: temperature !== undefined ? parseFloat(temperature) : 0.7,
        maxTokens: maxTokens ? parseInt(maxTokens, 10) : 150,
        model,
      });
    } catch (aiErr) {
      const statusCode = aiErr.statusCode || (aiErr.isCustomAiUnavailable ? 503 : 500);
      return res.status(statusCode).json({
        success: false,
        message: aiErr.message || 'AI generation failure.',
      });
    }

    // Persist generation record in PostgreSQL
    let generationRecord = null;
    try {
      generationRecord = await dbRepo.createGeneration({
        userId,
        toolType: 'text',
        prompt: prompt.trim(),
        result: aiResult.text,
        provider: aiResult.provider || 'gemini',
        metadata: {
          model: aiResult.model,
          usage: aiResult.usage,
          temperature,
          isLocal: aiResult.isLocal !== false,
        },
      });
    } catch (dbErr) {
      logger.warn('Failed to persist generation in database:', dbErr.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Text generated successfully!',
      data: {
        result: aiResult.text,
        provider: aiResult.provider || 'gemini',
        model: aiResult.model,
        usage: aiResult.usage,
        isLocal: aiResult.isLocal !== false,
        generationId: generationRecord?.id || 'gen_' + Date.now(),
      },
    });
  } catch (error) {
    logger.error('Unexpected error in /api/ai/generate:', error.message);
    next(error);
  }
};

/**
 * Text generation endpoint (UI / service integration)
 * POST /api/ai/generate-text
 */
export const generateText = async (req, res, next) => {
  try {
    const { prompt, provider, systemPrompt, temperature, maxTokens, model } = req.body;
    const userId = req.user?.id || 'usr_guest';

    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Prompt text is required.',
      });
    }

    logger.info(`Generating text for user [${userId}] via Hybrid AI Router`);

    let aiResult;
    try {
      aiResult = await aiRouter.generateText({
        prompt: prompt.trim(),
        provider,
        systemPrompt,
        temperature: temperature !== undefined ? parseFloat(temperature) : 0.7,
        maxTokens: maxTokens ? parseInt(maxTokens, 10) : 150,
        model,
      });
    } catch (aiErr) {
      const statusCode = aiErr.statusCode || (aiErr.isCustomAiUnavailable ? 503 : 500);
      return res.status(statusCode).json({
        success: false,
        message: aiErr.message || 'AI service is unavailable.',
      });
    }

    const generationRecord = await dbRepo.createGeneration({
      userId,
      toolType: 'text',
      prompt: prompt.trim(),
      result: aiResult.text,
      provider: aiResult.provider || 'gemini',
      metadata: {
        model: aiResult.model,
        usage: aiResult.usage,
        temperature,
        isLocal: aiResult.isLocal !== false,
      },
    });

    return successResponse(
      res,
      {
        result: aiResult.text,
        provider: aiResult.provider || 'gemini',
        model: aiResult.model,
        usage: aiResult.usage,
        isLocal: aiResult.isLocal !== false,
        generationId: generationRecord?.id || 'gen_' + Date.now(),
      },
      'Text generated successfully!'
    );
  } catch (error) {
    logger.error('Text generation failed:', error.message);
    next(error);
  }
};

/**
 * Long-form article generation endpoint (Local model)
 * POST /api/ai/generate-article
 */
export const generateArticle = async (req, res, next) => {
  try {
    const { topic, tone = 'Professional', length = 'Medium', keywords = [], provider = 'custom_ai' } = req.body;
    const userId = req.user?.id || 'usr_guest';

    if (!topic || topic.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Article topic is required.',
      });
    }

    logger.info(`Generating article for user [${userId}] on topic: "${topic}" via custom AI`);

    let aiResult;
    try {
      aiResult = await aiRouter.generateArticle({
        topic: topic.trim(),
        tone,
        length,
        keywords,
        provider,
      });
    } catch (aiErr) {
      const statusCode = aiErr.statusCode || (aiErr.isCustomAiUnavailable ? 503 : 500);
      return res.status(statusCode).json({
        success: false,
        message: aiErr.message || 'Custom AI generation failed.',
      });
    }

    const generationRecord = await dbRepo.createGeneration({
      userId,
      toolType: 'article',
      prompt: `Topic: ${topic} | Tone: ${tone} | Length: ${length}`,
      result: aiResult.text,
      provider: aiResult.provider || 'custom_ai',
      metadata: {
        topic,
        tone,
        length,
        keywords,
        model: aiResult.model,
        isLocal: true,
      },
    });

    return successResponse(
      res,
      {
        article: aiResult.text,
        metadata: aiResult.metadata,
        provider: aiResult.provider || 'custom_ai',
        model: aiResult.model,
        isLocal: true,
        generationId: generationRecord?.id || 'gen_' + Date.now(),
      },
      'Article generated successfully via custom AI model!'
    );
  } catch (error) {
    logger.error('Article generation failed:', error.message);
    next(error);
  }
};

/**
 * Headline and title generation endpoint (Custom model)
 * POST /api/ai/generate-titles
 */
export const generateTitles = async (req, res, next) => {
  try {
    const { topic, description = '', contentType = 'Blog Post', provider = 'custom_ai' } = req.body;
    const userId = req.user?.id || 'usr_guest';

    if (!topic || topic.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Topic is required to generate titles.',
      });
    }

    logger.info(`Generating titles for user [${userId}] for topic: "${topic}" via custom AI`);

    let aiResult;
    try {
      aiResult = await aiRouter.generateTitles({
        topic: topic.trim(),
        description,
        contentType,
        provider,
      });
    } catch (aiErr) {
      const statusCode = aiErr.statusCode || (aiErr.isCustomAiUnavailable ? 503 : 500);
      return res.status(statusCode).json({
        success: false,
        message: aiErr.message || 'Custom AI generation failed.',
      });
    }

    const generationRecord = await dbRepo.createGeneration({
      userId,
      toolType: 'title',
      prompt: `Topic: ${topic} | Type: ${contentType}`,
      result: JSON.stringify(aiResult.titles),
      provider: aiResult.provider || 'custom_ai',
      metadata: {
        topic,
        description,
        contentType,
        model: aiResult.model,
        isLocal: true,
      },
    });

    return successResponse(
      res,
      {
        titles: aiResult.titles,
        rawText: aiResult.text,
        provider: aiResult.provider || 'custom_ai',
        model: aiResult.model,
        isLocal: true,
        generationId: generationRecord?.id || 'gen_' + Date.now(),
      },
      'Titles generated successfully via custom AI model!'
    );
  } catch (error) {
    logger.error('Title generation failed:', error.message);
    next(error);
  }
};
