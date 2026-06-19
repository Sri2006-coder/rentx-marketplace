import { Router } from 'express';
import { AuthController } from '../../../modules/auth/auth.controller';
import { validate } from '../../middlewares/validate';
import { registerSchema, loginSchema } from '../../../modules/auth/auth.schema';
import { requireAuth } from '../../middlewares/requireAuth';

const router = Router();

router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);
router.post('/logout', requireAuth, AuthController.logout);
router.get('/me', requireAuth, AuthController.getMe);

export default router;
