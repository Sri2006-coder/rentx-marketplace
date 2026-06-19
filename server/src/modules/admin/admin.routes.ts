import { Router } from 'express';
import { AdminController } from './admin.controller';
import { requireAuth, requireRole } from '../../api/middlewares/requireAuth';

const router = Router();

// Protect all admin routes
router.use(requireAuth, requireRole('ADMIN'));

router.get('/dashboard/metrics', AdminController.getDashboardMetrics);

router.get('/users', AdminController.getUsers);
router.put('/users/:id/suspend', AdminController.suspendUser);
router.put('/users/:id/activate', AdminController.activateUser);

router.get('/verifications', AdminController.getVerifications);
router.put('/verifications/:id/approve', AdminController.approveVerification);
router.put('/verifications/:id/reject', AdminController.rejectVerification);

router.get('/items', AdminController.getItems);
router.put('/items/:id/status', AdminController.updateItemStatus);

router.get('/bookings', AdminController.getBookings);
router.put('/bookings/:id/cancel', AdminController.cancelBooking);

router.get('/payments', AdminController.getPayments);

router.get('/disputes', AdminController.getDisputes);
router.put('/disputes/:id/status', AdminController.updateDisputeStatus);

router.get('/audit', AdminController.getAuditLogs);

export default router;
