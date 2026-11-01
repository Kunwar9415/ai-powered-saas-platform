import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';

let prisma = null;
let isPostgresConnected = false;

try {
  prisma = new PrismaClient({
    log: ['error'],
  });

  // Test connection asynchronously
  prisma.$connect()
    .then(() => {
      isPostgresConnected = true;
      logger.success('🐘 Connected to PostgreSQL database via Prisma ORM');
    })
    .catch((err) => {
      isPostgresConnected = false;
      logger.warn('⚠️  PostgreSQL is not reachable locally. Activating resilient in-memory data store for live testing.');
    });
} catch (error) {
  logger.error('Failed to initialize Prisma Client:', error.message);
}

export const getDbStatus = () => isPostgresConnected;

export default prisma;
