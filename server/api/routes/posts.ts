import { Express } from 'express'
import { Database } from '../../database';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRoles } from '../middleware/roleMiddleware';
import { authenticatedHandler } from '../types/route.helpers'
import { DeletePostRequest } from '../types/auth.types'


export function registerPostRoutes(app: Express, db: Database) {
  app.post(
    '/post',
    authMiddleware,
    authenticatedHandler<{}, any, { content: string }>(async (req, res) => {
      const { content } = req.body;
      const user = req.user;

      if (!content || !content.trim()) {
        return res.status(400).json({ error: 'Inhalt darf nicht leer sein' });
      }

      try {
        const result = await db.executeSQL(
          'INSERT INTO tweets (content, user_id) VALUES (?, ?)',
          [content, user.id]
        );

        res.status(201).json({
          id: result.insertId,
          content,
          username: user.username
        });
      } catch (err) {
        console.error('Fehler beim Erstellen des Tweets:', err);
        res.status(500).json({ error: 'Fehler beim Erstellen des Tweets' });
      }
    })
  );


  app.get('/post', async (_req, res) => {
    try {
      const result = await db.executeSQL(`
      SELECT tweets.id, tweets.content, tweets.created_at, users.username
      FROM tweets
      JOIN users ON tweets.user_id = users.id
      ORDER BY tweets.created_at DESC
    `);
      res.json(result);
    } catch (err) {
      console.error('Fehler beim Laden der Posts:', err);
      res.status(500).json({ error: 'Fehler beim Laden der Posts' });
    }
  });


  app.delete(
    '/post/:id',
    authMiddleware,
    authenticatedHandler<{ id: string }>(async (req, res) => {
      const postId = Number(req.params.id);
      const user = req.user;

      if (isNaN(postId)) {
        return res.status(400).json({ error: 'Ungültige Post-ID' });
      }

      try {
        // Post-Owner ermitteln
        const post: any[] = await db.executeSQL('SELECT user_id FROM tweets WHERE id = ?', [postId]);
        if (post.length === 0) {
          return res.status(404).json({ error: 'Post nicht gefunden' });
        }

        const isOwner = post[0].user_id === user.id;
        const isModOrAdmin = user.role === 'Admin' || user.role === 'Moderator';

        if (!isOwner && !isModOrAdmin) {
          return res.status(403).json({ error: 'Keine Berechtigung zum Löschen' });
        }

        await db.executeSQL('DELETE FROM tweets WHERE id = ?', [postId]);
        res.json({ message: 'Post gelöscht' });

      } catch (err) {
        console.error('Fehler beim Löschen des Posts:', err);
        res.status(500).json({ error: 'Fehler beim Löschen des Posts' });
      }
    })
  );

}
