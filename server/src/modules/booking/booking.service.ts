import { BookingRepository } from './booking.repository';
import { BookingStatus } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { NotificationService } from '../notification/notification.service';
import { ForbiddenError, NotFoundError, BadRequestError } from '../../core/exceptions/AppError';
import { db } from '../../config/db';

export class BookingService {
  static async requestBooking(userId: string, data: any) {
    const item = await db.item.findUnique({ where: { id: data.itemId } });
    if (!item) throw new NotFoundError('Item not found');

    if (item.requireVerified) {
      const trustProfile = await db.trustProfile.findUnique({ where: { userId } });
      if (!trustProfile || !trustProfile.verifiedBadge) {
        throw new ForbiddenError('This item requires a verified account to rent. Please complete your identity verification.');
      }
    }

    const booking = await BookingRepository.createBooking({
      itemId: data.itemId,
      renterId: userId,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      notes: data.notes,
    });

    await AuditService.logAction('BOOKING_REQUESTED', 'BOOKING', booking.id, userId);

    await NotificationService.createNotification(
      booking.item.ownerId,
      'New Booking Request',
      `${booking.renter.firstName} has requested to book ${booking.item.title}.`,
      '/my-listings'
    ).catch(console.error);

    return booking;
  }

  static async getMyRentals(userId: string) {
    return BookingRepository.findByRenter(userId);
  }

  static async getMyIncomingRequests(ownerId: string) {
    return BookingRepository.findByOwner(ownerId);
  }

  static async getBookingDetails(bookingId: string) {
    const booking = await BookingRepository.findById(bookingId);
    if (!booking) throw new NotFoundError('Booking not found');
    
    const timeline = await AuditService.getLogsForEntity('BOOKING', bookingId);
    
    return { ...booking, timeline };
  }

  static async updateStatus(bookingId: string, userId: string, newStatus: BookingStatus, additionalData?: any) {
    const booking = await BookingRepository.findById(bookingId);
    if (!booking) throw new NotFoundError('Booking not found');

    const isOwner = booking.item.ownerId === userId;
    const isRenter = booking.renterId === userId;

    if (!isOwner && !isRenter) {
      throw new ForbiddenError('You do not have permission to modify this booking');
    }

    // Permission matrix
    if (
      (newStatus === BookingStatus.APPROVED || newStatus === BookingStatus.REJECTED) && !isOwner
    ) {
      throw new ForbiddenError('Only the owner can approve or reject bookings');
    }

    if (newStatus === BookingStatus.CANCELLED && !isRenter) {
      throw new ForbiddenError('Only the renter can cancel a pending booking');
    }

    if (newStatus === BookingStatus.ACTIVE) {
      const payment = await db.payment.findFirst({
        where: { bookingId, paymentStatus: 'ESCROW_HELD' }
      });
      if (!payment) {
        throw new BadRequestError('Cannot start rental. Payment must be in Escrow.');
      }
    }

    const updateData: any = { status: newStatus };
    if (newStatus === BookingStatus.RETURNED && additionalData?.damageReport) {
      updateData.damageReport = additionalData.damageReport;
      updateData.actualReturnDate = new Date();
    }

    const updatedBooking = await db.booking.update({
      where: { id: bookingId },
      data: updateData
    });

    // If RETURNED with NO damage, trigger mock refund
    if (newStatus === BookingStatus.RETURNED && additionalData?.damageReport === 'NONE') {
      const { PaymentService } = await import('../payment/payment.service');
      await PaymentService.refundSecurityDeposit(bookingId).catch(console.error);
    }

    await AuditService.logAction(`BOOKING_${newStatus}`, 'BOOKING', bookingId, userId);

    // Notify appropriate party
    if (newStatus === BookingStatus.APPROVED || newStatus === BookingStatus.REJECTED) {
      await NotificationService.createNotification(
        booking.renterId,
        `Booking ${newStatus}`,
        `Your request for ${booking.item.title} has been ${newStatus.toLowerCase()}.`,
        '/my-rentals'
      ).catch(console.error);
    } else if (newStatus === BookingStatus.RETURNED || newStatus === BookingStatus.COMPLETED) {
      await NotificationService.createNotification(
        booking.item.ownerId,
        `Booking ${newStatus}`,
        `${booking.renter.firstName} has marked the item as ${newStatus.toLowerCase()}.`,
        '/my-listings'
      ).catch(console.error);
    }

    return updatedBooking;
  }
}
