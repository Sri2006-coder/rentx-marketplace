import { Router } from 'express';
import { BookingController } from './booking.controller';
import { requireAuth } from '../../api/middlewares/requireAuth';
import { validate } from '../../api/middlewares/validate';
import { createBookingSchema, updateBookingStatusSchema } from './booking.schema';

const router = Router();

router.use(requireAuth);

router.post(
  '/',
  validate(createBookingSchema),
  BookingController.requestBooking
);

router.get(
  '/renter',
  BookingController.getMyRentals
);

router.get(
  '/owner',
  BookingController.getMyIncomingRequests
);

router.get(
  '/:id',
  BookingController.getBookingDetails
);

router.put(
  '/:id/status',
  validate(updateBookingStatusSchema),
  BookingController.updateStatus
);

export default router;
