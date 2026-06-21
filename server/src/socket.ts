import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { parse } from 'cookie';
import { db } from './config/db';
import { verifyAccessToken } from './core/utils/jwt';

let ioInstance: SocketIOServer | null = null;

export const initSocketIO = (server: HttpServer) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });
  ioInstance = io;

  // Authentication Middleware
  io.use((socket, next) => {
    try {
      const cookies = parse(socket.handshake.headers.cookie || '');
      const token = cookies.accessToken;
      if (!token) return next(new Error('Authentication error: Token missing'));
      const decoded = verifyAccessToken(token);
      socket.data.userId = decoded.userId;
      next();
    } catch (err) {
      console.error('Socket authentication failed:', err);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    console.log(`User connected to chat socket: ${userId}`);

    // Join personal user room for notifications
    socket.join(`user_${userId}`);

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

export const sendRealtimeNotification = (userId: string, notification: any) => {
  if (ioInstance) {
    ioInstance.to(`user_${userId}`).emit('new_notification', notification);
    console.log(`Real-time notification emitted to user_${userId}`);
  } else {
    console.warn('Socket.io instance is not initialized yet. Cannot send real-time notification.');
  }
};
