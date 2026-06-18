import { Router } from 'express';
import { requireAuth } from '@/api/middlewares/requireAuth';
import { createPaymentIntent, mockSuccess, mockFailure, getPaymentHistory } from './payment.controller';

const router = Router();

router.use(requireAuth);

router.post('/create', createPaymentIntent);
router.post('/success', mockSuccess);
router.post('/failure', mockFailure);
router.get('/', getPaymentHistory);

export default router;
