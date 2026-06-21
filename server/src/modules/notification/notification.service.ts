import { NotificationRepository } from './notification.repository';
import { sendRealtimeNotification } from '../../socket';

export class NotificationService {
  static async getNotifications(userId: string) {
    return await NotificationRepository.findByUserId(userId);
  }

  static async createNotification(userId: string, title: string, message: string, link?: string) {
    const notification = await NotificationRepository.create({
      userId,
      title,
      message,
      link,
    });

    // Send real-time socket notification
    try {
      sendRealtimeNotification(userId, notification);
    } catch (err) {
      console.error('Failed to send real-time notification via socket:', err);
    }

    return notification;
  }

  static async markAsRead(id: string, userId: string) {
    return await NotificationRepository.markAsRead(id, userId);
  }

  static async markAllAsRead(userId: string) {
    return await NotificationRepository.markAllAsRead(userId);
  }
}
