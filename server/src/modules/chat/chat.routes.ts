import { Router } from 'express';
import { ChatController } from './chat.controller';
import { requireAuth } from '../../api/middlewares/requireAuth';

const router = Router();

router.use(requireAuth);

router.get('/conversations', ChatController.getConversations);
router.get('/conversations/:id/messages', ChatController.getMessages);
router.post('/conversations', ChatController.createConversation);
router.post('/messages', ChatController.sendMessage);

export default router;
