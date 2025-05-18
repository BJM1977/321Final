import express, { Express } from 'express'
import cookieParser from 'cookie-parser';
import { Database } from '../database/database';


export class API {
  app: Express;
  db: Database;

  constructor(app: Express) {
    this.app = app;
    this.db = new Database();
    this.app.use(cookieParser());
    this.app.use(express.json());


    // Fallback
    this.app.use((req, res) => {
      res.status(404).json({ error: 'Route nicht gefunden' });
    });
  }
}
