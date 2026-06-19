import { Router } from 'express';
import { WishlistController } from './wishlist.controller';
import { requireAuth } from '../../api/middlewares/requireAuth';
import { validate } from '../../api/middlewares/validate';
import { addToWishlistSchema } from './wishlist.schema';

const router = Router();

// All wishlist routes require authentication
router.use(requireAuth);

// POST /api/v1/wishlist — Add item to wishlist
router.post(
  '/',
  validate(addToWishlistSchema),
  WishlistController.addToWishlist
);

// GET /api/v1/wishlist — Get user's wishlist
router.get(
  '/',
  WishlistController.getWishlist
);

// GET /api/v1/wishlist/count — Get wishlist count
router.get(
  '/count',
  WishlistController.getWishlistCount
);

// GET /api/v1/wishlist/check/:itemId — Check if item is in wishlist
router.get(
  '/check/:itemId',
  WishlistController.checkWishlistStatus
);

// DELETE /api/v1/wishlist/:itemId — Remove item from wishlist
router.delete(
  '/:itemId',
  WishlistController.removeFromWishlist
);

export default router;
