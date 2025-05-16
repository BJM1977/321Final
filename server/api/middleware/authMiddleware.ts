import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

/**
 * Validiert Registrierungsdaten
 */
export const validateRegister = (req: Request, res: Response, next: NextFunction): void => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    res.status(400).json({ error: 'Alle Felder sind erforderlich' });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ error: 'Passwort muss mindestens 6 Zeichen lang sein' });
    return;
  }

  next();
};

/**
 * Validiert Login-Daten
 */
export const validateLogin = (req: Request, res: Response, next: NextFunction): void => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'E-Mail und Passwort erforderlich' });
    return;
  }

  next();
};

/**
 * Middleware zum Schutz von Routen mit JWT-Token
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.cookies?.token;

  if (!token) {
    res.status(401).json({ error: 'Nicht autorisiert – kein Token gefunden' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'defaultsecret');
    (req as any).user = decoded;
    next(); // ✅ Token korrekt → weiter
  } catch {
    res.status(403).json({ error: 'Token ungültig oder abgelaufen' });
  }
};
