import dbRepo from '../config/dbRepository.js';
import fileParserService from '../services/file/fileParser.service.js';
import storageService from '../services/file/storage.service.js';
import documentAIService from '../services/ai/documentAIService.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';

export const analyzeResume = async (req, res, next) => {
  let uploadedFilePath = null;
  try {
    const userId = req.user.id;
    const { provider = 'ollama', targetRole } = req.body;

    let resumeText = '';
    let fileName = 'Resume';

    if (req.file) {
      fileName = req.file.originalname;
      uploadedFilePath = req.file.path;
      try {
        resumeText = await fileParserService.extractText(uploadedFilePath, fileName);
      } catch (err) {
        if (uploadedFilePath) await storageService.deleteFile(uploadedFilePath);
        return errorResponse(res, `Failed to parse resume: ${err.message}`, 400);
      }
    } else if (req.body.resumeText) {
      resumeText = req.body.resumeText;
      fileName = req.body.fileName || 'Pasted Resume Text';
    } else {
      return errorResponse(res, 'Please upload a PDF/DOCX resume or provide resume text.', 400);
    }

    if (!resumeText || resumeText.trim().length < 40) {
      if (uploadedFilePath) await storageService.deleteFile(uploadedFilePath);
      return errorResponse(res, 'Resume contains insufficient readable text for analysis.', 400);
    }

    logger.info(`Analyzing resume "${fileName}" for user [${userId}] via local AI engine`);

    let analysisResult;
    try {
      analysisResult = await documentAIService.analyzeResume({
        text: resumeText,
        fileName,
        targetRole,
        provider,
      });
    } catch (aiErr) {
      if (uploadedFilePath) await storageService.deleteFile(uploadedFilePath);
      const statusCode = aiErr.statusCode || (aiErr.isOllamaUnavailable ? 503 : 500);
      return res.status(statusCode).json({
        success: false,
        message: aiErr.message || 'Local AI resume analysis failed.',
      });
    }

    const generationRecord = await dbRepo.createGeneration({
      userId,
      toolType: 'resume',
      prompt: `Resume analysis: ${fileName} ${targetRole ? `(Target: ${targetRole})` : ''}`,
      result: JSON.stringify(analysisResult),
      provider: analysisResult.provider || 'ollama',
      metadata: {
        fileName,
        targetRole,
        candidateOverview: analysisResult.candidateOverview,
        model: analysisResult.model || 'gpt-oss:20b',
        isLocal: true,
      },
    });

    if (uploadedFilePath) {
      await storageService.deleteFile(uploadedFilePath);
    }

    return successResponse(
      res,
      {
        analysis: analysisResult,
        generationId: generationRecord?.id || 'gen_' + Date.now(),
      },
      'Resume analyzed successfully via local AI model!'
    );
  } catch (error) {
    if (uploadedFilePath) {
      await storageService.deleteFile(uploadedFilePath).catch(() => {});
    }
    logger.error('Resume analysis failed:', error.message);
    next(error);
  }
};

export default { analyzeResume };
