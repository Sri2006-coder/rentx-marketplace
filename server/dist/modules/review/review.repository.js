"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewRepository = void 0;
const db_1 = require("@/config/db");
const client_1 = require("@prisma/client");
class ReviewRepository {
    static async createReview(data) {
        return db_1.db.review.create({
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
    static async findReviewByBookingAndReviewer(bookingId, reviewerId) {
        return db_1.db.review.findUnique({
            where: {
                bookingId_reviewerId: {
                    bookingId,
                    reviewerId,
                },
            },
        });
    }
    static async findReviewsForItem(itemId, query) {
        const { sort, skip, take } = query;
        let orderBy = { createdAt: 'desc' };
        if (sort === 'highest')
            orderBy = { rating: 'desc' };
        if (sort === 'lowest')
            orderBy = { rating: 'asc' };
        if (sort === 'newest')
            orderBy = { createdAt: 'desc' };
        const item = await db_1.db.item.findUnique({ where: { id: itemId } });
        const ownerId = item ? item.ownerId : '';
        const [reviews, total] = await Promise.all([
            db_1.db.review.findMany({
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
            db_1.db.review.count({
                where: {
                    itemId,
                    reviewerId: { not: ownerId }
                }
            }),
        ]);
        return { reviews, total };
    }
    static async findReviewsForUser(userId, query) {
        const { sort, skip, take } = query;
        let orderBy = { createdAt: 'desc' };
        if (sort === 'highest')
            orderBy = { rating: 'desc' };
        if (sort === 'lowest')
            orderBy = { rating: 'asc' };
        if (sort === 'newest')
            orderBy = { createdAt: 'desc' };
        const [reviews, total] = await Promise.all([
            db_1.db.review.findMany({
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
            db_1.db.review.count({ where: { revieweeId: userId } }),
        ]);
        return { reviews, total };
    }
    static async getOrCreateTrustProfile(userId) {
        let trustProfile = await db_1.db.trustProfile.findUnique({ where: { userId } });
        if (!trustProfile) {
            trustProfile = await db_1.db.trustProfile.create({
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
    static async getUserReputation(userId) {
        // 1. Get completed owner rentals
        const totalRentalsCompleted = await db_1.db.booking.count({
            where: {
                item: { ownerId: userId },
                status: client_1.BookingStatus.COMPLETED,
            },
        });
        // 2. Get completed renter rentals
        const rentalsCompleted = await db_1.db.booking.count({
            where: {
                renterId: userId,
                status: client_1.BookingStatus.COMPLETED,
            },
        });
        // 3. Successful returns (returned or completed)
        const successfulReturns = await db_1.db.booking.count({
            where: {
                renterId: userId,
                status: { in: [client_1.BookingStatus.RETURNED, client_1.BookingStatus.COMPLETED] },
            },
        });
        // 4. Fetch trust profile
        const trustProfile = await this.getOrCreateTrustProfile(userId);
        // 5. Aggregate received reviews
        const reviews = await db_1.db.review.findMany({
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
        const calculateStats = (filteredReviews) => {
            const count = filteredReviews.length;
            if (count === 0)
                return { averageRating: 0.0, reviewCount: 0 };
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
            const star = r.rating;
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
    static async updateTrustProfileScore(userId, score) {
        return db_1.db.trustProfile.update({
            where: { userId },
            data: { trustScore: score },
        });
    }
}
exports.ReviewRepository = ReviewRepository;
