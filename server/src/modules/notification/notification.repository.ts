import { db } from '../../config/db';

export class NotificationRepository {
  static async create(data: { userId: string; title: string; message: string; link?: string }) {
    return await db.notification.create({
      data,
    });
  }

  static async findByUserId(userId: string) {
    return await db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async markAsRead(id: string, userId: string) {
    return await db.notification.update({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  static async markAllAsRead(userId: string) {
    return await db.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}
