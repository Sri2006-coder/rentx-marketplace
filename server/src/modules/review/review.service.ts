import { ReviewRepository } from './review.repository';
import { CreateReviewInput } from './review.schema';
import { db } from '@/config/db';
import { BookingStatus } from '@prisma/client';
import { NotFoundError, BadRequestError, ForbiddenError } from '@/core/exceptions/AppError';
import { AuditService } from '../audit/audit.service';
import { VerificationService } from '../verification/verification.service';

export class ReviewService {
  static async createReview(userId: string, data: CreateReviewInput) {
    const { bookingId, rating, comment } = data;

    // 1. Fetch booking details
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: { item: true },
    });

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    // 2. Validate booking status is COMPLETED
    if (booking.status !== BookingStatus.COMPLETED) {
      throw new BadRequestError('Only completed bookings can be reviewed');
    }

    // 3. Verify user ownership & determine roles
    const isRenter = booking.renterId === userId;
    const isOwner = booking.item.ownerId === userId;

    if (!isRenter && !isOwner) {
      throw new ForbiddenError('You do not have permission to review this booking');
    }

    // Determine reviewer and reviewee
    const reviewerId = userId;
    const revieweeId = isRenter ? booking.item.ownerId : booking.renterId;
    const itemId = booking.itemId;

    // 4. Block self reviews
    if (reviewerId === revieweeId) {
      throw new BadRequestError('Users cannot review themselves');
    }

    // 5. Prevent duplicate reviews by the same user for this booking
    const existingReview = await ReviewRepository.findReviewByBookingAndReviewer(bookingId, reviewerId);
    if (existingReview) {
      throw new BadRequestError('You have already submitted a review for this booking');
    }

    // 6. Create Review
    const review = await ReviewRepository.createReview({
      bookingId,
      itemId,
      reviewerId,
      revieweeId,
      rating,
      comment,
    });

    // 7. Log Action in Audit Log
    await AuditService.logAction('REVIEW_SUBMITTED', 'REVIEW', review.id, userId);

    // 8. Trigger Trust Score calculation for reviewer and reviewee
    await this.recalculateTrustScore(reviewerId);
    await this.recalculateTrustScore(revieweeId);

    return review;
  }

  static async getReviewsForItem(itemId: string, query: { sort: string; page: number; limit: number }) {
    const skip = (query.page - 1) * query.limit;
    return ReviewRepository.findReviewsForItem(itemId, {
      sort: query.sort,
      skip,
      take: query.limit,
    });
  }

  static async getReviewsForUser(userId: string, query: { sort: string; page: number; limit: number }) {
    const skip = (query.page - 1) * query.limit;
    return ReviewRepository.findReviewsForUser(userId, {
      sort: query.sort,
      skip,
      take: query.limit,
    });
  }

  static async getUserReputation(userId: string) {
    return ReviewRepository.getUserReputation(userId);
  }

  /**
   * Delegates trust score calculation to the VerificationService
   */
  static async recalculateTrustScore(userId: string) {
    try {
      const result = await VerificationService.recalculateTrustScore(userId);
      return result.score;
    } catch (error) {
      console.error('Failed to recalculate trust score:', error);
      return 0;
    }
  }
}
