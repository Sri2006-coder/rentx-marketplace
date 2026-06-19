"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRepository = void 0;
const db_1 = require("../../config/db");
const client_1 = require("@prisma/client");
class AdminRepository {
    static async getDashboardMetrics() {
        const totalUsers = await db_1.db.user.count();
        const verifiedUsers = await db_1.db.trustProfile.count({ where: { verifiedBadge: true } });
        const activeListings = await db_1.db.item.count({ where: { status: client_1.ItemStatus.ACTIVE } });
        const activeRentals = await db_1.db.booking.count({ where: { status: client_1.BookingStatus.ACTIVE } });
        const completedRentals = await db_1.db.booking.count({ where: { status: client_1.BookingStatus.COMPLETED } });
        const pendingPayments = await db_1.db.payment.count({ where: { paymentStatus: client_1.PaymentStatus.PENDING } });
        const openDisputes = await db_1.db.dispute.count({ where: { status: client_1.DisputeStatus.OPEN } });
        const pendingVerifications = await db_1.db.trustProfile.count({
            where: {
                OR: [{ aadhaarStatus: 'PENDING' }, { panStatus: 'PENDING' }]
            }
        });
        // Revenue Overview
        const completedPayments = await db_1.db.payment.findMany({
            where: {
                paymentStatus: { in: [client_1.PaymentStatus.ESCROW_HELD, client_1.PaymentStatus.REFUNDED, client_1.PaymentStatus.PAID] }
            }
        });
        const totalRevenue = completedPayments.reduce((sum, p) => sum + Number(p.amount), 0);
        const totalConversations = await db_1.db.conversation.count();
        const totalMessages = await db_1.db.message.count();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const activeChatsToday = await db_1.db.conversation.count({
            where: { updatedAt: { gte: today } }
        });
        return {
            totalUsers,
            verifiedUsers,
            activeListings,
            activeRentals,
            completedRentals,
            pendingPayments,
            openDisputes,
            pendingVerifications,
            totalRevenue,
            totalConversations,
            totalMessages,
            activeChatsToday
        };
    }
    static async getUsers() {
        return db_1.db.user.findMany({
            include: {
                trustProfile: true,
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    static async updateUserStatus(id, status) {
        return db_1.db.user.update({
            where: { id },
            data: { status }
        });
    }
    static async getVerifications() {
        return db_1.db.trustProfile.findMany({
            where: {
                OR: [{ aadhaarStatus: 'PENDING' }, { panStatus: 'PENDING' }, { verifiedBadge: true }]
            },
            include: {
                user: true
            },
            orderBy: { updatedAt: 'desc' }
        });
    }
    static async updateVerificationStatus(userId, data) {
        return db_1.db.trustProfile.update({
            where: { userId },
            data
        });
    }
    static async getItems() {
        return db_1.db.item.findMany({
            include: {
                owner: true,
                reviews: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    static async updateItemStatus(id, status) {
        return db_1.db.item.update({
            where: { id },
            data: { status }
        });
    }
    static async getBookings() {
        return db_1.db.booking.findMany({
            include: {
                item: true,
                renter: true,
                payments: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    static async updateBookingStatus(id, status) {
        return db_1.db.booking.update({
            where: { id },
            data: { status }
        });
    }
    static async getPayments() {
        return db_1.db.payment.findMany({
            include: {
                booking: {
                    include: { item: true }
                },
                renter: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    static async getDisputes() {
        return db_1.db.dispute.findMany({
            include: {
                booking: true,
                filer: true,
                against: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    static async createDispute(data) {
        return db_1.db.dispute.create({ data });
    }
    static async updateDisputeStatus(id, status, resolution) {
        return db_1.db.dispute.update({
            where: { id },
            data: { status, resolution }
        });
    }
    static async getAuditLogs() {
        return db_1.db.auditLog.findMany({
            include: { user: true },
            orderBy: { createdAt: 'desc' },
            take: 100
        });
    }
    static async calculateFraudScore(userId) {
        // Basic rules-based fraud scoring
        let score = 0;
        const failedPayments = await db_1.db.payment.count({
            where: { renterId: userId, paymentStatus: client_1.PaymentStatus.FAILED }
        });
        score += (failedPayments * 10);
        const cancelledBookings = await db_1.db.booking.count({
            where: { renterId: userId, status: client_1.BookingStatus.CANCELLED }
        });
        score += (cancelledBookings * 5);
        const trustProfile = await db_1.db.trustProfile.findUnique({ where: { userId } });
        if (trustProfile && trustProfile.aadhaarStatus === 'REJECTED') {
            score += 20;
        }
        const disputesAgainst = await db_1.db.dispute.count({
            where: { againstId: userId }
        });
        score += (disputesAgainst * 30);
        let riskLevel = 'LOW';
        if (score >= 20 && score < 50)
            riskLevel = 'MEDIUM';
        if (score >= 50)
            riskLevel = 'HIGH';
        return { score, riskLevel };
    }
}
exports.AdminRepository = AdminRepository;
