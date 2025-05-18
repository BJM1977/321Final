import express from 'express';
import { prisma } from '../../database';
import { requireAuth } from '../middleware/authMiddleware';

const router = express.Router();

// 🔐 Admin-Prüfung
function isAdmin(req: any): boolean {
  return req.user?.role === 'Admin';
}

// 📌 PUT /users/me – Profil aktualisieren (nur für eingeloggte Nutzer)
router.put('/me', requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { username, email } = req.body;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { username, email },
      select: { id: true, username: true, email: true, roleId: true },
    });

    res.status(200).json(updated);
  } catch (err) {
    console.error('Fehler beim Profil-Update:', err);
    res.status(500).json({ error: 'Fehler beim Aktualisieren' });
  }
});

// 📌 GET /users – Alle Benutzer anzeigen (nur Admins)
router.get('/', requireAuth, async (req, res) => {
  if (!isAdmin(req)) {
    return res.status(403).json({ error: 'Nur Admins erlaubt' });
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        roleId: true,
        active: true,
      },
    });

    res.status(200).json(users);
  } catch (err) {
    console.error('Fehler beim Laden der Benutzer:', err);
    res.status(500).json({ error: 'Fehler beim Laden der Benutzer' });
  }
});

// 📌 DELETE /users/:id – Benutzer löschen (nur Admins)
router.delete('/:id', requireAuth, async (req, res) => {
  if (!isAdmin(req)) {
    return res.status(403).json({ error: 'Nur Admins erlaubt' });
  }

  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id: Number(id) } });
    res.status(200).json({ message: 'Benutzer gelöscht' });
  } catch (err) {
    console.error('Fehler beim Löschen:', err);
    res.status(500).json({ error: 'Fehler beim Löschen' });
  }
});

export const userRouter = router;
