import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '../../database';
import { validateLogin, validateRegister } from '../middleware/authMiddleware';
import {Database} from "../../database/database";

const router = express.Router();

// 📌 POST /auth/register
router.post('/register', validateRegister, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 👀 Prüfen, ob Benutzername oder E-Mail schon existieren
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email },
        ],
      },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Benutzername oder E-Mail ist bereits vergeben' });
    }

    // 🔐 Passwort hashen
    const hashedPassword = await bcrypt.hash(password, 10);

    // 📝 Benutzer erstellen (mit Standardrolle ID 1)
    await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: { connect: { id: 1 } },
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

    // 🔍 Nutzer anhand des Benutzernamens finden
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(401).json({ error: 'Ungültige Anmeldedaten (Benutzername)' });
    }

    // 🔐 Passwort prüfen
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Ungültige Anmeldedaten (Passwort)' });
    }

    // 🪪 Token erstellen
    const token = jwt.sign(
        { userId: user.id, role: user.roleId },
        process.env.JWT_SECRET!,
        { expiresIn: '1h' }
    );

    // 🍪 Token als HttpOnly-Cookie setzen
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


// 📌 POST /auth/logout
router.post('/logout', (_req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logout erfolgreich' });
});

export const authRouter = router;
export function registerAuthRoutes(app: express.Express, db: Database): void {
  app.use('/auth', router);
}
