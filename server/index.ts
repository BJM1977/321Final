import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { prisma } from './database';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// 🧠 Teilnehmer-Tracking (socket.id → username)
const users = new Map<string, string>();

function broadcastUserList() {
  const allUsers = Array.from(users.values());
  io.emit('chat:users', allUsers);
}

io.on('connection', (socket) => {
  console.log(`🟢 Benutzer verbunden: ${socket.id}`);

  socket.on('join', async (username: string) => {
    users.set(socket.id, username);
    broadcastUserList();

    // Nachricht an andere Benutzer
    socket.broadcast.emit('chat:message', {
      username: 'System',
      text: `${username} ist dem Chat beigetreten.`,
      timestamp: new Date().toISOString(),
    });

    // Verlauf an neuen Benutzer senden
    const history = await prisma.message.findMany({
      orderBy: { createdAt: 'asc' },
      take: 50,
    });
    socket.emit('chat:history', history);
  });

  socket.on('chat:message', async ({ username, text }) => {
    const timestamp = new Date().toISOString();
    const msg = { username, text, timestamp };

    // Speichern in DB
    await prisma.message.create({
      data: {
        username,
        text,
      }
    });

    // Senden an alle
    io.emit('chat:message', msg);
  });

  socket.on('chat:typing', ({ username, typing }) => {
    io.emit('chat:typing', { username, typing });
  });

  socket.on('chat:rename', (newName: string) => {
    const oldName = users.get(socket.id);
    users.set(socket.id, newName);
    broadcastUserList();

    io.emit('chat:message', {
      username: 'System',
      text: `🔄 ${oldName} heißt jetzt ${newName}`,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on('disconnect', () => {
    const username = users.get(socket.id);
    users.delete(socket.id);
    broadcastUserList();

    if (username) {
      io.emit('chat:message', {
        username: 'System',
        text: `${username} hat den Chat verlassen.`,
        timestamp: new Date().toISOString(),
      });
    }
  });
});

// 🔧 Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// 📡 Start
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server läuft auf http://localhost:${PORT}`);
});
