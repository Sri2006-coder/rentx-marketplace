import { Request, Response, NextFunction } from 'express';
import { NotificationService } from './notification.service';

export class NotificationController {
  static getNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notifications = await NotificationService.getNotifications(req.user!.id);
      res.status(200).json({ status: 'success', data: notifications });
    } catch (error) {
      next(error);
    }
  };

  static markAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notification = await NotificationService.markAsRead(req.params.id, req.user!.id);
      res.status(200).json({ status: 'success', data: notification });
    } catch (error) {
      next(error);
    }
  };

  static markAllAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await NotificationService.markAllAsRead(req.user!.id);
      res.status(200).json({ status: 'success', message: 'All notifications marked as read' });
    } catch (error) {
      next(error);
    }
  };
}
