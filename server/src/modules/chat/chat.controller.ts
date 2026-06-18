import { Request, Response, NextFunction } from 'express';
import { ChatService } from './chat.service';

export class ChatController {
  static getConversations = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const conversations = await ChatService.getConversations(req.user!.id);
      res.status(200).json({ status: 'success', data: conversations });
    } catch (error) {
      next(error);
    }
  };

  static getMessages = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const messages = await ChatService.getMessages(req.params.id as string, req.user!.id);
      res.status(200).json({ status: 'success', data: messages });
    } catch (error) {
      next(error);
    }
  };

  static createConversation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { ownerId, renterId, itemId } = req.body;
      const conversation = await ChatService.createOrGetConversation(req.user!.id, ownerId, renterId, itemId);
      res.status(200).json({ status: 'success', data: conversation });
    } catch (error) {
      next(error);
    }
  };

  static sendMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { conversationId, content } = req.body;
      const message = await ChatService.sendMessage(req.user!.id, conversationId, content);
      res.status(201).json({ status: 'success', data: message });
    } catch (error) {
      next(error);
    }
  };
}
