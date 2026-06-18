"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingRepository = void 0;
const db_1 = require("@/config/db");
const client_1 = require("@prisma/client");
const AppError_1 = require("@/core/exceptions/AppError");
class BookingRepository {
    static async createBooking(data) {
        return db_1.db.$transaction(async (tx) => {
            // 1. Fetch item to calculate price and check existence
            const item = await tx.item.findUnique({ where: { id: data.itemId } });
            if (!item)
                throw new AppError_1.NotFoundError('Item not found');
            // 2. Check for overlapping manual availabilities (blocked dates)
            const blockedDates = await tx.availability.findFirst({
                where: {
                    itemId: data.itemId,
                    blockedFrom: { lte: data.endDate },
                    blockedTo: { gte: data.startDate },
                },
            });
            if (blockedDates) {
                throw new AppError_1.ConflictError('Dates are manually blocked by the owner for this period.');
            }
            // 3. Check for overlapping bookings
            const overlappingBooking = await tx.booking.findFirst({
                where: {
                    itemId: data.itemId,
                    status: {
                        in: [
                            client_1.BookingStatus.PENDING,
                            client_1.BookingStatus.APPROVED,
                            client_1.BookingStatus.CONFIRMED,
                            client_1.BookingStatus.ACTIVE,
                            client_1.BookingStatus.RETURNED,
                        ],
                    },
                    startDate: { lte: data.endDate },
                    endDate: { gte: data.startDate },
                },
            });
            if (overlappingBooking) {
                throw new AppError_1.ConflictError('The item is already booked during these dates.');
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
                    status: client_1.BookingStatus.PENDING,
                },
                include: {
                    item: true,
                    renter: true,
                },
            });
        });
    }
    static async findById(id) {
        return db_1.db.booking.findUnique({
            where: { id },
            include: {
                item: { include: { owner: true, images: true } },
                renter: { select: { id: true, firstName: true, lastName: true, email: true } },
                reviews: true,
            },
        });
    }
    static async findByRenter(renterId) {
        return db_1.db.booking.findMany({
            where: { renterId },
            include: {
                item: { include: { images: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    static async findByOwner(ownerId) {
        return db_1.db.booking.findMany({
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
    static async updateStatus(id, status) {
        return db_1.db.booking.update({
            where: { id },
            data: { status },
            include: {
                item: { include: { owner: true } },
                renter: true,
            },
        });
    }
}
exports.BookingRepository = BookingRepository;
