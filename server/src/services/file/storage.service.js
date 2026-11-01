import fs from 'fs';
import path from 'path';
import { logger } from '../../utils/logger.js';

export class StorageService {
  /**
   * Delete local file safely
   */
  async deleteFile(filePath) {
    try {
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        logger.info(`Deleted local file: ${filePath}`);
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Failed to delete file:', error.message);
      return false;
    }
  }

  /**
   * Generates public or relative path for storage
   */
  getFileMetadata(file) {
    return {
      fileName: file.originalname,
      filePath: file.path,
      fileType: path.extname(file.originalname).replace('.', '').toLowerCase(),
      fileSize: file.size,
    };
  }
}

export default new StorageService();
