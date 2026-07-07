import app from './app';
import { config } from './config/env';
import { logger } from './utils/logger';

const server = app.listen(config.port, () => {
  logger.info(`Xivora Backend is running on port ${config.port} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Handle uncaught exceptions and unhandled promise rejections
process.on('unhandledRejection', (err: any) => {
  logger.error('Unhandled Promise Rejection, shutting down...', err);
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err: Error) => {
  logger.error('Uncaught Exception, shutting down...', err);
  server.close(() => {
    process.exit(1);
  });
});
