import { PaymentRepository } from './payment.repository';
import { BookingRepository } from '../booking/booking.repository';
import { PaymentStatus, BookingStatus } from '@prisma/client';
import { NotFoundError, BadRequestError } from '@/core/exceptions/AppError';
import { AuditService } from '../audit/audit.service';
import { db } from '@/config/db';

// -----------------------------------------------------
// Future Gateway Abstraction Layer
// -----------------------------------------------------
export interface IPaymentGateway {
  createOrder(amount: number, currency: string, receipt: string): Promise<any>;
  verifyPayment(orderId: string, paymentId: string, signature: string): Promise<boolean>;
  processRefund(paymentId: string, amount: number): Promise<any>;
}

class MockGateway implements IPaymentGateway {
  async createOrder(amount: number, currency: string, receipt: string) {
    return { id: `MOCK_ORDER_${Date.now()}`, amount, currency, receipt, status: 'created' };
  }
  async verifyPayment(orderId: string, paymentId: string, signature: string) {
    return true; // Always succeed for mock
  }
  async processRefund(paymentId: string, amount: number) {
    return { id: `MOCK_REFUND_${Date.now()}`, paymentId, amount, status: 'processed' };
  }
}

const activeGateway: IPaymentGateway = new MockGateway();
// -----------------------------------------------------

export class PaymentService {
  static async createPaymentIntent(bookingId: string, userId: string) {
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: { item: true }
    });

    if (!booking) throw new NotFoundError('Booking not found');
    if (booking.renterId !== userId) throw new BadRequestError('Not authorized for this booking');
    
    // Only allow payment if booking is APPROVED
    if (booking.status !== BookingStatus.APPROVED && booking.status !== BookingStatus.PENDING) {
      throw new BadRequestError(`Cannot pay for booking with status ${booking.status}`);
    }

    // Check if an active pending payment already exists
    let payment = await PaymentRepository.getPaymentByBookingId(bookingId);
    if (payment && payment.paymentStatus === PaymentStatus.PENDING) {
      return payment;
    }

    // Calculate costs
    const days = Math.ceil((booking.endDate.getTime() - booking.startDate.getTime()) / (1000 * 3600 * 24));
    const rentalAmount = Number(booking.item.dailyRate) * (days === 0 ? 1 : days);
    const securityDeposit = Number(booking.item.securityDeposit);
    const totalAmount = rentalAmount + securityDeposit;

    const newPayment = await PaymentRepository.createPayment({
      bookingId: booking.id,
      renterId: userId,
      amount: rentalAmount,
      securityDeposit,
      totalAmount
    });

    await AuditService.logAction('PAYMENT_INTENT_CREATED', 'PAYMENT', newPayment.id, userId);
    return newPayment;
  }

  static async mockPaymentSuccess(paymentId: string, userId: string) {
    const payment = await PaymentRepository.getPaymentById(paymentId);
    if (!payment) throw new NotFoundError('Payment not found');
    if (payment.renterId !== userId) throw new BadRequestError('Not authorized');

    // Simulate Gateway usage
    await activeGateway.verifyPayment('mock_order', 'mock_payment', 'mock_sig');

    const mockTransactionId = `MOCK_TXN_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // Set to ESCROW_HELD indicating we have the money safely during the rental period
    const updatedPayment = await PaymentRepository.updatePaymentStatus(paymentId, PaymentStatus.ESCROW_HELD, mockTransactionId);

    // Update Booking Status to CONFIRMED since payment is made
    await BookingRepository.updateStatus(payment.bookingId, BookingStatus.CONFIRMED);

    await AuditService.logAction('PAYMENT_SUCCESS_ESCROW_HELD', 'PAYMENT', payment.id, userId);
    
    return updatedPayment;
  }

  static async mockPaymentFailure(paymentId: string, userId: string) {
    const payment = await PaymentRepository.getPaymentById(paymentId);
    if (!payment) throw new NotFoundError('Payment not found');
    if (payment.renterId !== userId) throw new BadRequestError('Not authorized');

    const updatedPayment = await PaymentRepository.updatePaymentStatus(paymentId, PaymentStatus.FAILED);
    await AuditService.logAction('PAYMENT_FAILED', 'PAYMENT', payment.id, userId);
    
    return updatedPayment;
  }

  static async getPaymentHistory(userId: string) {
    return PaymentRepository.getPaymentHistory(userId);
  }

  static async refundSecurityDeposit(bookingId: string) {
    // Look up paid payment (ESCROW_HELD)
    const payment = await PaymentRepository.getPaymentByBookingId(bookingId);
    if (!payment || payment.paymentStatus !== PaymentStatus.ESCROW_HELD) {
      throw new BadRequestError('No active escrow payment found for this booking');
    }

    // Simulate gateway refund
    await activeGateway.processRefund(payment.transactionId || '', Number(payment.securityDeposit));

    const updatedPayment = await PaymentRepository.updatePaymentStatus(payment.id, PaymentStatus.REFUNDED);
    await AuditService.logAction('DEPOSIT_REFUNDED', 'PAYMENT', payment.id, payment.booking.item.ownerId);

    return updatedPayment;
  }
}
