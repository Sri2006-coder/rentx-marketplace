import { Router } from 'express';
import { ReviewController } from './review.controller';
import { requireAuth } from '../../api/middlewares/requireAuth';
import { validate } from '../../api/middlewares/validate';
import { createReviewSchema } from './review.schema';

const router = Router();

// POST /api/v1/reviews
router.post(
  '/reviews',
  requireAuth,
  validate(createReviewSchema),
  ReviewController.createReview
);

// GET /api/v1/items/:id/reviews
router.get(
  '/items/:id/reviews',
  ReviewController.getReviewsForItem
);

// GET /api/v1/users/:id/reviews
router.get(
  '/users/:id/reviews',
  ReviewController.getReviewsForUser
);

// GET /api/v1/users/:id/reputation
router.get(
  '/users/:id/reputation',
  ReviewController.getUserReputation
);

export default router;
