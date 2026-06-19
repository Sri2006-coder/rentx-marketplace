import { AdminRepository } from './admin.repository';
import { AuditService } from '../audit/audit.service';
import { NotFoundError } from '../../core/exceptions/AppError';

export class AdminService {
  static async getDashboardMetrics() {
    return AdminRepository.getDashboardMetrics();
  }

  static async getUsers() {
    const users = await AdminRepository.getUsers();
    // Add fraud score to each user
    const usersWithFraud = await Promise.all(users.map(async (u) => {
      const fraud = await AdminRepository.calculateFraudScore(u.id);
      return { ...u, fraud };
    }));
    return usersWithFraud;
  }

  static async suspendUser(adminId: string, userId: string) {
    const user = await AdminRepository.updateUserStatus(userId, 'SUSPENDED');
    await AuditService.logAction('USER_SUSPENDED', 'USER', userId, adminId);
    return user;
  }

  static async activateUser(adminId: string, userId: string) {
    const user = await AdminRepository.updateUserStatus(userId, 'ACTIVE');
    await AuditService.logAction('USER_ACTIVATED', 'USER', userId, adminId);
    return user;
  }

  static async getVerifications() {
    return AdminRepository.getVerifications();
  }

  static async approveVerification(adminId: string, userId: string) {
    const profile = await AdminRepository.updateVerificationStatus(userId, {
      aadhaarStatus: 'VERIFIED',
      verifiedBadge: true
    });
    await AuditService.logAction('VERIFICATION_APPROVED', 'TRUST_PROFILE', userId, adminId);
    return profile;
  }

  static async rejectVerification(adminId: string, userId: string) {
    const profile = await AdminRepository.updateVerificationStatus(userId, {
      aadhaarStatus: 'REJECTED',
      verifiedBadge: false
    });
    await AuditService.logAction('VERIFICATION_REJECTED', 'TRUST_PROFILE', userId, adminId);
    return profile;
  }

  static async getItems() {
    return AdminRepository.getItems();
  }

  static async updateItemStatus(adminId: string, itemId: string, status: string) {
    const item = await AdminRepository.updateItemStatus(itemId, status);
    await AuditService.logAction(`ITEM_STATUS_UPDATED_${status}`, 'ITEM', itemId, adminId);
    return item;
  }

  static async getBookings() {
    return AdminRepository.getBookings();
  }

  static async cancelBooking(adminId: string, bookingId: string) {
    const booking = await AdminRepository.updateBookingStatus(bookingId, 'CANCELLED');
    await AuditService.logAction('BOOKING_CANCELLED_BY_ADMIN', 'BOOKING', bookingId, adminId);
    return booking;
  }

  static async getPayments() {
    return AdminRepository.getPayments();
  }

  static async getDisputes() {
    return AdminRepository.getDisputes();
  }

  static async openDispute(adminId: string, data: any) {
    const dispute = await AdminRepository.createDispute({
      ...data,
      status: 'OPEN'
    });
    await AuditService.logAction('DISPUTE_OPENED', 'DISPUTE', dispute.id, adminId);
    return dispute;
  }

  static async updateDisputeStatus(adminId: string, disputeId: string, status: string, resolution?: string) {
    const dispute = await AdminRepository.updateDisputeStatus(disputeId, status, resolution);
    await AuditService.logAction(`DISPUTE_${status}`, 'DISPUTE', disputeId, adminId);
    return dispute;
  }

  static async getAuditLogs() {
    return AdminRepository.getAuditLogs();
  }
}
