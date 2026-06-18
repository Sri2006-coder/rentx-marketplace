import { Request, Response, NextFunction } from 'express';
import { AdminService } from './admin.service';

export class AdminController {
  static async getDashboardMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const metrics = await AdminService.getDashboardMetrics();
      res.json({ success: true, data: metrics });
    } catch (error) {
      next(error);
    }
  }

  static async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await AdminService.getUsers();
      res.json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  }

  static async suspendUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await AdminService.suspendUser(req.user!.id, req.params.id);
      res.json({ success: true, data: user, message: 'User suspended' });
    } catch (error) {
      next(error);
    }
  }

  static async activateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await AdminService.activateUser(req.user!.id, req.params.id);
      res.json({ success: true, data: user, message: 'User activated' });
    } catch (error) {
      next(error);
    }
  }

  static async getVerifications(req: Request, res: Response, next: NextFunction) {
    try {
      const verifications = await AdminService.getVerifications();
      res.json({ success: true, data: verifications });
    } catch (error) {
      next(error);
    }
  }

  static async approveVerification(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await AdminService.approveVerification(req.user!.id, req.params.id);
      res.json({ success: true, data: profile, message: 'Verification approved' });
    } catch (error) {
      next(error);
    }
  }

  static async rejectVerification(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await AdminService.rejectVerification(req.user!.id, req.params.id);
      res.json({ success: true, data: profile, message: 'Verification rejected' });
    } catch (error) {
      next(error);
    }
  }

  static async getItems(req: Request, res: Response, next: NextFunction) {
    try {
      const items = await AdminService.getItems();
      res.json({ success: true, data: items });
    } catch (error) {
      next(error);
    }
  }

  static async updateItemStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      const item = await AdminService.updateItemStatus(req.user!.id, req.params.id, status);
      res.json({ success: true, data: item, message: `Item status updated to ${status}` });
    } catch (error) {
      next(error);
    }
  }

  static async getBookings(req: Request, res: Response, next: NextFunction) {
    try {
      const bookings = await AdminService.getBookings();
      res.json({ success: true, data: bookings });
    } catch (error) {
      next(error);
    }
  }

  static async cancelBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const booking = await AdminService.cancelBooking(req.user!.id, req.params.id);
      res.json({ success: true, data: booking, message: 'Booking cancelled' });
    } catch (error) {
      next(error);
    }
  }

  static async getPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const payments = await AdminService.getPayments();
      res.json({ success: true, data: payments });
    } catch (error) {
      next(error);
    }
  }

  static async getDisputes(req: Request, res: Response, next: NextFunction) {
    try {
      const disputes = await AdminService.getDisputes();
      res.json({ success: true, data: disputes });
    } catch (error) {
      next(error);
    }
  }

  static async updateDisputeStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, resolution } = req.body;
      const dispute = await AdminService.updateDisputeStatus(req.user!.id, req.params.id, status, resolution);
      res.json({ success: true, data: dispute, message: `Dispute updated to ${status}` });
    } catch (error) {
      next(error);
    }
  }

  static async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const logs = await AdminService.getAuditLogs();
      res.json({ success: true, data: logs });
    } catch (error) {
      next(error);
    }
  }
}
