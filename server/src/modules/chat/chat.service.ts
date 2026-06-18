import { db } from '../../config/db';
import { NotFoundError, BadRequestError } from '../../core/exceptions/AppError';

export class ChatService {
  static async getConversations(userId: string) {
    return await db.conversation.findMany({
      where: {
        OR: [{ ownerId: userId }, { renterId: userId }],
      },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, profileImage: true } },
        renter: { select: { id: true, firstName: true, lastName: true, profileImage: true } },
        item: { select: { id: true, title: true, images: { take: 1 } } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  static async getMessages(conversationId: string, userId: string) {
    const conversation = await db.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) throw new NotFoundError('Conversation not found');
    if (conversation.ownerId !== userId && conversation.renterId !== userId) {
      throw new BadRequestError('Not authorized to view this conversation');
    }

    return await db.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, profileImage: true } },
      },
    });
  }

  static async createOrGetConversation(userId: string, ownerId: string, renterId: string, itemId?: string) {
    if (userId !== ownerId && userId !== renterId) {
      throw new BadRequestError('Not authorized to create this conversation');
    }

    let conversation;

    if (itemId) {
      conversation = await db.conversation.findFirst({
        where: { ownerId, renterId, itemId },
      });
    } else {
      conversation = await db.conversation.findFirst({
        where: { ownerId, renterId, itemId: null },
      });
    }

    if (!conversation) {
      conversation = await db.conversation.create({
        data: {
          ownerId,
          renterId,
          itemId: itemId || null,
        },
      });
    }

    return conversation;
  }

  static async sendMessage(userId: string, conversationId: string, content: string) {
    const conversation = await db.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) throw new NotFoundError('Conversation not found');
    if (conversation.ownerId !== userId && conversation.renterId !== userId) {
      throw new BadRequestError('Not authorized to send message in this conversation');
    }

    const message = await db.message.create({
      data: {
        conversationId,
        senderId: userId,
        content,
      },
    });

    await db.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return message;
  }
}
