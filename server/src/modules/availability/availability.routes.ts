import { Router } from 'express';
import { AvailabilityController } from './availability.controller';
import { requireAuth } from '../../api/middlewares/requireAuth';
import { validate } from '../../api/middlewares/validate';
import { blockDatesSchema } from './availability.schema';

// Note: This router is meant to be mounted under /api/v1/items/:itemId/availability
const router = Router({ mergeParams: true });

router.get('/', AvailabilityController.getAvailability);

router.use(requireAuth);

router.post(
  '/',
  validate(blockDatesSchema),
  AvailabilityController.blockDates
);

router.delete(
  '/:id',
  AvailabilityController.unblockDates
);

export default router;
