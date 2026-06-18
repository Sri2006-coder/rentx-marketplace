import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { db } from './config/db';

export const initSocketIO = (server: HttpServer) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Authentication Middleware
  io.use((socket, next) => {
    try {
      const cookies = cookie.parse(socket.handshake.headers.cookie || '');
      const token = cookies.token;
      if (!token) return next(new Error('Authentication error'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
      socket.data.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected to chat socket: ${socket.data.userId}`);

    // Join a conversation room
    socket.on('join_room', (conversationId: string) => {
      socket.join(`room_${conversationId}`);
    });

    // Handle sending message
    socket.on('send_message', async (data: { conversationId: string; content: string }) => {
      try {
        const { conversationId, content } = data;
        const senderId = socket.data.userId;

        // Basic validation
        if (!content || content.trim().length === 0) return;
        if (content.length > 1000) return;

        // Save to DB
        const message = await db.message.create({
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
      } catch (error) {
        console.error('Error saving message:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected from socket: ${socket.data.userId}`);
    });
  });

  return io;
};
