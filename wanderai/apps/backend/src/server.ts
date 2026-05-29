import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { apiRateLimiter } from './middleware/rate-limit.js';
import { correlationIdMiddleware } from './middleware/correlation-id.js';
import { errorHandler } from './middleware/error-handler.js';
import { requestLogger } from './middleware/request-logger.js';
import { optionalAuth } from './middleware/auth.js';
import { apiRouter } from './routes/index.js';
import { sendSuccess } from './utils/http-response.js';

export const createServer = (): express.Express => {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(
    cors({
      origin: env.NODE_ENV === 'production' ? env.APP_URL : true,
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(correlationIdMiddleware);
  app.use(requestLogger);
  app.get('/health', (_req, res) => {
    sendSuccess(res, {
      status: 'ok',
      service: 'wanderai-backend',
      timestamp: new Date().toISOString(),
    });
  });
  app.use('/api/v1', optionalAuth, apiRateLimiter, apiRouter);
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Route not found.',
      },
    });
  });
  app.use(errorHandler);

  return app;
};
