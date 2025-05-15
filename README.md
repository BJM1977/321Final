# A simple typescript starter project

Ein einfaches Fullstack-Projekt mit:

- TypeScript (Backend)
- Angular (Frontend)
- MariaDB (Datenbank)
- Docker für alle Services

---

## Getting Started

```bash
# Alle Services starten (Datenbank, Backend, Frontend)
docker compose up --build


#Lokale Entwicklung (ohne Docker)

# Start docker compose für database
docker compose up -d mariadb

#Backend starten
npm install
npm run dev

# frontend starten
cd client
npm install
npm start

```
