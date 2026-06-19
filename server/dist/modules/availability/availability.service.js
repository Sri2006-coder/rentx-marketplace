"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvailabilityService = void 0;
const availability_repository_1 = require("./availability.repository");
const db_1 = require("../../config/db");
const AppError_1 = require("../../core/exceptions/AppError");
class AvailabilityService {
    static async blockDates(userId, itemId, data) {
        const item = await db_1.db.item.findUnique({ where: { id: itemId } });
        if (!item)
            throw new AppError_1.NotFoundError('Item not found');
        if (item.ownerId !== userId)
            throw new AppError_1.ForbiddenError('Only the owner can block dates');
        return availability_repository_1.AvailabilityRepository.blockDates({
            itemId,
            ...data,
        });
    }
    static async unblockDates(userId, itemId, availabilityId) {
        const item = await db_1.db.item.findUnique({ where: { id: itemId } });
        if (!item)
            throw new AppError_1.NotFoundError('Item not found');
        if (item.ownerId !== userId)
            throw new AppError_1.ForbiddenError('Only the owner can unblock dates');
        const block = await db_1.db.availability.findUnique({ where: { id: availabilityId } });
        if (!block || block.itemId !== itemId)
            throw new AppError_1.NotFoundError('Blocked date not found');
        return availability_repository_1.AvailabilityRepository.unblockDates(availabilityId);
    }
    static async getAvailability(itemId) {
        return availability_repository_1.AvailabilityRepository.getAvailability(itemId);
    }
}
exports.AvailabilityService = AvailabilityService;
