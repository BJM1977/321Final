import { Express } from 'express'
import { Database } from '../../database'
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRoles } from '../middleware/roleMiddleware';
import { Request, Response } from 'express';
import { authenticatedHandler } from '../types/route.helpers'
import { CreateCommentRequest } from '../types/auth.types'

export function registerCommentRoutes(app: Express, db: Database) {

  app.post(
    '/comment',
    authMiddleware,
    authenticatedHandler(async (req: CreateCommentRequest, res) => {
      const { content, post_id } = req.body;
      const user = req.user;

      if (!content || !post_id) {
        return res.status(400).json({ error: 'Inhalt und Post-ID erforderlich' });
      }

      try {
        const result = await db.executeSQL(
          'INSERT INTO comments (content, user_id, post_id) VALUES (?, ?, ?)',
          [content, user.id, post_id]
        );

        res.status(201).json({ id: result.insertId });
      } catch (err) {
        console.error('Fehler beim Erstellen des Kommentars:', err);
        res.status(500).json({ error: 'Fehler beim Erstellen des Kommentars' });
      }
    })
  );

  app.delete(
    '/comment/:id',
    authMiddleware,
    authenticatedHandler<{ id: string }>(async (req, res) => {
      const commentId = Number(req.params.id);
      const user = req.user;

      if (isNaN(commentId)) {
        return res.status(400).json({ error: 'Ungültige Kommentar-ID' });
      }

      try {
        const comment: any[] = await db.executeSQL(
          'SELECT user_id FROM comments WHERE id = ?',
          [commentId]
        );

        if (comment.length === 0) {
          return res.status(404).json({ error: 'Kommentar nicht gefunden' });
        }

        const isOwner = comment[0].user_id === user.id;
        const isModOrAdmin = user.role === 'Admin' || user.role === 'Moderator';

        if (!isOwner && !isModOrAdmin) {
          return res.status(403).json({ error: 'Keine Berechtigung zum Löschen' });
        }

        await db.executeSQL('DELETE FROM comments WHERE id = ?', [commentId]);
        res.json({ message: 'Kommentar gelöscht' });
      } catch (err) {
        console.error('Fehler beim Löschen des Kommentars:', err);
        res.status(500).json({ error: 'Fehler beim Löschen des Kommentars' });
      }
    })
  );


  app.get('/post/:id/comments', async (req: Request<{ id: string }>, res: Response) => {
    const postId = req.params.id;

    try {
      const result = await db.executeSQL(
        `SELECT comments.id, comments.content, comments.created_at, users.username
       FROM comments
       JOIN users ON comments.user_id = users.id
       WHERE comments.post_id = ?
       ORDER BY comments.created_at ASC`,
        [postId]
      );

      res.json(result);
    } catch (err) {
      console.error('Fehler beim Laden der Kommentare:', err);
      res.status(500).json({ error: 'Fehler beim Laden der Kommentare' });
    }
  });

}
