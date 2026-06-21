import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import authRoutes from './api/routes/v1/auth.routes';
import itemRoutes from './modules/item/item.routes';
import bookingRoutes from './modules/booking/booking.routes';
import reviewRoutes from './modules/review/review.routes';
import wishlistRoutes from './modules/wishlist/wishlist.routes';
import verificationRoutes from './modules/verification/verification.routes';
import paymentRoutes from './modules/payment/payment.routes';
import adminRoutes from './modules/admin/admin.routes';
import chatRoutes from './modules/chat/chat.routes';
import notificationRoutes from './modules/notification/notification.routes';
import { VerificationController } from './modules/verification/verification.controller';
import { errorHandler } from './api/middlewares/errorHandler';
import { verifyCloudinaryConnection } from './config/cloudinary';

verifyCloudinaryConnection();

const app = express();

import path from 'path';

// Global Middlewares
app.use(helmet({ crossOriginResourcePolicy: false })); // Allow cross-origin images
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Health Check Route for Railway Deployment
app.get('/', (req, res) => {
  res.json({
    status: "ok",
    app: "RentX Backend",
    environment: process.env.NODE_ENV || "development"
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/items', itemRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1', reviewRoutes);
app.use('/api/v1/wishlist', wishlistRoutes);
app.use('/api/v1/verification', verificationRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// Custom user trust score route
app.get('/api/v1/users/:id/trust-score', VerificationController.getUserTrustScore);

// Health Check
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Global Error Handler
app.use(errorHandler);

export default app;
