import { Request, Response } from 'express';

/** GET / — service identification */
export const getRoot = (_req: Request, res: Response): void => {
  res.json({
    service: 'Xivora Backend',
    status: 'running',
    version: '1.0.0',
  });
};

/** GET /health — used by Render health checks */
export const getHealth = (_req: Request, res: Response): void => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
};
