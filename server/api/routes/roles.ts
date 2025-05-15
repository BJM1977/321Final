import { Express, Request, RequestHandler, Response } from 'express'
import { Database } from '../../database';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRoles } from '../middleware/roleMiddleware';
import { RoleType, RoleUpdateBody } from '../types/role.types'


export function registerRoleRoutes(app: Express, db: Database) {

  // Alle Rollen abrufen
  app.get('/role', authMiddleware, requireRoles(['Admin']), async (_req: Request, res: Response) => {
    const result = await db.executeSQL('SELECT * FROM roles');
    res.json(result);
  });

  // Einzelne Rolle abrufen
  app.get('/role/:id', authMiddleware, requireRoles(['Admin']), async (req: Request<{ id: string }>, res: Response) => {
    const result = await db.executeSQL('SELECT * FROM roles WHERE id = ?', [req.params.id]);
    res.json(result[0]);
  });

  // Rolle aktualisieren
  app.put(
    '/role/:id',
    authMiddleware,
    requireRoles(['Admin']),
    // Typisierte Middleware
    (async function handler(req, res) {
      const { role } = req.body

      const validRoles: RoleType[] = ['User', 'Moderator', 'Admin']
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: 'Ungültiger Rollenwert' })
      }

      await db.executeSQL('UPDATE roles SET role = ? WHERE id = ?', [role, req.params.id])
      res.json({ message: 'Role updated' })
    }) as RequestHandler<{ id: string }, any, RoleUpdateBody>
  )


  // Rolle löschen
  app.delete('/role/:id', authMiddleware, requireRoles(['Admin']), async (req: Request<{
    id: string
  }>, res: Response) => {
    await db.executeSQL('DELETE FROM roles WHERE id = ?', [req.params.id]);
    res.json({ message: 'Role deleted' });
  });
}
