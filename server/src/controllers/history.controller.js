import dbRepo from '../config/dbRepository.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';

export const getUserHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { toolType, search, page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;

    const { history, total } = await dbRepo.getHistory({
      userId,
      toolType,
      search,
      page: pageNum,
      limit: limitNum,
    });

    return successResponse(
      res,
      {
        history,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum) || 1,
        },
      },
      'History retrieved successfully.'
    );
  } catch (error) {
    logger.error('Get history error:', error.message);
    next(error);
  }
};

export const getHistoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { history } = await dbRepo.getHistory({ userId });
    const item = history.find((h) => (h.historyId || h.id) === id);

    if (!item) {
      return errorResponse(res, 'History item not found or unauthorized.', 404);
    }

    return successResponse(res, { history: item }, 'History item retrieved.');
  } catch (error) {
    next(error);
  }
};

export const deleteHistoryItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await dbRepo.deleteHistory(id, userId);

    return successResponse(res, {}, 'History item deleted successfully.');
  } catch (error) {
    next(error);
  }
};

export const clearAllHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;

    await dbRepo.clearHistory(userId);

    return successResponse(res, {}, 'All history cleared successfully.');
  } catch (error) {
    next(error);
  }
};
