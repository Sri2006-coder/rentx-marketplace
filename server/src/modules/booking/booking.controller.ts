import { Request, Response, NextFunction } from 'express';
import { BookingService } from './booking.service';

export class BookingController {
  static async requestBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const booking = await BookingService.requestBooking(req.user!.id, req.body);
      res.status(201).json({ success: true, data: booking, message: 'Booking requested successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async getMyRentals(req: Request, res: Response, next: NextFunction) {
    try {
      const bookings = await BookingService.getMyRentals(req.user!.id);
      res.status(200).json({ success: true, data: bookings, message: 'Rentals retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async getMyIncomingRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const bookings = await BookingService.getMyIncomingRequests(req.user!.id);
      res.status(200).json({ success: true, data: bookings, message: 'Incoming requests retrieved' });
    } catch (error) {
      next(error);
    }
  }

  static async getBookingDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const booking = await BookingService.getBookingDetails(req.params.id);
      res.status(200).json({ success: true, data: booking, message: 'Booking details retrieved' });
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, ...additionalData } = req.body;
      const booking = await BookingService.updateStatus(id, req.user!.id, status, additionalData);
      res.json({ success: true, data: booking, message: `Booking status updated to ${status}` });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }
}
