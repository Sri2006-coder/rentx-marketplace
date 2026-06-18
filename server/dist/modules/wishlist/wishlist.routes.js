"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const wishlist_controller_1 = require("./wishlist.controller");
const requireAuth_1 = require("@/api/middlewares/requireAuth");
const validate_1 = require("@/api/middlewares/validate");
const wishlist_schema_1 = require("./wishlist.schema");
const router = (0, express_1.Router)();
// All wishlist routes require authentication
router.use(requireAuth_1.requireAuth);
// POST /api/v1/wishlist — Add item to wishlist
router.post('/', (0, validate_1.validate)(wishlist_schema_1.addToWishlistSchema), wishlist_controller_1.WishlistController.addToWishlist);
// GET /api/v1/wishlist — Get user's wishlist
router.get('/', wishlist_controller_1.WishlistController.getWishlist);
// GET /api/v1/wishlist/count — Get wishlist count
router.get('/count', wishlist_controller_1.WishlistController.getWishlistCount);
// GET /api/v1/wishlist/check/:itemId — Check if item is in wishlist
router.get('/check/:itemId', wishlist_controller_1.WishlistController.checkWishlistStatus);
// DELETE /api/v1/wishlist/:itemId — Remove item from wishlist
router.delete('/:itemId', wishlist_controller_1.WishlistController.removeFromWishlist);
exports.default = router;
