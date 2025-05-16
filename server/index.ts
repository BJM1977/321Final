import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { Server } from 'socket.io';
import http from 'http';
import { userRouter } from './api/routes/users';
import { authRouter } from './api/routes/auth';
import { roleRouter } from './api/routes/roles';

dotenv.config();

const app = express();
const server = http.createServer(app);

// WebSocket-Server (socket.io)
const io = new Server(server, {
  cors: {
    origin: '*', // ggf. auf dein Frontend beschränken
    methods: ['GET', 'POST'],
  },
});

interface ChatMessage {
  username: string;
  text: string;
  timestamp: string;
}

interface UserStatus {
  username: string;
  typing: boolean;
}

let chatHistory: ChatMessage[] = [];

io.on('connection', (socket) => {
  console.log('🟢 WebSocket verbunden:', socket.id);

  socket.on('join', (username: string) => {
    console.log(`👋 ${username} ist dem Chat beigetreten.`);
    socket.broadcast.emit('chat:message', {
      username: 'System',
      text: `${username} ist dem Chat beigetreten.`,
      timestamp: new Date().toISOString(),
    });

    // Nur an neuen Client senden
    socket.emit('chat:history', chatHistory);
  });

  socket.on('chat:message', (msg: { username: string; text: string }) => {
    const message: ChatMessage = {
      ...msg,
      timestamp: new Date().toISOString(),
    };
    chatHistory.push(message);
    io.emit('chat:message', message);
  });

  socket.on('chat:typing', (status: UserStatus) => {
    io.emit('chat:typing', status);
  });

  socket.on('disconnect', () => {
    console.log('🔌 WebSocket getrennt:', socket.id);
  });
});

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Routen
app.use('/users', userRouter);
app.use('/auth', authRouter);
app.use('/roles', roleRouter);

// Start
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server läuft auf http://localhost:${PORT}`);
});
