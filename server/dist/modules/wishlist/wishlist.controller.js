"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WishlistController = void 0;
const wishlist_service_1 = require("./wishlist.service");
class WishlistController {
    static async addToWishlist(req, res, next) {
        try {
            const userId = req.user.id;
            const { itemId } = req.body;
            const result = await wishlist_service_1.WishlistService.addToWishlist(userId, itemId);
            res.status(201).json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    }
    static async removeFromWishlist(req, res, next) {
        try {
            const userId = req.user.id;
            const { itemId } = req.params;
            await wishlist_service_1.WishlistService.removeFromWishlist(userId, itemId);
            res.status(200).json({ success: true, message: 'Item removed from wishlist' });
        }
        catch (error) {
            next(error);
        }
    }
    static async getWishlist(req, res, next) {
        try {
            const userId = req.user.id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const result = await wishlist_service_1.WishlistService.getWishlist(userId, page, limit);
            res.status(200).json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    }
    static async checkWishlistStatus(req, res, next) {
        try {
            const userId = req.user.id;
            const { itemId } = req.params;
            const result = await wishlist_service_1.WishlistService.checkWishlistStatus(userId, itemId);
            res.status(200).json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    }
    static async getWishlistCount(req, res, next) {
        try {
            const userId = req.user.id;
            const result = await wishlist_service_1.WishlistService.getWishlistCount(userId);
            res.status(200).json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.WishlistController = WishlistController;
