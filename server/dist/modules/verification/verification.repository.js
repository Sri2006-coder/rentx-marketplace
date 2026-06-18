"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationRepository = void 0;
const db_1 = require("@/config/db");
class VerificationRepository {
    static async getTrustProfile(userId) {
        return db_1.db.trustProfile.findUnique({
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
    static async updateTrustProfile(userId, data) {
        return db_1.db.trustProfile.update({
            where: { userId },
            data
        });
    }
    static async getCompletedRentalsCount(userId) {
        return db_1.db.booking.count({
            where: {
                renterId: userId,
                status: 'COMPLETED'
            }
        });
    }
    static async getPositiveReviewsCount(userId) {
        return db_1.db.review.count({
            where: {
                revieweeId: userId,
                rating: { gte: 4 }
            }
        });
    }
}
exports.VerificationRepository = VerificationRepository;
