import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { LoginInput, RegisterInput } from './auth.schema';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as RegisterInput;
      const result = await AuthService.register(data);

      res.cookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.status(201).json({ success: true, data: { user: result.user } });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as LoginInput;
      const result = await AuthService.login(data);

      res.cookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.status(200).json({ success: true, data: { user: result.user } });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      // @ts-ignore - req.user is set by requireAuth middleware
      const userId = req.user.id;
      const user = await AuthService.getMe(userId);
      
      res.status(200).json({ success: true, data: { user } });
    } catch (error) {
      next(error);
    }
  }
}
