import { Express, Request, Response } from 'express'
import { Database } from '../../database'
import jwt, { JwtPayload, Secret } from 'jsonwebtoken'
import bcrypt from 'bcrypt';
import { AuthenticatedRequest, AuthRequestBody } from '../types/auth.types'
import { authMiddleware } from '../middleware/authMiddleware'

const JWT_SECRET: Secret = 'meinSuperSecret';

export function registerAuthRoutes(app: Express, db: Database) {

  // Registrierung
  app.post('/auth/register', async (req: Request<{}, {}, AuthRequestBody>, res: Response) => {
    const { username, password } = req.body;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const result: any = await db.executeSQL(
        'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
        [username, hashedPassword, 'User']
      );

      res.status(201).json({ id: result.insertId });
    } catch (err) {
      console.error('Fehler bei Registrierung:', err);
      res.status(500).json({ error: 'Fehler beim Anlegen des Benutzers' });
    }
  });

  // Login und Token per Cookie zurueckgeben
  app.post('/auth/login', async (req: Request<{}, {}, AuthRequestBody, any>, res: Response): Promise<void> => {
    const { username, password } = req.body;

    try {
      const result: any = await db.executeSQL(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );

      const user: any = result[0];

      if (!user) {
        res.status(401).json({ error: 'Benutzername oder Passwort ungültig' });
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(401).json({ error: 'Benutzername oder Passwort ungültig' });
        return;
      }

      const payload: JwtPayload = {
        id: user.id,
        username: user.username,
        role: user.role
      };

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

      // Token als Cookie setzen:
      res.cookie('auth_token', token, {
        httpOnly: true,    // kein Zugriff durch JS im Browser XSS-Schutz
        secure: process.env.NODE_ENV === 'production', // nur über HTTPS in Produktion
        sameSite: 'lax',   // CSRF-Schutz
        maxAge: 3600000    // Cookie läuft nach 1 Stunde ab
      });

      res.json({ message: 'Login erfolgreich!' });
    } catch (err) {
      console.error('Login-Fehler:', err);
      res.status(500).json({ error: 'Fehler beim Login' });
    }
  });

  app.get('/auth/me', authMiddleware, (req, res) => {
    const user = (req as AuthenticatedRequest).user;
    res.json(user);
  });


  app.post('/auth/logout', (req: Request, res: Response) => {
    res.clearCookie('auth_token');
    res.json({ message: 'Logout erfolgreich' });
  });


}