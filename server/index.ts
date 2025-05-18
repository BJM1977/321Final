import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { config } from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { API } from './api';
import { prisma } from './database';




config(); // .env laden

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:4200',
    credentials: true,
  },
});

// Middlewares
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());


// API initialisieren
new API(app);

// Socket.IO Logik
io.on('connection', (socket) => {
  console.log('🟢 Benutzer verbunden:', socket.id);

  socket.on('join', (username: string) => {
    console.log(`${username} ist dem Chat beigetreten`);
  });

  // 👉 Neuer GET-Endpunkt: Gibt alle bisherigen Chat-Nachrichten zurück
  app.get('/messages', async (req, res) => {
    try {
      const messages = await prisma.message.findMany({
        orderBy: { createdAt: 'asc' },
        include: { user: true },
      });

      const formatted = messages.map(m => ({
        id: m.id,
        text: m.text,
        username: m.user.username,
        createdAt: m.createdAt
      }));

      res.json(formatted);
    } catch (err) {
      console.error('Fehler beim Abrufen der Nachrichten:', err);
      res.status(500).json({ error: 'Fehler beim Laden der Nachrichten' });
    }
  });

  socket.on('chat:message', async ({ username, text }) => {
    const timestamp = new Date().toISOString();
    const msg = { username, text, timestamp };

    try {
      // Benutzer finden
      const user = await prisma.user.findUnique({
        where: { username },
      });

      if (!user) {
        console.warn(`⚠️ Benutzer ${username} nicht gefunden`);
        return;
      }

      // Nachricht in DB speichern
      await prisma.message.create({
        data: {
          text,
          user: { connect: { id: user.id } }
        },
      });

      // Nachricht an alle senden
      io.emit('chat:message', msg);
    } catch (err) {
      console.error('❌ Fehler beim Speichern der Nachricht:', err);
    }
  });

  socket.on('chat:typing', ({ username, typing }) => {
    socket.broadcast.emit('chat:typing', { username, typing });
  });

  socket.on('disconnect', () => {
    console.log('🔴 Benutzer getrennt:', socket.id);
  });
});

// Server starten
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server läuft auf http://localhost:${PORT}`);
});
