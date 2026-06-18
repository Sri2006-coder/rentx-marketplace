"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const db_1 = require("../../config/db");
const AppError_1 = require("../../core/exceptions/AppError");
class ChatService {
    static async getConversations(userId) {
        return await db_1.db.conversation.findMany({
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
    static async getMessages(conversationId, userId) {
        const conversation = await db_1.db.conversation.findUnique({
            where: { id: conversationId },
        });
        if (!conversation)
            throw new AppError_1.NotFoundError('Conversation not found');
        if (conversation.ownerId !== userId && conversation.renterId !== userId) {
            throw new AppError_1.BadRequestError('Not authorized to view this conversation');
        }
        return await db_1.db.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' },
            include: {
                sender: { select: { id: true, firstName: true, lastName: true, profileImage: true } },
            },
        });
    }
    static async createOrGetConversation(userId, ownerId, renterId, itemId) {
        if (userId !== ownerId && userId !== renterId) {
            throw new AppError_1.BadRequestError('Not authorized to create this conversation');
        }
        let conversation;
        if (itemId) {
            conversation = await db_1.db.conversation.findFirst({
                where: { ownerId, renterId, itemId },
            });
        }
        else {
            conversation = await db_1.db.conversation.findFirst({
                where: { ownerId, renterId, itemId: null },
            });
        }
        if (!conversation) {
            conversation = await db_1.db.conversation.create({
                data: {
                    ownerId,
                    renterId,
                    itemId: itemId || null,
                },
            });
        }
        return conversation;
    }
    static async sendMessage(userId, conversationId, content) {
        const conversation = await db_1.db.conversation.findUnique({
            where: { id: conversationId },
        });
        if (!conversation)
            throw new AppError_1.NotFoundError('Conversation not found');
        if (conversation.ownerId !== userId && conversation.renterId !== userId) {
            throw new AppError_1.BadRequestError('Not authorized to send message in this conversation');
        }
        const message = await db_1.db.message.create({
            data: {
                conversationId,
                senderId: userId,
                content,
            },
        });
        await db_1.db.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() },
        });
        return message;
    }
}
exports.ChatService = ChatService;
