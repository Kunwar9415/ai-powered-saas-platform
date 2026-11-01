import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { logger } from '../../utils/logger.js';

export class FileParserService {
  /**
   * Extracts raw plain text from PDF, DOCX, or TXT file path
   */
  async extractText(filePath, originalFilename = '') {
    const ext = path.extname(originalFilename || filePath).toLowerCase();
    logger.info(`Extracting text from file: ${filePath} (${ext})`);

    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found at path: ${filePath}`);
      }

      const fileBuffer = fs.readFileSync(filePath);

      if (ext === '.pdf') {
        const data = await pdfParse(fileBuffer);
        const extracted = (data.text || '').trim();
        if (!extracted) {
          throw new Error('PDF appears to be scanned or contains no extractable text layer.');
        }
        return extracted;
      }

      if (ext === '.docx' || ext === '.doc') {
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        const extracted = (result.value || '').trim();
        if (!extracted) {
          throw new Error('DOCX file contains no readable text.');
        }
        return extracted;
      }

      if (ext === '.txt') {
        return fileBuffer.toString('utf-8').trim();
      }

      // Default try string decode
      return fileBuffer.toString('utf-8').trim();
    } catch (error) {
      logger.error('File parsing error:', error.message);
      throw new Error(`Failed to parse document content: ${error.message}`);
    }
  }
}

export default new FileParserService();
