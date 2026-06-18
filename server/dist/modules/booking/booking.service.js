"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingService = void 0;
const booking_repository_1 = require("./booking.repository");
const client_1 = require("@prisma/client");
const audit_service_1 = require("../audit/audit.service");
const notifications_1 = require("@/core/utils/notifications");
const AppError_1 = require("@/core/exceptions/AppError");
const db_1 = require("@/config/db");
class BookingService {
    static async requestBooking(userId, data) {
        const item = await db_1.db.item.findUnique({ where: { id: data.itemId } });
        if (!item)
            throw new AppError_1.NotFoundError('Item not found');
        if (item.requireVerified) {
            const trustProfile = await db_1.db.trustProfile.findUnique({ where: { userId } });
            if (!trustProfile || !trustProfile.verifiedBadge) {
                throw new AppError_1.ForbiddenError('This item requires a verified account to rent. Please complete your identity verification.');
            }
        }
        const booking = await booking_repository_1.BookingRepository.createBooking({
            itemId: data.itemId,
            renterId: userId,
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
            notes: data.notes,
        });
        await audit_service_1.AuditService.logAction('BOOKING_REQUESTED', 'BOOKING', booking.id, userId);
        (0, notifications_1.sendMockNotification)(booking.item.ownerId, 'New Booking Request', `${booking.renter.firstName} has requested to book ${booking.item.title}.`);
        return booking;
    }
    static async getMyRentals(userId) {
        return booking_repository_1.BookingRepository.findByRenter(userId);
    }
    static async getMyIncomingRequests(ownerId) {
        return booking_repository_1.BookingRepository.findByOwner(ownerId);
    }
    static async getBookingDetails(bookingId) {
        const booking = await booking_repository_1.BookingRepository.findById(bookingId);
        if (!booking)
            throw new AppError_1.NotFoundError('Booking not found');
        const timeline = await audit_service_1.AuditService.getLogsForEntity('BOOKING', bookingId);
        return { ...booking, timeline };
    }
    static async updateStatus(bookingId, userId, newStatus, additionalData) {
        const booking = await booking_repository_1.BookingRepository.findById(bookingId);
        if (!booking)
            throw new AppError_1.NotFoundError('Booking not found');
        const isOwner = booking.item.ownerId === userId;
        const isRenter = booking.renterId === userId;
        if (!isOwner && !isRenter) {
            throw new AppError_1.ForbiddenError('You do not have permission to modify this booking');
        }
        // Permission matrix
        if ((newStatus === client_1.BookingStatus.APPROVED || newStatus === client_1.BookingStatus.REJECTED) && !isOwner) {
            throw new AppError_1.ForbiddenError('Only the owner can approve or reject bookings');
        }
        if (newStatus === client_1.BookingStatus.CANCELLED && !isRenter) {
            throw new AppError_1.ForbiddenError('Only the renter can cancel a pending booking');
        }
        if (newStatus === client_1.BookingStatus.ACTIVE) {
            const payment = await db_1.db.payment.findFirst({
                where: { bookingId, paymentStatus: 'ESCROW_HELD' }
            });
            if (!payment) {
                throw new AppError_1.BadRequestError('Cannot start rental. Payment must be in Escrow.');
            }
        }
        const updateData = { status: newStatus };
        if (newStatus === client_1.BookingStatus.RETURNED && additionalData?.damageReport) {
            updateData.damageReport = additionalData.damageReport;
            updateData.actualReturnDate = new Date();
        }
        const updatedBooking = await db_1.db.booking.update({
            where: { id: bookingId },
            data: updateData
        });
        // If RETURNED with NO damage, trigger mock refund
        if (newStatus === client_1.BookingStatus.RETURNED && additionalData?.damageReport === 'NONE') {
            const { PaymentService } = await Promise.resolve().then(() => __importStar(require('../payment/payment.service')));
            await PaymentService.refundSecurityDeposit(bookingId).catch(console.error);
        }
        await audit_service_1.AuditService.logAction(`BOOKING_${newStatus}`, 'BOOKING', bookingId, userId);
        // Notify appropriate party
        if (newStatus === client_1.BookingStatus.APPROVED || newStatus === client_1.BookingStatus.REJECTED) {
            (0, notifications_1.sendMockNotification)(booking.renterId, `Booking ${newStatus}`, `Your request for ${booking.item.title} has been ${newStatus.toLowerCase()}.`);
        }
        else if (newStatus === client_1.BookingStatus.RETURNED || newStatus === client_1.BookingStatus.COMPLETED) {
            (0, notifications_1.sendMockNotification)(booking.item.ownerId, `Booking ${newStatus}`, `${booking.renter.firstName} has marked the item as ${newStatus.toLowerCase()}.`);
        }
        return updatedBooking;
    }
}
exports.BookingService = BookingService;
