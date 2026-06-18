import { db } from '@/config/db';

export class VerificationRepository {
  static async getTrustProfile(userId: string) {
    return db.trustProfile.findUnique({
      where: { userId },
      include: {
        user: {
          include: {
            _count: {
              select: {
                bookings: { where: { status: 'COMPLETED' } },
                reviewsReceived: true
              }
            }
          }
        }
      }
    });
  }

  static async updateTrustProfile(userId: string, data: any) {
    return db.trustProfile.update({
      where: { userId },
      data
    });
  }

  static async getCompletedRentalsCount(userId: string) {
    return db.booking.count({
      where: {
        renterId: userId,
        status: 'COMPLETED'
      }
    });
  }

  static async getPositiveReviewsCount(userId: string) {
    return db.review.count({
      where: {
        revieweeId: userId,
        rating: { gte: 4 }
      }
    });
  }
}
