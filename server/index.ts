import { Request, Response } from 'express';
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { getDb } = require('./db');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

app.get('/api/items', async (req: Request, res: Response) => {
    try {
        const db = await getDb();
        const items = await db.all('SELECT * FROM items ORDER BY date DESC');

        // Map database fields to frontend model
        const mappedItems = items.map((item: any) => ({
            ...item,
            location: { lat: item.locationLat, lng: item.locationLng }
        }));

        res.json(mappedItems);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch items' });
    }
});

app.post('/api/items', async (req: Request, res: Response) => {
    try {
        const db = await getDb();
        const item = req.body;
        const id = uuidv4();

        await db.run(
            `INSERT INTO items (id, title, description, type, category, date, locationName, locationLat, locationLng, imageUrl, userId) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id,
                item.title,
                item.description,
                item.type,
                item.category,
                item.date,
                item.locationName,
                item.location.lat,
                item.location.lng,
                item.imageUrl,
                item.userId
            ]
        );

        res.status(201).json({ ...item, id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create item' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
