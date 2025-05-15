import { Database } from './database'

// Instanz erstellen
const db = new Database()

async function seedDatabase() {
    console.log('🚀 Starte Datenbank-Seeding...');

    // Rollen-Tabelle prüfen & befüllen
    const roles: any = await db.executeSQL('SELECT COUNT(*) AS count FROM roles');
    if (roles[0].count === 0) {
        console.log('➕ Rollen einfügen...');
        await db.executeSQL(
            `INSERT INTO roles (role) VALUES (?), (?), (?)`,
            ['User', 'Moderator', 'Admin']
        );
    } else {
        console.log('✅ Rollen existieren bereits.');
    }

    // Benutzer-Tabelle prüfen & befüllen
    const users: any = await db.executeSQL('SELECT COUNT(*) AS count FROM users');
    if (users[0].count === 0) {
        console.log('➕ Standardbenutzer einfügen...');
        await db.executeSQL(
            `INSERT INTO users (username, password, role) VALUES 
        (?, ?, ?), 
        (?, ?, ?), 
        (?, ?, ?)`,
            [
                'minitwitter', 'supersecret123', 'Admin',
                'Björn', 'Admin123', 'User',
                'Tony', 'Admin123', 'User'
            ]
        );
    } else {
        console.log('✅ Benutzer existieren bereits.');
    }

    console.log('🌱 Seeding abgeschlossen.');
}

seedDatabase().then(() => process.exit());
