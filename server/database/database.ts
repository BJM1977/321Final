import mysql from 'mysql2/promise'
import { USER_TABLE,  ROLE_TABLE } from './schema'
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
export class Database {
  private _pool: mysql.Pool
  private _initialized = false;

  constructor() {
    this._pool = mysql.createPool({
      database: process.env.DB_NAME || 'minitwitter',
      host: process.env.DB_HOST || 'mariadb',
      user: process.env.DB_USER || 'minitwitter',
      password: process.env.DB_PASSWORD || 'supersecret123',
      connectionLimit: 5,
    });

    this.connectWithRetry().then(() => this.initializeDBSchema());
  }

  private async connectWithRetry(retries = 5, delay = 3000): Promise<void> {
    while (retries > 0) {
      try {
        const conn = await this._pool.getConnection();
        await conn.ping();
        conn.release();
        console.log('Verbindung zur Datenbank erfolgreich');
        return;
      } catch (err) {
        retries--;
        console.warn(`Verbindung zur DB fehlgeschlagen. Neue Verbindung in ${delay / 1000}s... (${retries} Versuche übrig)`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error('Konnte keine Verbindung zur Datenbank herstellen.');
  }

  private initializeDBSchema = async () => {
    if (this._initialized) return;
    this._initialized = true;

    // Tabellen erzeugen
    await this.executeSQL(USER_TABLE);
    await this.executeSQL(ROLE_TABLE);

    // Rollen prüfen
    const roles: any = await this.executeSQL('SELECT COUNT(*) AS count FROM roles');
    if (roles[0].count === 0) {
      console.log('Erstelle Standardrollen...');
      await this.executeSQL(
        `INSERT INTO roles (role)
         VALUES (?),
                (?),
                (?)`,
        ['User', 'Moderator', 'Admin']
      );
    }

    // Demo-User einfügen
    const result: any = await this.executeSQL('SELECT COUNT(*) AS count FROM users');
    if (result[0].count === 0) {
      console.log('Erstelle Demo-Nutzer...');

      const password1 = await bcrypt.hash('supersecret123', 10);
      const password2 = await bcrypt.hash('Admin123', 10);
      const password3 = await bcrypt.hash('Admin123', 10);

      await this.executeSQL(
        `INSERT
        IGNORE INTO users (username, password, role, active)
         VALUES (?, ?, ?, true), (?, ?, ?, true), (?, ?, ?, true)`,
        ['minitwitter', password1, 'Admin', 'Björn', password2, 'User', 'Tony', password3, 'User']
      );
    }
  };

  public executeSQL = async <T = any>(query: string, params: any[] = []): Promise<T> => {
    try {
      const conn = await this._pool.getConnection();
      try {
        const [results] = await conn.query(query, params);
        return results as T;
      } finally {
        conn.release();
      }
    } catch (err) {
      console.error('Fehler beim Ausführen der SQL-Abfrage:', err);
      throw err;
    }
  }

}
