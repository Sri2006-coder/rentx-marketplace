import { db } from '../../config/db';
import { BookingStatus } from '@prisma/client';
import { ConflictError, NotFoundError } from '../../core/exceptions/AppError';

export class AvailabilityRepository {
  static async blockDates(data: { itemId: string; blockedFrom: Date; blockedTo: Date; reason?: string }) {
    return db.$transaction(async (tx) => {
      // 1. Check for overlapping manual availabilities
      const existingBlock = await tx.availability.findFirst({
        where: {
          itemId: data.itemId,
          blockedFrom: { lte: data.blockedTo },
          blockedTo: { gte: data.blockedFrom },
        },
      });

      if (existingBlock) {
        throw new ConflictError('Some of these dates are already manually blocked.');
      }

      // 2. Check for overlapping active bookings
      const overlappingBooking = await tx.booking.findFirst({
        where: {
          itemId: data.itemId,
          status: {
            in: [
              BookingStatus.PENDING,
              BookingStatus.APPROVED,
              BookingStatus.CONFIRMED,
              BookingStatus.ACTIVE,
              BookingStatus.RETURNED,
            ],
          },
          startDate: { lte: data.blockedTo },
          endDate: { gte: data.blockedFrom },
        },
      });

      if (overlappingBooking) {
        throw new ConflictError('Cannot block dates because there is an active booking during this period.');
      }

      return tx.availability.create({
        data,
      });
    });
  }

  static async unblockDates(id: string) {
    return db.availability.delete({
      where: { id },
    });
  }

  static async getAvailability(itemId: string) {
    const blocks = await db.availability.findMany({
      where: { itemId },
    });

    const bookings = await db.booking.findMany({
      where: {
        itemId,
        status: {
          in: [
            BookingStatus.PENDING,
            BookingStatus.APPROVED,
            BookingStatus.CONFIRMED,
            BookingStatus.ACTIVE,
            BookingStatus.RETURNED,
          ],
        },
      },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        status: true,
      }
    });

    return { blocks, bookings };
  }
}
