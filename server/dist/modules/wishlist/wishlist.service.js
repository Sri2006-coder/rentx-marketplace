"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WishlistService = void 0;
const wishlist_repository_1 = require("./wishlist.repository");
const AppError_1 = require("@/core/exceptions/AppError");
class WishlistService {
    static async addToWishlist(userId, itemId) {
        // Check if already in wishlist
        const exists = await wishlist_repository_1.WishlistRepository.isItemInWishlist(userId, itemId);
        if (exists) {
            throw new AppError_1.ConflictError('Item is already in your wishlist');
        }
        return wishlist_repository_1.WishlistRepository.addToWishlist(userId, itemId);
    }
    static async removeFromWishlist(userId, itemId) {
        const exists = await wishlist_repository_1.WishlistRepository.isItemInWishlist(userId, itemId);
        if (!exists) {
            throw new AppError_1.NotFoundError('Item is not in your wishlist');
        }
        return wishlist_repository_1.WishlistRepository.removeFromWishlist(userId, itemId);
    }
    static async getWishlist(userId, page = 1, limit = 20) {
        return wishlist_repository_1.WishlistRepository.getWishlistByUser(userId, page, limit);
    }
    static async checkWishlistStatus(userId, itemId) {
        const isWishlisted = await wishlist_repository_1.WishlistRepository.isItemInWishlist(userId, itemId);
        return { isWishlisted };
    }
    static async getWishlistCount(userId) {
        const count = await wishlist_repository_1.WishlistRepository.getWishlistCount(userId);
        return { count };
    }
}
exports.WishlistService = WishlistService;
