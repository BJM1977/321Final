import express, { Express } from 'express'
import { API } from './api'
import http from 'http'
import { Database } from './database'
import cors from 'cors'

class Backend {
  // Properties
  private _app: Express
  private _api: API
  private _database: Database
  private _env: string

  // Getters
  public get app(): Express {
    return this._app
  }

  public get api(): API {
    return this._api
  }

  public get database(): Database {
    return this._database
  }

  // Constructor
  constructor() {
    this._app = express()
    this._app.use(express.json())
    this._app.use(cors({
      origin: 'http://localhost:4200',
      credentials: true
    }));
    this._database = new Database()
    this._api = new API(this._app)
    this._env = process.env.NODE_ENV || 'development'

    this.startServer()
  }

  // Methods
  private startServer(): void {
    if (this._env === 'production') {
      http.createServer(this._app).listen(3000, '0.0.0.0', () => {
        console.log('Server is listening on 0.0.0.0:3000')
      })
    }
  }
}

const backend = new Backend()
export const viteNodeApp = backend.app
