import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '@/core/utils/jwt';
import { UnauthorizedError } from '@/core/exceptions/AppError';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      throw new UnauthorizedError('Authentication token is missing');
    }

    const payload = verifyAccessToken(token);
    (req as any).user = payload;
    
    next();
  } catch (error) {
    next(new UnauthorizedError('Invalid or expired authentication token'));
  }
};
