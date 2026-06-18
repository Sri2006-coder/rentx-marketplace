"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatController = void 0;
const chat_service_1 = require("./chat.service");
class ChatController {
    static getConversations = async (req, res, next) => {
        try {
            const conversations = await chat_service_1.ChatService.getConversations(req.user.id);
            res.status(200).json({ status: 'success', data: conversations });
        }
        catch (error) {
            next(error);
        }
    };
    static getMessages = async (req, res, next) => {
        try {
            const messages = await chat_service_1.ChatService.getMessages(req.params.id, req.user.id);
            res.status(200).json({ status: 'success', data: messages });
        }
        catch (error) {
            next(error);
        }
    };
    static createConversation = async (req, res, next) => {
        try {
            const { ownerId, renterId, itemId } = req.body;
            const conversation = await chat_service_1.ChatService.createOrGetConversation(req.user.id, ownerId, renterId, itemId);
            res.status(200).json({ status: 'success', data: conversation });
        }
        catch (error) {
            next(error);
        }
    };
    static sendMessage = async (req, res, next) => {
        try {
            const { conversationId, content } = req.body;
            const message = await chat_service_1.ChatService.sendMessage(req.user.id, conversationId, content);
            res.status(201).json({ status: 'success', data: message });
        }
        catch (error) {
            next(error);
        }
    };
}
exports.ChatController = ChatController;
