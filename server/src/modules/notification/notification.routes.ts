import { Router } from 'express';
import { NotificationController } from './notification.controller';
import { requireAuth } from '../../api/middlewares/requireAuth';

const router = Router();

router.use(requireAuth);

router.get('/', NotificationController.getNotifications);
router.patch('/read-all', NotificationController.markAllAsRead);
router.patch('/:id/read', NotificationController.markAsRead);

export default router;
