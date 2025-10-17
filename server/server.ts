import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database.js';
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import organizationRoutes from './routes/organization.js';
import notificationRoutes from './routes/notification.js';
import Notification from './models/Notification.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/chat', chatRoutes);
app.use('/organization', organizationRoutes);
app.use('/notification', notificationRoutes);

const connectedUsers = new Map<string, string>();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('register', (userId: string) => {
    connectedUsers.set(userId, socket.id);
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });

  socket.on('disconnect', () => {
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

app.post('/notification/send-global', async (req, res) => {
  try {
    const { title, message } = req.body;

    if (!title || !message) {
      res.status(400).json({ error: 'Title and message are required' });
      return;
    }

    const notification = new Notification({
      type: 'global',
      title,
      message,
      read: false
    });

    await notification.save();

    io.emit('notification', {
      id: notification._id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      read: notification.read,
      createdAt: notification.createdAt
    });

    res.status(201).json({ notification });
  } catch (error) {
    console.error('Send global notification error:', error);
    res.status(500).json({ error: 'Server error sending notification' });
  }
});

app.post('/notification/send-user', async (req, res) => {
  try {
    const { userId, title, message } = req.body;

    if (!userId || !title || !message) {
      res.status(400).json({ error: 'UserId, title, and message are required' });
      return;
    }

    const notification = new Notification({
      userId,
      type: 'user',
      title,
      message,
      read: false
    });

    await notification.save();

    const socketId = connectedUsers.get(userId);
    if (socketId) {
      io.to(socketId).emit('notification', {
        id: notification._id,
        userId: notification.userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        read: notification.read,
        createdAt: notification.createdAt
      });
    }

    res.status(201).json({ notification });
  } catch (error) {
    console.error('Send user notification error:', error);
    res.status(500).json({ error: 'Server error sending notification' });
  }
});

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    await connectDatabase();

    httpServer.listen(PORT,"0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
