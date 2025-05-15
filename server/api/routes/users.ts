import { Express } from 'express';
import { Database } from '../../database';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRoles } from '../middleware/roleMiddleware';
import { UserInput } from '../types/user.types';
import { authenticatedHandler } from '../types/route.helpers';
import bcrypt from 'bcrypt'

type UserParams = { id: string };

export function registerUserRoutes(app: Express, db: Database) {
  // Alle Benutzer abrufen nur für Admins
  app.get(
    '/users',
    authMiddleware,
    requireRoles(['Admin']),
    authenticatedHandler(async (_req, res) => {
      const users = await db.executeSQL('SELECT id, username, role, active FROM users');
      res.json(users);
    })
  );


  // Einzelnen Benutzer abrufen
  app.get(
    '/users/:id',
    authMiddleware,
    requireRoles(['Admin']),
    authenticatedHandler<UserParams>(async (req, res) => {
      const result = await db.executeSQL(
        'SELECT id, username, role, active FROM users WHERE id = ?',
        [req.params.id]
      );
      res.json(result[0]);
    })
  );


  app.post(
    '/users',
    authMiddleware,
    requireRoles(['Admin']),
    authenticatedHandler<{}, {}, UserInput & { active?: boolean }>(async (req, res) => {
      const { username, password, role, active } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Username und Passwort sind erforderlich' });
      }

      const userRole: 'User' | 'Moderator' | 'Admin' =
        role === 'User' || role === 'Moderator' || role === 'Admin' ? role : 'User';

      const hashed = await bcrypt.hash(password, 10);

      const result = await db.executeSQL(
        'INSERT INTO users (username, password, role, active) VALUES (?, ?, ?, ?)',
        [username, hashed, userRole, active ?? true]
      );

      res.status(201).json({ id: result.insertId });
    })
  );


  // Benutzer aktualisieren Name, Passwort, Rolle
  app.put(
    '/users/:id',
    authMiddleware,
    requireRoles(['Admin']),
    authenticatedHandler<UserParams, {}, UserInput & { active?: boolean }>(async (req, res) => {
      const { username, password, role, active } = req.body;

      if (!username) {
        return res.status(400).json({ error: 'Username darf nicht leer sein' });
      }

      const userRole: 'User' | 'Moderator' | 'Admin' =
        role === 'User' || role === 'Moderator' || role === 'Admin' ? role : 'User';

      if (password) {
        const hashed = await bcrypt.hash(password, 10);
        await db.executeSQL(
          'UPDATE users SET username = ?, password = ?, role = ?, active = ? WHERE id = ?',
          [username, hashed, userRole, active ?? true, req.params.id]
        );
      } else {
        await db.executeSQL(
          'UPDATE users SET username = ?, role = ?, active = ? WHERE id = ?',
          [username, userRole, active ?? true, req.params.id]
        );
      }

      res.json({ message: 'Benutzer aktualisiert' });
    })
  );


  // Benutzer löschen
  app.delete(
    '/users/:id',
    authMiddleware,
    requireRoles(['Admin']),
    authenticatedHandler<UserParams>(async (req, res) => {
      await db.executeSQL('DELETE FROM users WHERE id = ?', [req.params.id]);
      res.json({ message: 'Benutzer gelöscht' });
    })
  );

  // Passwort für eingeloggten Benutzer ändern
  app.put(
    '/auth/profile',
    authMiddleware,
    authenticatedHandler<{}, {}, { password: string }>(async (req, res) => {
      const { password } = req.body;
      const user = req.user;

      if (!password) {
        return res.status(400).json({ error: 'Kein Passwort angegeben' });
      }

      const hashed = await bcrypt.hash(password, 10);
      await db.executeSQL('UPDATE users SET password = ? WHERE id = ?', [hashed, user.id]);

      res.json({ message: 'Passwort aktualisiert' });
    })
  );

}
