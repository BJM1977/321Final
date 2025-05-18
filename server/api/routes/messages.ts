// server/api/routes/messages.ts
import express from 'express';
import { prisma } from '../../database'


const router = express.Router();

// 📌 GET /messages – Alle Nachrichten abrufen
router.get('/', async (_req, res) => {
  try {
    const messages = await prisma.message.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    res.status(200).json(messages);
  } catch (err) {
    console.error('Fehler beim Abrufen der Nachrichten:', err);
    res.status(500).json({ error: 'Fehler beim Abrufen der Nachrichten' });
  }
});

export const messageRouter = router;
