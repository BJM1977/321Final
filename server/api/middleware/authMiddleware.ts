import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, AuthenticatedUser } from '../types/auth.types';
import { Database } from '../../database';

const JWT_SECRET = process.env.JWT_SECRET || 'meinSuperSecret';
const db = new Database();

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = req.cookies?.auth_token;

  if (!token) {
    res.status(401).json({ error: 'Kein Token gefunden' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };

    const [user] = await db.executeSQL<AuthenticatedUser[]>(
      'SELECT id, username, role, active FROM users WHERE id = ?',
      [decoded.id]
    );

    if (!user) {
      res.status(401).json({ error: 'Benutzer nicht gefunden' });
      return;
    }

    if (!user.active) {
      res.status(403).json({ error: 'Benutzerkonto gesperrt' });
      return;
    }

    (req as AuthenticatedRequest).user = {
      id: user.id,
      username: user.username,
      role: user.role,
      active: user.active
    };

    next();
  } catch (err) {
    console.error('JWT Fehler:', err);
    res.status(403).json({ error: 'Token ungültig oder abgelaufen' });
  }
}
