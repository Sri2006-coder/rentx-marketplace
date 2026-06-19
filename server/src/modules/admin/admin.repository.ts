import { db } from '../../config/db';
import { BookingStatus, PaymentStatus, DisputeStatus, ItemStatus } from '@prisma/client';

export class AdminRepository {
  static async getDashboardMetrics() {
    const totalUsers = await db.user.count();
    const verifiedUsers = await db.trustProfile.count({ where: { verifiedBadge: true } });
    const activeListings = await db.item.count({ where: { status: ItemStatus.ACTIVE } });
    const activeRentals = await db.booking.count({ where: { status: BookingStatus.ACTIVE } });
    const completedRentals = await db.booking.count({ where: { status: BookingStatus.COMPLETED } });
    const pendingPayments = await db.payment.count({ where: { paymentStatus: PaymentStatus.PENDING } });
    const openDisputes = await db.dispute.count({ where: { status: DisputeStatus.OPEN } });
    const pendingVerifications = await db.trustProfile.count({ 
      where: { 
        OR: [{ aadhaarStatus: 'PENDING' }, { panStatus: 'PENDING' }] 
      } 
    });

    // Revenue Overview
    const completedPayments = await db.payment.findMany({
      where: {
        paymentStatus: { in: [PaymentStatus.ESCROW_HELD, PaymentStatus.REFUNDED, PaymentStatus.PAID] }
      }
    });

    const totalRevenue = completedPayments.reduce((sum, p) => sum + Number(p.amount), 0);

    const totalConversations = await db.conversation.count();
    const totalMessages = await db.message.count();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const activeChatsToday = await db.conversation.count({
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
    return db.user.findMany({
      include: {
        trustProfile: true,
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async updateUserStatus(id: string, status: any) {
    return db.user.update({
      where: { id },
      data: { status }
    });
  }

  static async getVerifications() {
    return db.trustProfile.findMany({
      where: {
        OR: [{ aadhaarStatus: 'PENDING' }, { panStatus: 'PENDING' }, { verifiedBadge: true }]
      },
      include: {
        user: true
      },
      orderBy: { updatedAt: 'desc' }
    });
  }

  static async updateVerificationStatus(userId: string, data: any) {
    return db.trustProfile.update({
      where: { userId },
      data
    });
  }

  static async getItems() {
    return db.item.findMany({
      include: {
        owner: true,
        reviews: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async updateItemStatus(id: string, status: any) {
    return db.item.update({
      where: { id },
      data: { status }
    });
  }

  static async getBookings() {
    return db.booking.findMany({
      include: {
        item: true,
        renter: true,
        payments: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async updateBookingStatus(id: string, status: any) {
    return db.booking.update({
      where: { id },
      data: { status }
    });
  }

  static async getPayments() {
    return db.payment.findMany({
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
    return db.dispute.findMany({
      include: {
        booking: true,
        filer: true,
        against: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async createDispute(data: any) {
    return db.dispute.create({ data });
  }

  static async updateDisputeStatus(id: string, status: any, resolution?: string) {
    return db.dispute.update({
      where: { id },
      data: { status, resolution }
    });
  }

  static async getAuditLogs() {
    return db.auditLog.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      take: 100
    });
  }

  static async calculateFraudScore(userId: string) {
    // Basic rules-based fraud scoring
    let score = 0;
    
    const failedPayments = await db.payment.count({
      where: { renterId: userId, paymentStatus: PaymentStatus.FAILED }
    });
    score += (failedPayments * 10);

    const cancelledBookings = await db.booking.count({
      where: { renterId: userId, status: BookingStatus.CANCELLED }
    });
    score += (cancelledBookings * 5);

    const trustProfile = await db.trustProfile.findUnique({ where: { userId } });
    if (trustProfile && trustProfile.aadhaarStatus === 'REJECTED') {
      score += 20;
    }

    const disputesAgainst = await db.dispute.count({
      where: { againstId: userId }
    });
    score += (disputesAgainst * 30);

    let riskLevel = 'LOW';
    if (score >= 20 && score < 50) riskLevel = 'MEDIUM';
    if (score >= 50) riskLevel = 'HIGH';

    return { score, riskLevel };
  }
}
