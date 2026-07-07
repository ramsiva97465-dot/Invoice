import { config } from './config/env';
import app from './app';
import { logger } from './utils/logger';

const server = app.listen(config.port, () => {
  logger.info(
    `✅ Xivora Backend running on port ${config.port} [${config.nodeEnv}]`
  );
});

// ── Graceful shutdown ─────────────────────────────────────

const shutdown = (signal: string) => {
  logger.info(`${signal} received — shutting down gracefully…`);
  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// ── Crash guards ──────────────────────────────────────────

process.on('unhandledRejection', (reason: unknown) => {
  logger.error('Unhandled Promise Rejection', reason);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err: Error) => {
  logger.error('Uncaught Exception', err);
  server.close(() => process.exit(1));
});
