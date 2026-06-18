import { Request, Response, NextFunction } from 'express';
import { WishlistService } from './wishlist.service';

export class WishlistController {
  static async addToWishlist(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { itemId } = req.body;
      const result = await WishlistService.addToWishlist(userId, itemId);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async removeFromWishlist(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { itemId } = req.params;
      await WishlistService.removeFromWishlist(userId, itemId);
      res.status(200).json({ success: true, message: 'Item removed from wishlist' });
    } catch (error) {
      next(error);
    }
  }

  static async getWishlist(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await WishlistService.getWishlist(userId, page, limit);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async checkWishlistStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { itemId } = req.params;
      const result = await WishlistService.checkWishlistStatus(userId, itemId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getWishlistCount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const result = await WishlistService.getWishlistCount(userId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
