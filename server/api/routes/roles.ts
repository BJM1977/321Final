import express from 'express';
import { Database } from '../../database/database';

const router = express.Router();

// 📌 GET /roles
// Gibt alle verfügbaren Rollen als Liste zurück
router.get('/', (_req, res) => {
  const roles = ['User', 'Admin', 'Moderator'];
  res.status(200).json(roles);
});

// 📌 (Optional) GET /roles/:name → Validierung einzelner Rolle
router.get('/:name', (req, res) => {
  const roles = ['User', 'Admin', 'Moderator'];
  const { name } = req.params;

  if (roles.includes(name)) {
    res.status(200).json({ valid: true, role: name });
  } else {
    res.status(404).json({ valid: false, error: 'Rolle nicht gefunden' });
  }
});

// ✅ Benannter Export für index.ts
export const roleRouter = router;
export function registerRoleRoutes(app: Express, db: Database): void {
  app.get('/roles', async (req, res) => {
    const roles = await db.executeSQL('SELECT * FROM roles');
    res.json(roles);
  });
}