import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import { Database } from '../database/database';
import { userRouter } from './routes/users';
import { messageRouter } from './routes/messages'
import { authRouter } from './routes/auth'

export class API {
  app: Express;
  db: Database;

  constructor(app: Express) {
    this.app = app;
    this.db = new Database();

    // Middlewares
    this.app.use(cookieParser());
    this.app.use(express.json());

    // 📌 Auth-Router richtig registrieren
    this.app.use('/auth', authRouter);
    app.use('/users', userRouter);
    this.app.use('/messages', messageRouter);


    // Fallback für nicht definierte Routen
    this.app.use((req, res) => {
      res.status(404).json({ error: 'Route nicht gefunden' });
    });
  }
}

export * from './api.ts';

