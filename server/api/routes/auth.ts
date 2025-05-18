import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '../../database';
import { validateLogin, validateRegister } from '../middleware/authMiddleware';
import { requireAuth } from '../middleware/authMiddleware';

const router = express.Router();

// 📌 POST /auth/register
router.post('/register', validateRegister, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Benutzername oder E-Mail ist bereits vergeben' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: { connect: { id: 1 } },
        active: true,
      },
    });

    res.status(201).json({ message: 'Benutzer erfolgreich registriert' });
  } catch (err) {
    console.error('Fehler bei der Registrierung:', err);
    res.status(500).json({ error: 'Fehler bei der Registrierung' });
  }
});

// 📌 POST /auth/login
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) {
      return res.status(401).json({ error: 'Ungültige Anmeldedaten (Benutzername)' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Ungültige Anmeldedaten (Passwort)' });
    }

    if (!user.active) {
      return res.status(401).json({ error: 'Benutzer ist nicht aktiv' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.roleId },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });

    res.status(200).json({ message: 'Login erfolgreich' });
  } catch (err) {
    console.error('Fehler beim Login:', err);
    res.status(500).json({ error: 'Fehler beim Login' });
  }
});

// 📌 GET /auth/me
router.get('/me', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        roleId: true,
        active: true,
      },
    });

    if (!user) return res.status(404).json({ error: 'Benutzer nicht gefunden' });

    res.json(user);
  } catch (err) {
    console.error('Fehler bei /auth/me:', err);
    res.status(401).json({ error: 'Ungültiger oder abgelaufener Token' });
  }
});

// 📌 POST /auth/logout
router.post('/logout', (_req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logout erfolgreich' });
});

export const authRouter = router;
