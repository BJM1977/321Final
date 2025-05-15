import express, { Express } from 'express'
import { Database } from '../database'
import { registerUserRoutes } from './routes/users'
import { registerPostRoutes } from './routes/posts'
import { registerCommentRoutes } from './routes/comments'
import { registerLikeRoutes } from './routes/likes'
import { registerRoleRoutes } from './routes/roles'
import { registerAuthRoutes } from './routes/auth'
import cookieParser from 'cookie-parser';

export class API {
  // Properties
  db: Database
  app: Express

  // Constructor
  constructor(app: Express) {
    this.app = app
    this.db = new Database()

    //middleware
    this.app.use(cookieParser());
    this.app.use(express.json());


    registerUserRoutes(app, this.db)
    registerPostRoutes(app, this.db)
    registerCommentRoutes(app, this.db)
    registerLikeRoutes(app, this.db)
    registerRoleRoutes(app, this.db)
    registerAuthRoutes(app, this.db)

    // Fallback
    this.app.use((req, res) => {
      res.status(404).json({ error: 'Route nicht gefunden' });
    });
  }
}
