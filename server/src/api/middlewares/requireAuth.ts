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
    
    // Backward compatibility for existing tokens that used 'userId' instead of 'id'
    if (payload.userId && !payload.id) {
      payload.id = payload.userId;
    }
    
    (req as any).user = payload;
    
    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else {
      next(new UnauthorizedError('Invalid or expired authentication token'));
    }
  }
};

export const requireRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      console.log('requireRole check:', { expectedRole: role, userRole: user?.role, user });
      if (!user) {
        throw new UnauthorizedError('User not authenticated');
      }
      if (user.role !== role) {
        res.status(403).json({ success: false, message: 'Forbidden: Insufficient permissions' });
        return;
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
