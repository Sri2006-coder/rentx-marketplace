"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocketIO = void 0;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cookie_1 = __importDefault(require("cookie"));
const db_1 = require("./config/db");
const initSocketIO = (server) => {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true
        }
    });
    // Authentication Middleware
    io.use((socket, next) => {
        try {
            const cookies = cookie_1.default.parse(socket.handshake.headers.cookie || '');
            const token = cookies.token;
            if (!token)
                return next(new Error('Authentication error'));
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            socket.data.userId = decoded.id;
            next();
        }
        catch (err) {
            next(new Error('Authentication error'));
        }
    });
    io.on('connection', (socket) => {
        console.log(`User connected to chat socket: ${socket.data.userId}`);
        // Join a conversation room
        socket.on('join_room', (conversationId) => {
            socket.join(`room_${conversationId}`);
        });
        // Handle sending message
        socket.on('send_message', async (data) => {
            try {
                const { conversationId, content } = data;
                const senderId = socket.data.userId;
                // Basic validation
                if (!content || content.trim().length === 0)
                    return;
                if (content.length > 1000)
                    return;
                // Save to DB
                const message = await db_1.db.message.create({
                    data: {
                        conversationId,
                        senderId,
                        content: content.trim()
                    },
                    include: {
                        sender: {
                            select: { id: true, firstName: true, lastName: true, profileImage: true }
                        }
                    }
                });
                // Broadcast to room
                io.to(`room_${conversationId}`).emit('receive_message', message);
            }
            catch (error) {
                console.error('Error saving message:', error);
            }
        });
        socket.on('disconnect', () => {
            console.log(`User disconnected from socket: ${socket.data.userId}`);
        });
    });
    return io;
};
exports.initSocketIO = initSocketIO;
