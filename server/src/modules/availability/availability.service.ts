import { AvailabilityRepository } from './availability.repository';
import { db } from '../../config/db';
import { ForbiddenError, NotFoundError } from '../../core/exceptions/AppError';

export class AvailabilityService {
  static async blockDates(userId: string, itemId: string, data: { blockedFrom: Date; blockedTo: Date; reason?: string }) {
    const item = await db.item.findUnique({ where: { id: itemId } });
    if (!item) throw new NotFoundError('Item not found');
    if (item.ownerId !== userId) throw new ForbiddenError('Only the owner can block dates');

    return AvailabilityRepository.blockDates({
      itemId,
      ...data,
    });
  }

  static async unblockDates(userId: string, itemId: string, availabilityId: string) {
    const item = await db.item.findUnique({ where: { id: itemId } });
    if (!item) throw new NotFoundError('Item not found');
    if (item.ownerId !== userId) throw new ForbiddenError('Only the owner can unblock dates');

    const block = await db.availability.findUnique({ where: { id: availabilityId } });
    if (!block || block.itemId !== itemId) throw new NotFoundError('Blocked date not found');

    return AvailabilityRepository.unblockDates(availabilityId);
  }

  static async getAvailability(itemId: string) {
    return AvailabilityRepository.getAvailability(itemId);
  }
}
