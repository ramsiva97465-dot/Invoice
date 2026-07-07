export const logger = {
  info(message: string, ...meta: any[]) {
    console.log(`[INFO] ${new Date().toISOString()}: ${message}`, ...meta);
  },
  error(message: string, error?: any, ...meta: any[]) {
    console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, error, ...meta);
  },
  warn(message: string, ...meta: any[]) {
    console.warn(`[WARN] ${new Date().toISOString()}: ${message}`, ...meta);
  }
};
