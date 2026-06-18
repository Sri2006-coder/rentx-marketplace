import { Request, Response, NextFunction } from 'express';
import { AvailabilityService } from './availability.service';

export class AvailabilityController {
  static async blockDates(req: Request, res: Response, next: NextFunction) {
    try {
      const data = {
        blockedFrom: new Date(req.body.blockedFrom),
        blockedTo: new Date(req.body.blockedTo),
        reason: req.body.reason,
      };
      const block = await AvailabilityService.blockDates(req.user!.id, req.params.itemId, data);
      res.status(201).json({ success: true, data: block, message: 'Dates blocked successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async unblockDates(req: Request, res: Response, next: NextFunction) {
    try {
      await AvailabilityService.unblockDates(req.user!.id, req.params.itemId, req.params.id);
      res.status(200).json({ success: true, message: 'Dates unblocked successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async getAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const availability = await AvailabilityService.getAvailability(req.params.itemId);
      res.status(200).json({ success: true, data: availability, message: 'Availability retrieved' });
    } catch (error) {
      next(error);
    }
  }
}
