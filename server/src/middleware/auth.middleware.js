import { verifyToken } from '../utils/token.js';
import { errorResponse } from '../utils/apiResponse.js';
import dbRepo from '../config/dbRepository.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Access denied. No authentication token provided.', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded || !decoded.userId) {
      return errorResponse(res, 'Invalid or expired authentication session. Please log in again.', 401);
    }

    // Fetch user through repository
    const user = await dbRepo.findUserById(decoded.userId);

    if (!user) {
      // If token payload contains valid user info, fallback cleanly
      if (decoded.email) {
        req.user = { id: decoded.userId, email: decoded.email, name: decoded.name || 'Demo User' };
        return next();
      }
      return errorResponse(res, 'User associated with this token no longer exists.', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    return errorResponse(res, 'Authentication failed: ' + error.message, 401);
  }
};
