"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewController = void 0;
const review_service_1 = require("./review.service");
const review_schema_1 = require("./review.schema");
class ReviewController {
    static async createReview(req, res, next) {
        try {
            const review = await review_service_1.ReviewService.createReview(req.user.id, req.body);
            res.status(201).json({
                success: true,
                data: review,
                message: 'Review submitted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getReviewsForItem(req, res, next) {
        try {
            const query = await review_schema_1.getReviewsQuerySchema.parseAsync(req.query);
            const result = await review_service_1.ReviewService.getReviewsForItem(req.params.id, query);
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
        }
        catch (error) {
            next(error);
        }
    }
    static async getReviewsForUser(req, res, next) {
        try {
            const query = await review_schema_1.getReviewsQuerySchema.parseAsync(req.query);
            const result = await review_service_1.ReviewService.getReviewsForUser(req.params.id, query);
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
        }
        catch (error) {
            next(error);
        }
    }
    static async getUserReputation(req, res, next) {
        try {
            const result = await review_service_1.ReviewService.getUserReputation(req.params.id);
            res.status(200).json({
                success: true,
                data: result,
                message: 'User reputation stats retrieved successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ReviewController = ReviewController;
