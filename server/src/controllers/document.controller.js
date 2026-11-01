import path from 'path';
import dbRepo from '../config/dbRepository.js';
import fileParserService from '../services/file/fileParser.service.js';
import storageService from '../services/file/storage.service.js';
import documentAIService from '../services/ai/documentAIService.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';

export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'Please select a PDF, DOCX, or TXT file to upload.', 400);
    }

    const userId = req.user.id;
    const file = req.file;
    const fileExt = path.extname(file.originalname).replace('.', '').toLowerCase();

    logger.info(`Uploading file [${file.originalname}] for user [${userId}]`);

    let extractedText = '';
    try {
      extractedText = await fileParserService.extractText(file.path, file.originalname);
    } catch (parseErr) {
      await storageService.deleteFile(file.path);
      return errorResponse(res, `Failed to extract text from document: ${parseErr.message}`, 400);
    }

    const documentRecord = await dbRepo.createDocument({
      userId,
      fileName: file.originalname,
      filePath: file.path,
      fileType: fileExt,
      fileSize: file.size,
      extractedText: extractedText,
    });

    return successResponse(
      res,
      {
        document: {
          id: documentRecord?.id || 'doc_' + Date.now(),
          fileName: file.originalname,
          fileType: fileExt,
          fileSize: file.size,
          textLength: extractedText.length,
          previewText: extractedText.substring(0, 300) + '...',
          uploadedAt: new Date(),
        },
      },
      'Document uploaded and parsed successfully!',
      201
    );
  } catch (error) {
    logger.error('Document upload error:', error.message);
    next(error);
  }
};

export const analyzeDocument = async (req, res, next) => {
  try {
    const { documentId, rawText, fileName = 'Document', mode = 'summarize', provider = 'ollama' } = req.body;
    const userId = req.user.id;

    let textToAnalyze = rawText;
    let docRecord = null;

    if (documentId) {
      docRecord = await dbRepo.findDocumentById(documentId, userId);
      if (!docRecord) {
        return errorResponse(res, 'Document not found or access denied.', 404);
      }
      textToAnalyze = docRecord.extractedText;
    }

    if (!textToAnalyze || textToAnalyze.trim() === '') {
      return errorResponse(res, 'No document text provided for analysis.', 400);
    }

    logger.info(`Analyzing document "${docRecord?.fileName || fileName}" for user [${userId}] via local AI`);

    let analysisResult;
    try {
      analysisResult = await documentAIService.analyzeDocument({
        text: textToAnalyze,
        fileName: docRecord?.fileName || fileName,
        mode,
        provider,
      });
    } catch (aiErr) {
      const statusCode = aiErr.statusCode || (aiErr.isOllamaUnavailable ? 503 : 500);
      return res.status(statusCode).json({
        success: false,
        message: aiErr.message || 'Local AI document analysis failed.',
      });
    }

    if (docRecord) {
      await dbRepo.updateDocument(docRecord.id, { analysis: analysisResult });
    }

    const generationRecord = await dbRepo.createGeneration({
      userId,
      toolType: 'document',
      prompt: `Analyze document: ${docRecord?.fileName || fileName} (Mode: ${mode})`,
      result: JSON.stringify(analysisResult),
      provider: analysisResult.provider || 'ollama',
      metadata: {
        fileName: docRecord?.fileName || fileName,
        mode,
        documentId: docRecord?.id,
        model: analysisResult.model || 'gpt-oss:20b',
        isLocal: true,
      },
    });

    return successResponse(
      res,
      {
        analysis: analysisResult,
        generationId: generationRecord?.id || 'gen_' + Date.now(),
        documentId: docRecord?.id,
      },
      'Document analyzed successfully via local AI model!'
    );
  } catch (error) {
    logger.error('Document analysis error:', error.message);
    next(error);
  }
};

export const getUserDocuments = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const documents = await dbRepo.getDocumentsByUserId(userId);
    return successResponse(res, { documents }, 'Documents retrieved successfully.');
  } catch (error) {
    next(error);
  }
};

export const getDocumentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const document = await dbRepo.findDocumentById(id, userId);
    if (!document) {
      return errorResponse(res, 'Document not found.', 404);
    }

    return successResponse(res, { document }, 'Document details retrieved.');
  } catch (error) {
    next(error);
  }
};

export const deleteDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const document = await dbRepo.findDocumentById(id, userId);
    if (!document) {
      return errorResponse(res, 'Document not found or unauthorized.', 404);
    }

    if (document.filePath) {
      await storageService.deleteFile(document.filePath);
    }

    await dbRepo.deleteDocument(id, userId);

    return successResponse(res, {}, 'Document deleted successfully.');
  } catch (error) {
    next(error);
  }
};

export default {
  uploadDocument,
  analyzeDocument,
  getUserDocuments,
  getDocumentById,
  deleteDocument,
};
