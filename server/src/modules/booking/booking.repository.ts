import { db } from '@/config/db';
import { BookingStatus, Prisma } from '@prisma/client';
import { ConflictError, NotFoundError } from '@/core/exceptions/AppError';

export class BookingRepository {
  static async createBooking(data: {
    itemId: string;
    renterId: string;
    startDate: Date;
    endDate: Date;
    notes?: string;
  }) {
    return db.$transaction(async (tx) => {
      // 1. Fetch item to calculate price and check existence
      const item = await tx.item.findUnique({ where: { id: data.itemId } });
      if (!item) throw new NotFoundError('Item not found');

      // 2. Check for overlapping manual availabilities (blocked dates)
      const blockedDates = await tx.availability.findFirst({
        where: {
          itemId: data.itemId,
          blockedFrom: { lte: data.endDate },
          blockedTo: { gte: data.startDate },
        },
      });

      if (blockedDates) {
        throw new ConflictError('Dates are manually blocked by the owner for this period.');
      }

      // 3. Check for overlapping bookings
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
          startDate: { lte: data.endDate },
          endDate: { gte: data.startDate },
        },
      });

      if (overlappingBooking) {
        throw new ConflictError('The item is already booked during these dates.');
      }

      // 4. Calculate total price
      // Days difference (inclusive)
      const diffTime = Math.abs(data.endDate.getTime() - data.startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end day
      const totalPrice = (Number(item.dailyRate) * diffDays) + Number(item.securityDeposit);

      // 5. Create the booking
      return tx.booking.create({
        data: {
          itemId: data.itemId,
          renterId: data.renterId,
          startDate: data.startDate,
          endDate: data.endDate,
          totalPrice,
          notes: data.notes,
          status: BookingStatus.PENDING,
        },
        include: {
          item: true,
          renter: true,
        },
      });
    });
  }

  static async findById(id: string) {
    return db.booking.findUnique({
      where: { id },
      include: {
        item: { include: { owner: true, images: true } },
        renter: { select: { id: true, firstName: true, lastName: true, email: true } },
        reviews: true,
      },
    });
  }

  static async findByRenter(renterId: string) {
    return db.booking.findMany({
      where: { renterId },
      include: {
        item: { include: { images: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async findByOwner(ownerId: string) {
    return db.booking.findMany({
      where: {
        item: { ownerId },
      },
      include: {
        item: { include: { images: true } },
        renter: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async updateStatus(id: string, status: BookingStatus) {
    return db.booking.update({
      where: { id },
      data: { status },
      include: {
        item: { include: { owner: true } },
        renter: true,
      },
    });
  }
}
