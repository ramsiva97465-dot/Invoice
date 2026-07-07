const ts = () => new Date().toISOString();

export const logger = {
  info: (message: string, ...meta: unknown[]): void => {
    console.log(`[INFO]  ${ts()} ${message}`, ...meta);
  },
  warn: (message: string, ...meta: unknown[]): void => {
    console.warn(`[WARN]  ${ts()} ${message}`, ...meta);
  },
  error: (message: string, error?: unknown, ...meta: unknown[]): void => {
    console.error(`[ERROR] ${ts()} ${message}`, error ?? '', ...meta);
  },
};
