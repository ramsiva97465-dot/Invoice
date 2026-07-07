import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { errorHandler } from './middleware/errorHandler';
import { getRoot, getHealth } from './controllers/rootController';
import apiRoutes from './routes';

const app = express();

// ── Security & parsing ───────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// ── Rate limiting ────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});
app.use(limiter);

// ── Root endpoints ────────────────────────────────────────
app.get('/', getRoot);
app.get('/health', getHealth);

// ── API v1 routes ─────────────────────────────────────────
app.use('/api/v1', apiRoutes);

// ── Global error handler ──────────────────────────────────
app.use(errorHandler);

export default app;
