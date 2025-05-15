import { Express } from 'express';
import { Database } from '../../../database';
import { authMiddleware } from '../../middleware/authMiddleware';
import { AuthenticatedRequest } from '../../types/auth.types';

type LikeType = 'Like' | 'Dislike';

export function registerLikeRoutes(app: Express, db: Database) {
  app.post('/post/:id/like', authMiddleware, async (req, res) => {
    const { type } = req.body; // 'Like' oder 'Dislike'
    const post_id = req.params.id;
    const user = (req as AuthenticatedRequest).user;

    try {
      const [existing] = await db.executeSQL(
        'SELECT * FROM likes WHERE user_id = ? AND post_id = ?',
        [user.id, post_id]
      );

      if (!existing) {
        await db.executeSQL(
          'INSERT INTO likes (user_id, post_id, type) VALUES (?, ?, ?)',
          [user.id, post_id, type]
        );
      } else {
        await db.executeSQL(
          'UPDATE likes SET type = ? WHERE user_id = ? AND post_id = ?',
          [type, user.id, post_id]
        );
      }

      res.status(200).json({ message: 'Like gespeichert/aktualisiert' });
    } catch (err) {
      console.error('Fehler beim Liken/Disliken:', err);
      res.status(500).json({ error: 'Fehler beim Liken/Disliken' });
    }
  });

  app.put('/post/:id/like', authMiddleware, async (
    req,
    res
  ) => {
    const { type } = req.body;
    const post_id = req.params.id;
    const user = (req as AuthenticatedRequest<{ id: string }, any, { type: LikeType }>).user;

    try {
      await db.executeSQL(
        'UPDATE likes SET type = ? WHERE user_id = ? AND post_id = ?',
        [type, user.id, post_id]
      );
      res.json({ message: 'Like updated' });
    } catch (err) {
      console.error('Fehler beim Ändern des Likes:', err);
      res.status(500).json({ error: 'Fehler beim Aktualisieren des Likes' });
    }
  });

  app.get('/post/:id/like', authMiddleware, async (req, res) => {
    const post_id = req.params.id;
    const user = (req as AuthenticatedRequest).user;

    try {
      const result = await db.executeSQL(
        'SELECT type FROM likes WHERE user_id = ? AND post_id = ?',
        [user.id, post_id]
      );

      if (result.length === 0) {
        res.json({ liked: false });
      } else {
        res.json({ liked: true, type: result[0].type });
      }
    } catch (err) {
      console.error('Fehler beim Abfragen des Likes:', err);
      res.status(500).json({ error: 'Fehler beim Abrufen des Like-Status' });
    }
  });

  app.get('/post/:id/like-counts', async (req, res) => {
    const post_id = req.params.id;

    try {
      const result = await db.executeSQL(
        `SELECT type, COUNT(*) as count FROM likes WHERE post_id = ? GROUP BY type`,
        [post_id]
      );

      const counts = {
        likes: 0,
        dislikes: 0
      };

      for (const row of result) {
        if (row.type === 'Like') counts.likes = row.count;
        if (row.type === 'Dislike') counts.dislikes = row.count;
      }

      res.json(counts);
    } catch (err) {
      console.error('Fehler beim Laden der Like-Counts:', err);
      res.status(500).json({ error: 'Fehler beim Zählen der Likes' });
    }
  });

  // Like oder Dislike löschen
  app.delete('/post/:id/like', authMiddleware, async (req, res) => {
    const post_id = req.params.id;
    const user = (req as AuthenticatedRequest).user;

    try {
      await db.executeSQL(
        'DELETE FROM likes WHERE user_id = ? AND post_id = ?',
        [user.id, post_id]
      );
      res.json({ message: 'Like entfernt' });
    } catch (err) {
      console.error('Fehler beim Entfernen des Likes:', err);
      res.status(500).json({ error: 'Fehler beim Entfernen des Likes' });
    }
  });


}
