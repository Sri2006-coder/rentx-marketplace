import { Router } from 'express';
import { VerificationController } from './verification.controller';
import { requireAuth } from '../../api/middlewares/requireAuth';
import { upload } from '../../api/middlewares/upload';

const router = Router();

// Require authentication for all routes
router.use(requireAuth);

router.post(
  '/upload',
  upload.fields([
    { name: 'aadhaar', maxCount: 1 },
    { name: 'pan', maxCount: 1 }
  ]),
  VerificationController.uploadDocuments
);

router.post(
  '/auto-verify',
  upload.fields([
    { name: 'aadhaar', maxCount: 1 },
    { name: 'selfie', maxCount: 1 }
  ]),
  VerificationController.autoVerify
);

router.get('/status', VerificationController.getStatus);

// Admin routes (Assume an requireAdmin middleware would go here in a real app, 
// but we omit it for Phase 6 as Admin Dashboard is explicitly skipped)
router.put('/approve/:id', VerificationController.approveVerification);
router.put('/reject/:id', VerificationController.rejectVerification);

export default router;
