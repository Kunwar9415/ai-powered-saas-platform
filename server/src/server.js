import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Utility & Middleware imports
import { logger } from './utils/logger.js';
import { errorHandler } from './middleware/error.middleware.js';
import { globalLimiter } from './middleware/rateLimiter.middleware.js';
import prisma from './config/db.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import aiRoutes from './routes/ai.routes.js';
import documentRoutes from './routes/document.routes.js';
import resumeRoutes from './routes/resume.routes.js';
import historyRoutes from './routes/history.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// 1. Security & Core Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(
  cors({
    origin: [CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// 2. Global Rate Limiting
app.use('/api/', globalLimiter);

// 3. Static Files (Uploads Directory)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 4. API Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    project: 'AI-POWERED SAAS PLATFORM BASED ON GENERATIVE AI',
    version: '1.0.0',
    database: prisma ? 'connected' : 'disconnected',
  });
});

// 5. API Route Registration
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 6. 404 Route Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`,
  });
});

// 7. Centralized Error Handler
app.use(errorHandler);

// 8. Server Bootstrap (Only start listener if executed directly via node src/server.js)
let server = null;
const isDirectRun = process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('src/server.js');
if (isDirectRun) {
  server = app.listen(PORT, () => {
    logger.success(`🚀 Server running in [${process.env.NODE_ENV || 'development'}] mode on port ${PORT}`);
    logger.info(`📡 REST API endpoint available at http://localhost:${PORT}/api`);
    logger.info(`✨ AI SaaS Platform backend initialized.`);
  });
}

// Graceful Shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  if (server) {
    server.close(async () => {
      if (prisma) await prisma.$disconnect();
      process.exit(0);
    });
  }
});

export default app;
