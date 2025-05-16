import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '../../database';
import { validateLogin, validateRegister } from '../middleware/authMiddleware';

const router = express.Router();


// 📌 POST /auth/register
router.post('/register', validateRegister, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    res.status(201).json({ message: 'Benutzer erfolgreich registriert' });
  } catch (err) {
    res.status(500).json({ error: 'Fehler bei der Registrierung' });
  }
});

// 📌 POST /auth/login
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'defaultsecret',
      { expiresIn: '1h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });

    res.status(200).json({ message: 'Login erfolgreich' });
  } catch (err) {
    res.status(500).json({ error: 'Fehler beim Login' });
  }
});

// 📌 POST /auth/logout
router.post('/logout', (_req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logout erfolgreich' });
});

// ✅ Benannter Export für index.ts
export const authRouter = router;
