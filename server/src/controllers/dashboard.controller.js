import dbRepo from '../config/dbRepository.js';
import { successResponse } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const stats = await dbRepo.getDashboardStats(userId);

    return successResponse(res, stats, 'Dashboard stats retrieved successfully.');
  } catch (error) {
    logger.error('Dashboard stats error:', error.message);
    next(error);
  }
};
