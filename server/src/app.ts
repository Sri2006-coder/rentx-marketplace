import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './api/routes/v1/auth.routes';
import { errorHandler } from './api/middlewares/errorHandler';

const app = express();

// Global Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// API Routes
app.use('/api/v1/auth', authRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Global Error Handler
app.use(errorHandler);

export default app;
