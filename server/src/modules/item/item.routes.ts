import { Router } from 'express';
import { ItemController } from './item.controller';
import { validate } from '@/api/middlewares/validate';
import { createItemSchema, updateItemSchema, itemQuerySchema } from './item.schema';
import { requireAuth } from '@/api/middlewares/requireAuth';
import { upload } from '@/api/middlewares/upload';
import availabilityRoutes from '../availability/availability.routes';

const router = Router();

router.use('/:itemId/availability', availabilityRoutes);

router.post(
  '/',
  requireAuth,
  upload.array('images', 5),
  validate(createItemSchema),
  ItemController.createItem
);

router.get(
  '/',
  validate(itemQuerySchema, 'query'),
  ItemController.getItems
);

router.get(
  '/:id',
  ItemController.getItemById
);

router.put(
  '/:id',
  requireAuth,
  validate(updateItemSchema),
  ItemController.updateItem
);

router.delete(
  '/:id',
  requireAuth,
  ItemController.deleteItem
);

export default router;
