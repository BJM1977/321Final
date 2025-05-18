import express from 'express';
import { prisma } from '../../database';
import { requireAuth } from '../middleware/authMiddleware';
import { Database } from '../../database/database';


const router = express.Router();

// Hilfsfunktion für Admin-Check
function isAdmin(req: any): boolean {
  return req.user?.role === 'Admin';
}

// 📌 GET /users/me – eigener Benutzer
router.get('/me', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, email: true, role: true },
    });

    if (!user) return res.status(404).json({ error: 'Benutzer nicht gefunden' });

    res.status(200).json(user);
  } catch {
    res.status(500).json({ error: 'Fehler beim Abrufen des Benutzers' });
  }
});

// 📌 PUT /users/me – eigenes Profil aktualisieren
router.put('/me', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { username, email } = req.body;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { username, email },
      select: { id: true, username: true, email: true, role: true },
    });

    res.status(200).json(updated);
  } catch {
    res.status(500).json({ error: 'Fehler beim Aktualisieren' });
  }
});

// 📌 GET /users – nur für Admins
router.get('/', requireAuth, async (req, res) => {
  if (!isAdmin(req)) {
    return res.status(403).json({ error: 'Nur Admins erlaubt' });
  }

  const users = await prisma.user.findMany({
    select: { id: true, username: true, email: true, role: true },
  });

  res.status(200).json(users);
});

// 📌 DELETE /users/:id – nur Admins
router.delete('/:id', requireAuth, async (req, res) => {
  if (!isAdmin(req)) {
    return res.status(403).json({ error: 'Nur Admins erlaubt' });
  }

  const { id } = req.params;

  try {
    await prisma.user.delete({ where: { id } });
    res.status(200).json({ message: 'Benutzer gelöscht' });
  } catch {
    res.status(500).json({ error: 'Fehler beim Löschen' });
  }
});

// ✅ Export für index.ts
export const userRouter = router;
export function registerUserRoutes(app: Express, db: Database): void {
  app.get('/users', async (req, res) => {
    const users = await db.executeSQL('SELECT * FROM users');
    res.json(users);
  });
}