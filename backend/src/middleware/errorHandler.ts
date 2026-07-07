import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  const statusCode = err.statusCode ?? 500;
  const message = err.message || 'Internal Server Error';

  logger.error(`[${req.method} ${req.url}] ${message}`, err);

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
  });
};
