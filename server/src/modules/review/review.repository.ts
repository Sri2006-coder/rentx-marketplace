import { db } from '../../config/db';
import { Prisma, BookingStatus } from '@prisma/client';

export class ReviewRepository {
  static async createReview(data: {
    bookingId: string;
    itemId: string;
    reviewerId: string;
    revieweeId: string;
    rating: number;
    comment: string;
  }) {
    return db.review.create({
      data,
      include: {
        booking: true,
        item: true,
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
      },
    });
  }

  static async findReviewByBookingAndReviewer(bookingId: string, reviewerId: string) {
    return db.review.findUnique({
      where: {
        bookingId_reviewerId: {
          bookingId,
          reviewerId,
        },
      },
    });
  }

  static async findReviewsForItem(itemId: string, query: { sort: string; skip: number; take: number }) {
    const { sort, skip, take } = query;
    let orderBy: Prisma.ReviewOrderByWithRelationInput = { createdAt: 'desc' };

    if (sort === 'highest') orderBy = { rating: 'desc' };
    if (sort === 'lowest') orderBy = { rating: 'asc' };
    if (sort === 'newest') orderBy = { createdAt: 'desc' };

    const item = await db.item.findUnique({ where: { id: itemId } });
    const ownerId = item ? item.ownerId : '';

    const [reviews, total] = await Promise.all([
      db.review.findMany({
        where: { 
          itemId,
          reviewerId: { not: ownerId }
        },
        orderBy,
        skip,
        take,
        include: {
          reviewer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImage: true,
            },
          },
        },
      }),
      db.review.count({ 
        where: { 
          itemId,
          reviewerId: { not: ownerId }
        } 
      }),
    ]);

    return { reviews, total };
  }

  static async findReviewsForUser(userId: string, query: { sort: string; skip: number; take: number }) {
    const { sort, skip, take } = query;
    let orderBy: Prisma.ReviewOrderByWithRelationInput = { createdAt: 'desc' };

    if (sort === 'highest') orderBy = { rating: 'desc' };
    if (sort === 'lowest') orderBy = { rating: 'asc' };
    if (sort === 'newest') orderBy = { createdAt: 'desc' };

    const [reviews, total] = await Promise.all([
      db.review.findMany({
        where: { revieweeId: userId },
        orderBy,
        skip,
        take,
        include: {
          reviewer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImage: true,
            },
          },
          item: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      }),
      db.review.count({ where: { revieweeId: userId } }),
    ]);

    return { reviews, total };
  }

  static async getOrCreateTrustProfile(userId: string) {
    let trustProfile = await db.trustProfile.findUnique({ where: { userId } });
    if (!trustProfile) {
      trustProfile = await db.trustProfile.create({
        data: {
          userId,
          trustScore: 0,
          aadhaarStatus: 'UNVERIFIED',
          panStatus: 'UNVERIFIED',
          verifiedBadge: false,
          emailVerified: false,
          phoneVerified: false,
        },
      });
    }
    return trustProfile;
  }

  static async getUserReputation(userId: string) {
    // 1. Get completed owner rentals
    const totalRentalsCompleted = await db.booking.count({
      where: {
        item: { ownerId: userId },
        status: BookingStatus.COMPLETED,
      },
    });

    // 2. Get completed renter rentals
    const rentalsCompleted = await db.booking.count({
      where: {
        renterId: userId,
        status: BookingStatus.COMPLETED,
      },
    });

    // 3. Successful returns (returned or completed)
    const successfulReturns = await db.booking.count({
      where: {
        renterId: userId,
        status: { in: [BookingStatus.RETURNED, BookingStatus.COMPLETED] },
      },
    });

    // 4. Fetch trust profile
    const trustProfile = await this.getOrCreateTrustProfile(userId);

    // 5. Aggregate received reviews
    const reviews = await db.review.findMany({
      where: { revieweeId: userId },
      include: {
        booking: {
          include: {
            item: true,
          },
        },
      },
    });

    // Separate reviews by role
    const ownerReviews = reviews.filter(r => r.booking.item.ownerId === userId);
    const renterReviews = reviews.filter(r => r.booking.renterId === userId);

    const calculateStats = (filteredReviews: typeof reviews) => {
      const count = filteredReviews.length;
      if (count === 0) return { averageRating: 0.0, reviewCount: 0 };
      const sum = filteredReviews.reduce((acc, r) => acc + r.rating, 0);
      return {
        averageRating: Number((sum / count).toFixed(1)),
        reviewCount: count,
      };
    };

    const ownerStats = calculateStats(ownerReviews);
    const renterStats = calculateStats(renterReviews);

    // Dynamic rating distribution for owner (1-5 stars)
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ownerReviews.forEach(r => {
      const star = r.rating as 1 | 2 | 3 | 4 | 5;
      if (distribution[star] !== undefined) {
        distribution[star]++;
      }
    });

    return {
      trustProfile,
      ownerReputation: {
        averageRating: ownerStats.averageRating,
        reviewCount: ownerStats.reviewCount,
        totalRentalsCompleted,
        ratingDistribution: distribution,
        responseRate: '95%', // Placeholder
        verifiedStatus: trustProfile.aadhaarStatus === 'VERIFIED' ? 'Verified' : 'Identity Verified',
      },
      renterReputation: {
        averageRating: renterStats.averageRating,
        reviewCount: renterStats.reviewCount,
        rentalsCompleted,
        successfulReturns,
      },
      latestReviews: reviews.slice(0, 3).map(r => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
      })),
    };
  }

  static async updateTrustProfileScore(userId: string, score: number) {
    return db.trustProfile.update({
      where: { userId },
      data: { trustScore: score },
    });
  }
}
