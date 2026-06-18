"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const admin_repository_1 = require("./admin.repository");
const audit_service_1 = require("../audit/audit.service");
class AdminService {
    static async getDashboardMetrics() {
        return admin_repository_1.AdminRepository.getDashboardMetrics();
    }
    static async getUsers() {
        const users = await admin_repository_1.AdminRepository.getUsers();
        // Add fraud score to each user
        const usersWithFraud = await Promise.all(users.map(async (u) => {
            const fraud = await admin_repository_1.AdminRepository.calculateFraudScore(u.id);
            return { ...u, fraud };
        }));
        return usersWithFraud;
    }
    static async suspendUser(adminId, userId) {
        const user = await admin_repository_1.AdminRepository.updateUserStatus(userId, 'SUSPENDED');
        await audit_service_1.AuditService.logAction('USER_SUSPENDED', 'USER', userId, adminId);
        return user;
    }
    static async activateUser(adminId, userId) {
        const user = await admin_repository_1.AdminRepository.updateUserStatus(userId, 'ACTIVE');
        await audit_service_1.AuditService.logAction('USER_ACTIVATED', 'USER', userId, adminId);
        return user;
    }
    static async getVerifications() {
        return admin_repository_1.AdminRepository.getVerifications();
    }
    static async approveVerification(adminId, userId) {
        const profile = await admin_repository_1.AdminRepository.updateVerificationStatus(userId, {
            aadhaarStatus: 'VERIFIED',
            verifiedBadge: true
        });
        await audit_service_1.AuditService.logAction('VERIFICATION_APPROVED', 'TRUST_PROFILE', userId, adminId);
        return profile;
    }
    static async rejectVerification(adminId, userId) {
        const profile = await admin_repository_1.AdminRepository.updateVerificationStatus(userId, {
            aadhaarStatus: 'REJECTED',
            verifiedBadge: false
        });
        await audit_service_1.AuditService.logAction('VERIFICATION_REJECTED', 'TRUST_PROFILE', userId, adminId);
        return profile;
    }
    static async getItems() {
        return admin_repository_1.AdminRepository.getItems();
    }
    static async updateItemStatus(adminId, itemId, status) {
        const item = await admin_repository_1.AdminRepository.updateItemStatus(itemId, status);
        await audit_service_1.AuditService.logAction(`ITEM_STATUS_UPDATED_${status}`, 'ITEM', itemId, adminId);
        return item;
    }
    static async getBookings() {
        return admin_repository_1.AdminRepository.getBookings();
    }
    static async cancelBooking(adminId, bookingId) {
        const booking = await admin_repository_1.AdminRepository.updateBookingStatus(bookingId, 'CANCELLED');
        await audit_service_1.AuditService.logAction('BOOKING_CANCELLED_BY_ADMIN', 'BOOKING', bookingId, adminId);
        return booking;
    }
    static async getPayments() {
        return admin_repository_1.AdminRepository.getPayments();
    }
    static async getDisputes() {
        return admin_repository_1.AdminRepository.getDisputes();
    }
    static async openDispute(adminId, data) {
        const dispute = await admin_repository_1.AdminRepository.createDispute({
            ...data,
            status: 'OPEN'
        });
        await audit_service_1.AuditService.logAction('DISPUTE_OPENED', 'DISPUTE', dispute.id, adminId);
        return dispute;
    }
    static async updateDisputeStatus(adminId, disputeId, status, resolution) {
        const dispute = await admin_repository_1.AdminRepository.updateDisputeStatus(disputeId, status, resolution);
        await audit_service_1.AuditService.logAction(`DISPUTE_${status}`, 'DISPUTE', disputeId, adminId);
        return dispute;
    }
    static async getAuditLogs() {
        return admin_repository_1.AdminRepository.getAuditLogs();
    }
}
exports.AdminService = AdminService;
