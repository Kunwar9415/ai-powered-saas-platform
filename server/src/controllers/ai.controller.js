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
      if (p.id === 'ollama') {
        return {
          ...p,
          isOnline: health.online,
          installedModels: health.installedModels || [],
          isModelInstalled: health.isModelInstalled,
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
 * Primary Local AI generation endpoint
 * POST /api/ai/generate
 * 
 * Target Architecture:
 * React -> Express API -> localAIService -> Ollama -> gpt-oss-20b -> Express -> PostgreSQL -> React
 */
export const generate = async (req, res, next) => {
  try {
    const { prompt, systemPrompt, temperature, maxTokens, model } = req.body;
    const userId = req.user?.id || 'usr_guest';

    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Invalid prompt. Please provide non-empty prompt text.',
      });
    }

    logger.info(`Processing local AI generation request for user [${userId}]`);

    let aiResult;
    try {
      aiResult = await localAIService.generateText({
        prompt: prompt.trim(),
        systemPrompt,
        temperature: temperature !== undefined ? parseFloat(temperature) : 0.7,
        maxTokens: maxTokens ? parseInt(maxTokens, 10) : 2000,
        model,
      });
    } catch (aiErr) {
      const statusCode = aiErr.statusCode || (aiErr.isOllamaUnavailable ? 503 : 500);
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
        provider: aiResult.provider || 'ollama',
        metadata: {
          model: aiResult.model,
          usage: aiResult.usage,
          temperature,
          isLocal: true,
        },
      });
    } catch (dbErr) {
      logger.warn('Failed to persist generation in database:', dbErr.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Text generated successfully via local AI model!',
      data: {
        result: aiResult.text,
        provider: aiResult.provider || 'ollama',
        model: aiResult.model,
        usage: aiResult.usage,
        isLocal: true,
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
    const { prompt, provider = 'ollama', systemPrompt, temperature, maxTokens, model } = req.body;
    const userId = req.user?.id || 'usr_guest';

    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Prompt text is required.',
      });
    }

    logger.info(`Generating text for user [${userId}] via local AI engine`);

    let aiResult;
    try {
      aiResult = await localAIService.generateText({
        prompt: prompt.trim(),
        systemPrompt,
        temperature: temperature !== undefined ? parseFloat(temperature) : 0.7,
        maxTokens: maxTokens ? parseInt(maxTokens, 10) : 2000,
        model,
      });
    } catch (aiErr) {
      const statusCode = aiErr.statusCode || (aiErr.isOllamaUnavailable ? 503 : 500);
      return res.status(statusCode).json({
        success: false,
        message: aiErr.message || 'Local AI server is unavailable. Please make sure Ollama is running.',
      });
    }

    const generationRecord = await dbRepo.createGeneration({
      userId,
      toolType: 'text',
      prompt: prompt.trim(),
      result: aiResult.text,
      provider: aiResult.provider || 'ollama',
      metadata: {
        model: aiResult.model,
        usage: aiResult.usage,
        temperature,
        isLocal: true,
      },
    });

    return successResponse(
      res,
      {
        result: aiResult.text,
        provider: aiResult.provider || 'ollama',
        model: aiResult.model,
        usage: aiResult.usage,
        isLocal: true,
        generationId: generationRecord?.id || 'gen_' + Date.now(),
      },
      'Text generated successfully via local AI model!'
    );
  } catch (error) {
    logger.error('Text generation failed:', error.message);
    next(error);
  }
};

/**
 * Visual generation endpoint (Modular vision pipeline)
 * POST /api/ai/generate-image
 */
export const generateImage = async (req, res, next) => {
  try {
    const { prompt, style = 'Photorealistic', size = '1024x1024' } = req.body;
    const userId = req.user?.id || 'usr_guest';

    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Image prompt is required.',
      });
    }

    logger.info(`Generating image for user [${userId}]: "${prompt.substring(0, 40)}"`);

    const aiResult = await aiRouter.generateImage({
      prompt: prompt.trim(),
      style,
      size,
    });

    const generationRecord = await dbRepo.createGeneration({
      userId,
      toolType: 'image',
      prompt: prompt.trim(),
      result: aiResult.imageUrl,
      provider: aiResult.provider,
      metadata: {
        style,
        size,
        revisedPrompt: aiResult.revisedPrompt,
        model: aiResult.model,
        architectureNote: aiResult.architectureNote,
      },
    });

    return successResponse(
      res,
      {
        imageUrl: aiResult.imageUrl,
        revisedPrompt: aiResult.revisedPrompt,
        provider: aiResult.provider,
        model: aiResult.model,
        generationId: generationRecord?.id || 'gen_' + Date.now(),
      },
      'Image generated successfully!'
    );
  } catch (error) {
    logger.error('Image generation failed:', error.message);
    next(error);
  }
};

/**
 * Long-form article generation endpoint (Local model)
 * POST /api/ai/generate-article
 */
export const generateArticle = async (req, res, next) => {
  try {
    const { topic, tone = 'Professional', length = 'Medium', keywords = [], provider = 'ollama' } = req.body;
    const userId = req.user?.id || 'usr_guest';

    if (!topic || topic.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Article topic is required.',
      });
    }

    logger.info(`Generating article for user [${userId}] on topic: "${topic}" via local AI`);

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
      const statusCode = aiErr.statusCode || (aiErr.isOllamaUnavailable ? 503 : 500);
      return res.status(statusCode).json({
        success: false,
        message: aiErr.message || 'Local AI generation failed.',
      });
    }

    const generationRecord = await dbRepo.createGeneration({
      userId,
      toolType: 'article',
      prompt: `Topic: ${topic} | Tone: ${tone} | Length: ${length}`,
      result: aiResult.text,
      provider: aiResult.provider || 'ollama',
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
        provider: aiResult.provider || 'ollama',
        model: aiResult.model,
        isLocal: true,
        generationId: generationRecord?.id || 'gen_' + Date.now(),
      },
      'Article generated successfully via local AI model!'
    );
  } catch (error) {
    logger.error('Article generation failed:', error.message);
    next(error);
  }
};

/**
 * Headline and title generation endpoint (Local model)
 * POST /api/ai/generate-titles
 */
export const generateTitles = async (req, res, next) => {
  try {
    const { topic, description = '', contentType = 'Blog Post', provider = 'ollama' } = req.body;
    const userId = req.user?.id || 'usr_guest';

    if (!topic || topic.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Topic is required to generate titles.',
      });
    }

    logger.info(`Generating titles for user [${userId}] for topic: "${topic}" via local AI`);

    let aiResult;
    try {
      aiResult = await aiRouter.generateTitles({
        topic: topic.trim(),
        description,
        contentType,
        provider,
      });
    } catch (aiErr) {
      const statusCode = aiErr.statusCode || (aiErr.isOllamaUnavailable ? 503 : 500);
      return res.status(statusCode).json({
        success: false,
        message: aiErr.message || 'Local AI generation failed.',
      });
    }

    const generationRecord = await dbRepo.createGeneration({
      userId,
      toolType: 'title',
      prompt: `Topic: ${topic} | Type: ${contentType}`,
      result: JSON.stringify(aiResult.titles),
      provider: aiResult.provider || 'ollama',
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
        provider: aiResult.provider || 'ollama',
        model: aiResult.model,
        isLocal: true,
        generationId: generationRecord?.id || 'gen_' + Date.now(),
      },
      'Titles generated successfully via local AI model!'
    );
  } catch (error) {
    logger.error('Title generation failed:', error.message);
    next(error);
  }
};
