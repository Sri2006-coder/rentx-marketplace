import { db } from '@/config/db';
import { PaymentStatus, PaymentMethod } from '@prisma/client';

export class PaymentRepository {
  static async createPayment(data: { bookingId: string; renterId: string; amount: number; securityDeposit: number; totalAmount: number; }) {
    return db.payment.create({
      data: {
        bookingId: data.bookingId,
        renterId: data.renterId,
        amount: data.amount,
        securityDeposit: data.securityDeposit,
        totalAmount: data.totalAmount,
      },
      include: {
        booking: {
          include: {
            item: true
          }
        }
      }
    });
  }

  static async getPaymentByBookingId(bookingId: string) {
    return db.payment.findFirst({
      where: { bookingId },
      orderBy: { createdAt: 'desc' },
      include: {
        booking: {
          include: {
            item: true
          }
        }
      }
    });
  }

  static async getPaymentById(id: string) {
    return db.payment.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            item: true
          }
        }
      }
    });
  }

  static async updatePaymentStatus(id: string, status: PaymentStatus, transactionId?: string) {
    const data: any = { paymentStatus: status };
    if (transactionId) data.transactionId = transactionId;
    if (status === PaymentStatus.PAID) data.paidAt = new Date();
    if (status === PaymentStatus.REFUNDED) data.refundedAt = new Date();

    return db.payment.update({
      where: { id },
      data,
      include: {
        booking: {
          include: { item: true }
        }
      }
    });
  }

  static async getPaymentHistory(userId: string) {
    return db.payment.findMany({
      where: { renterId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        booking: {
          include: {
            item: true
          }
        }
      }
    });
  }
}
