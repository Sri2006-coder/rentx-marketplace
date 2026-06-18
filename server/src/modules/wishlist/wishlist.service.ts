import { WishlistRepository } from './wishlist.repository';
import { ConflictError, NotFoundError } from '@/core/exceptions/AppError';

export class WishlistService {
  static async addToWishlist(userId: string, itemId: string) {
    // Check if already in wishlist
    const exists = await WishlistRepository.isItemInWishlist(userId, itemId);
    if (exists) {
      throw new ConflictError('Item is already in your wishlist');
    }

    return WishlistRepository.addToWishlist(userId, itemId);
  }

  static async removeFromWishlist(userId: string, itemId: string) {
    const exists = await WishlistRepository.isItemInWishlist(userId, itemId);
    if (!exists) {
      throw new NotFoundError('Item is not in your wishlist');
    }

    return WishlistRepository.removeFromWishlist(userId, itemId);
  }

  static async getWishlist(userId: string, page: number = 1, limit: number = 20) {
    return WishlistRepository.getWishlistByUser(userId, page, limit);
  }

  static async checkWishlistStatus(userId: string, itemId: string) {
    const isWishlisted = await WishlistRepository.isItemInWishlist(userId, itemId);
    return { isWishlisted };
  }

  static async getWishlistCount(userId: string) {
    const count = await WishlistRepository.getWishlistCount(userId);
    return { count };
  }
}
