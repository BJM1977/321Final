import { RequestHandler } from 'express'
import { AuthenticatedRequest } from '../types/auth.types';

export function requireRoles(allowedRoles: string[]): RequestHandler {
  return (req, res, next) => {
    const user = (req as AuthenticatedRequest).user;

    if (!user || !allowedRoles.includes(user.role)) {
      res.status(403).json({ error: 'Zugriff verweigert' });
      return;
    }

    next();
  };
}