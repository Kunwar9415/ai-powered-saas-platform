import express from 'express';
import {
  getUserHistory,
  getHistoryById,
  deleteHistoryItem,
  clearAllHistory,
} from '../controllers/history.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authenticate, getUserHistory);
router.get('/:id', authenticate, getHistoryById);
router.delete('/clear-all', authenticate, clearAllHistory);
router.delete('/:id', authenticate, deleteHistoryItem);

export default router;
