"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvailabilityRepository = void 0;
const db_1 = require("@/config/db");
const client_1 = require("@prisma/client");
const AppError_1 = require("@/core/exceptions/AppError");
class AvailabilityRepository {
    static async blockDates(data) {
        return db_1.db.$transaction(async (tx) => {
            // 1. Check for overlapping manual availabilities
            const existingBlock = await tx.availability.findFirst({
                where: {
                    itemId: data.itemId,
                    blockedFrom: { lte: data.blockedTo },
                    blockedTo: { gte: data.blockedFrom },
                },
            });
            if (existingBlock) {
                throw new AppError_1.ConflictError('Some of these dates are already manually blocked.');
            }
            // 2. Check for overlapping active bookings
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
                    startDate: { lte: data.blockedTo },
                    endDate: { gte: data.blockedFrom },
                },
            });
            if (overlappingBooking) {
                throw new AppError_1.ConflictError('Cannot block dates because there is an active booking during this period.');
            }
            return tx.availability.create({
                data,
            });
        });
    }
    static async unblockDates(id) {
        return db_1.db.availability.delete({
            where: { id },
        });
    }
    static async getAvailability(itemId) {
        const blocks = await db_1.db.availability.findMany({
            where: { itemId },
        });
        const bookings = await db_1.db.booking.findMany({
            where: {
                itemId,
                status: {
                    in: [
                        client_1.BookingStatus.PENDING,
                        client_1.BookingStatus.APPROVED,
                        client_1.BookingStatus.CONFIRMED,
                        client_1.BookingStatus.ACTIVE,
                        client_1.BookingStatus.RETURNED,
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
exports.AvailabilityRepository = AvailabilityRepository;
