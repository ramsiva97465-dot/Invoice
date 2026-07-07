import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { errorHandler } from './middleware/errorHandler';
import { getRoot, getHealth } from './controllers/rootController';
import apiRoutes from './routes';

const app: Application = express();

// ── Security & parsing ────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: [
      "https://invoice-green-xi.vercel.app",
      "http://localhost:5173"
    ],
    credentials: true
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ── Rate limiting ─────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
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

// ── Global error handler (must be last) ──────────────────
app.use(errorHandler);

export default app;
