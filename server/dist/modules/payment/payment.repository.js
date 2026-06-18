"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentRepository = void 0;
const db_1 = require("@/config/db");
const client_1 = require("@prisma/client");
class PaymentRepository {
    static async createPayment(data) {
        return db_1.db.payment.create({
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
    static async getPaymentByBookingId(bookingId) {
        return db_1.db.payment.findFirst({
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
    static async getPaymentById(id) {
        return db_1.db.payment.findUnique({
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
    static async updatePaymentStatus(id, status, transactionId) {
        const data = { paymentStatus: status };
        if (transactionId)
            data.transactionId = transactionId;
        if (status === client_1.PaymentStatus.PAID)
            data.paidAt = new Date();
        if (status === client_1.PaymentStatus.REFUNDED)
            data.refundedAt = new Date();
        return db_1.db.payment.update({
            where: { id },
            data,
            include: {
                booking: {
                    include: { item: true }
                }
            }
        });
    }
    static async getPaymentHistory(userId) {
        return db_1.db.payment.findMany({
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
exports.PaymentRepository = PaymentRepository;
