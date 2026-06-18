"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewService = void 0;
const review_repository_1 = require("./review.repository");
const db_1 = require("@/config/db");
const client_1 = require("@prisma/client");
const AppError_1 = require("@/core/exceptions/AppError");
const audit_service_1 = require("../audit/audit.service");
const verification_service_1 = require("../verification/verification.service");
class ReviewService {
    static async createReview(userId, data) {
        const { bookingId, rating, comment } = data;
        // 1. Fetch booking details
        const booking = await db_1.db.booking.findUnique({
            where: { id: bookingId },
            include: { item: true },
        });
        if (!booking) {
            throw new AppError_1.NotFoundError('Booking not found');
        }
        // 2. Validate booking status is COMPLETED
        if (booking.status !== client_1.BookingStatus.COMPLETED) {
            throw new AppError_1.BadRequestError('Only completed bookings can be reviewed');
        }
        // 3. Verify user ownership & determine roles
        const isRenter = booking.renterId === userId;
        const isOwner = booking.item.ownerId === userId;
        if (!isRenter && !isOwner) {
            throw new AppError_1.ForbiddenError('You do not have permission to review this booking');
        }
        // Determine reviewer and reviewee
        const reviewerId = userId;
        const revieweeId = isRenter ? booking.item.ownerId : booking.renterId;
        const itemId = booking.itemId;
        // 4. Block self reviews
        if (reviewerId === revieweeId) {
            throw new AppError_1.BadRequestError('Users cannot review themselves');
        }
        // 5. Prevent duplicate reviews by the same user for this booking
        const existingReview = await review_repository_1.ReviewRepository.findReviewByBookingAndReviewer(bookingId, reviewerId);
        if (existingReview) {
            throw new AppError_1.BadRequestError('You have already submitted a review for this booking');
        }
        // 6. Create Review
        const review = await review_repository_1.ReviewRepository.createReview({
            bookingId,
            itemId,
            reviewerId,
            revieweeId,
            rating,
            comment,
        });
        // 7. Log Action in Audit Log
        await audit_service_1.AuditService.logAction('REVIEW_SUBMITTED', 'REVIEW', review.id, userId);
        // 8. Trigger Trust Score calculation for reviewer and reviewee
        await this.recalculateTrustScore(reviewerId);
        await this.recalculateTrustScore(revieweeId);
        return review;
    }
    static async getReviewsForItem(itemId, query) {
        const skip = (query.page - 1) * query.limit;
        return review_repository_1.ReviewRepository.findReviewsForItem(itemId, {
            sort: query.sort,
            skip,
            take: query.limit,
        });
    }
    static async getReviewsForUser(userId, query) {
        const skip = (query.page - 1) * query.limit;
        return review_repository_1.ReviewRepository.findReviewsForUser(userId, {
            sort: query.sort,
            skip,
            take: query.limit,
        });
    }
    static async getUserReputation(userId) {
        return review_repository_1.ReviewRepository.getUserReputation(userId);
    }
    /**
     * Delegates trust score calculation to the VerificationService
     */
    static async recalculateTrustScore(userId) {
        try {
            const result = await verification_service_1.VerificationService.recalculateTrustScore(userId);
            return result.score;
        }
        catch (error) {
            console.error('Failed to recalculate trust score:', error);
            return 0;
        }
    }
}
exports.ReviewService = ReviewService;
