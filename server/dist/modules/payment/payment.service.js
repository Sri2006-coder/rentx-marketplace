"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const payment_repository_1 = require("./payment.repository");
const booking_repository_1 = require("../booking/booking.repository");
const client_1 = require("@prisma/client");
const AppError_1 = require("../../core/exceptions/AppError");
const audit_service_1 = require("../audit/audit.service");
const db_1 = require("../../config/db");
class MockGateway {
    async createOrder(amount, currency, receipt) {
        return { id: `MOCK_ORDER_${Date.now()}`, amount, currency, receipt, status: 'created' };
    }
    async verifyPayment(orderId, paymentId, signature) {
        return true; // Always succeed for mock
    }
    async processRefund(paymentId, amount) {
        return { id: `MOCK_REFUND_${Date.now()}`, paymentId, amount, status: 'processed' };
    }
}
const activeGateway = new MockGateway();
// -----------------------------------------------------
class PaymentService {
    static async createPaymentIntent(bookingId, userId) {
        const booking = await db_1.db.booking.findUnique({
            where: { id: bookingId },
            include: { item: true }
        });
        if (!booking)
            throw new AppError_1.NotFoundError('Booking not found');
        if (booking.renterId !== userId)
            throw new AppError_1.BadRequestError('Not authorized for this booking');
        // Only allow payment if booking is APPROVED
        if (booking.status !== client_1.BookingStatus.APPROVED && booking.status !== client_1.BookingStatus.PENDING) {
            throw new AppError_1.BadRequestError(`Cannot pay for booking with status ${booking.status}`);
        }
        // Check if an active pending payment already exists
        let payment = await payment_repository_1.PaymentRepository.getPaymentByBookingId(bookingId);
        if (payment && payment.paymentStatus === client_1.PaymentStatus.PENDING) {
            return payment;
        }
        // Calculate costs
        const days = Math.ceil((booking.endDate.getTime() - booking.startDate.getTime()) / (1000 * 3600 * 24));
        const rentalAmount = Number(booking.item.dailyRate) * (days === 0 ? 1 : days);
        const securityDeposit = Number(booking.item.securityDeposit);
        const totalAmount = rentalAmount + securityDeposit;
        const newPayment = await payment_repository_1.PaymentRepository.createPayment({
            bookingId: booking.id,
            renterId: userId,
            amount: rentalAmount,
            securityDeposit,
            totalAmount
        });
        await audit_service_1.AuditService.logAction('PAYMENT_INTENT_CREATED', 'PAYMENT', newPayment.id, userId);
        return newPayment;
    }
    static async mockPaymentSuccess(paymentId, userId) {
        const payment = await payment_repository_1.PaymentRepository.getPaymentById(paymentId);
        if (!payment)
            throw new AppError_1.NotFoundError('Payment not found');
        if (payment.renterId !== userId)
            throw new AppError_1.BadRequestError('Not authorized');
        // Simulate Gateway usage
        await activeGateway.verifyPayment('mock_order', 'mock_payment', 'mock_sig');
        const mockTransactionId = `MOCK_TXN_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        // Set to ESCROW_HELD indicating we have the money safely during the rental period
        const updatedPayment = await payment_repository_1.PaymentRepository.updatePaymentStatus(paymentId, client_1.PaymentStatus.ESCROW_HELD, mockTransactionId);
        // Update Booking Status to CONFIRMED since payment is made
        await booking_repository_1.BookingRepository.updateStatus(payment.bookingId, client_1.BookingStatus.CONFIRMED);
        await audit_service_1.AuditService.logAction('PAYMENT_SUCCESS_ESCROW_HELD', 'PAYMENT', payment.id, userId);
        return updatedPayment;
    }
    static async mockPaymentFailure(paymentId, userId) {
        const payment = await payment_repository_1.PaymentRepository.getPaymentById(paymentId);
        if (!payment)
            throw new AppError_1.NotFoundError('Payment not found');
        if (payment.renterId !== userId)
            throw new AppError_1.BadRequestError('Not authorized');
        const updatedPayment = await payment_repository_1.PaymentRepository.updatePaymentStatus(paymentId, client_1.PaymentStatus.FAILED);
        await audit_service_1.AuditService.logAction('PAYMENT_FAILED', 'PAYMENT', payment.id, userId);
        return updatedPayment;
    }
    static async getPaymentHistory(userId) {
        return payment_repository_1.PaymentRepository.getPaymentHistory(userId);
    }
    static async refundSecurityDeposit(bookingId) {
        // Look up paid payment (ESCROW_HELD)
        const payment = await payment_repository_1.PaymentRepository.getPaymentByBookingId(bookingId);
        if (!payment || payment.paymentStatus !== client_1.PaymentStatus.ESCROW_HELD) {
            throw new AppError_1.BadRequestError('No active escrow payment found for this booking');
        }
        // Simulate gateway refund
        await activeGateway.processRefund(payment.transactionId || '', Number(payment.securityDeposit));
        const updatedPayment = await payment_repository_1.PaymentRepository.updatePaymentStatus(payment.id, client_1.PaymentStatus.REFUNDED);
        await audit_service_1.AuditService.logAction('DEPOSIT_REFUNDED', 'PAYMENT', payment.id, payment.booking.item.ownerId);
        return updatedPayment;
    }
}
exports.PaymentService = PaymentService;
