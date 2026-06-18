import { Request, Response, NextFunction } from 'express';
import { ReviewService } from './review.service';
import { getReviewsQuerySchema } from './review.schema';

export class ReviewController {
  static async createReview(req: Request, res: Response, next: NextFunction) {
    try {
      const review = await ReviewService.createReview(req.user!.id, req.body);
      res.status(201).json({
        success: true,
        data: review,
        message: 'Review submitted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async getReviewsForItem(req: Request, res: Response, next: NextFunction) {
    try {
      const query = await getReviewsQuerySchema.parseAsync(req.query);
      const result = await ReviewService.getReviewsForItem(req.params.id, query);
      res.status(200).json({
        success: true,
        data: {
          reviews: result.reviews,
          meta: {
            total: result.total,
            page: query.page,
            limit: query.limit,
            totalPages: Math.ceil(result.total / query.limit),
          },
        },
        message: 'Item reviews retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async getReviewsForUser(req: Request, res: Response, next: NextFunction) {
    try {
      const query = await getReviewsQuerySchema.parseAsync(req.query);
      const result = await ReviewService.getReviewsForUser(req.params.id, query);
      res.status(200).json({
        success: true,
        data: {
          reviews: result.reviews,
          meta: {
            total: result.total,
            page: query.page,
            limit: query.limit,
            totalPages: Math.ceil(result.total / query.limit),
          },
        },
        message: 'User reviews retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUserReputation(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ReviewService.getUserReputation(req.params.id);
      res.status(200).json({
        success: true,
        data: result,
        message: 'User reputation stats retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
