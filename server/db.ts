const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

let db: any = null;

async function getDb() {
    if (db) return db;

    const dbPath = path.join(__dirname, 'database.sqlite');

    db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    await db.exec(`
    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      type TEXT CHECK(type IN ('lost', 'found')) NOT NULL,
      category TEXT,
      date TEXT NOT NULL,
      locationName TEXT,
      locationLat REAL NOT NULL,
      locationLng REAL NOT NULL,
      imageUrl TEXT,
      userId TEXT NOT NULL,
      status TEXT DEFAULT 'active'
    )
  `);

    // Seed with sample lost items if empty
    const count = await db.get('SELECT COUNT(*) as count FROM items');
    if (count.count === 0) {
        console.log('Seeding sample data...');
        const samples = [
            {
                id: 'sample-1',
                title: 'MacBook Pro Charger',
                description: 'White USB-C charger, left in the library quiet zone.',
                type: 'lost',
                category: 'Electronics',
                date: new Date(Date.now() - 86400000).toISOString(),
                locationName: 'Main Library, 3rd Floor',
                locationLat: 37.7749,
                locationLng: -122.4194,
                imageUrl: 'https://picsum.photos/id/1/400/300',
                userId: 'system'
            },
            {
                id: 'sample-2',
                title: 'Car Keys',
                description: 'Bundle of keys with a red Toyota fob.',
                type: 'lost',
                category: 'Keys',
                date: new Date(Date.now() - 43200000).toISOString(),
                locationName: 'Student Union Cafeteria',
                locationLat: 37.7755,
                locationLng: -122.4185,
                imageUrl: 'https://picsum.photos/id/10/400/300',
                userId: 'system'
            },
            {
                id: 'sample-3',
                title: 'Black Leather Wallet',
                description: 'Contains student ID and some cash. Lost near the gym.',
                type: 'lost',
                category: 'Wallet/Purse',
                date: new Date(Date.now() - 172800000).toISOString(),
                locationName: 'Campus Gym Entrance',
                locationLat: 37.7760,
                locationLng: -122.4200,
                imageUrl: 'https://picsum.photos/id/20/400/300',
                userId: 'system'
            }
        ];

        for (const item of samples) {
            await db.run(
                `INSERT INTO items (id, title, description, type, category, date, locationName, locationLat, locationLng, imageUrl, userId) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [item.id, item.title, item.description, item.type, item.category, item.date, item.locationName, item.locationLat, item.locationLng, item.imageUrl, item.userId]
            );
        }
    }

    return db;
}

module.exports = { getDb };
