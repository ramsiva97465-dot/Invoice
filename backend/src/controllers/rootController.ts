import { Request, Response } from 'express';

/**
 * GET /
 * Returns service metadata.
 */
export const getRoot = (_req: Request, res: Response): void => {
  res.json({
    service: 'Xivora Backend',
    status: 'running',
    version: '1.0.0',
  });
};

/**
 * GET /health
 * Returns health status for load balancers / Render health checks.
 */
export const getHealth = (_req: Request, res: Response): void => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
};
