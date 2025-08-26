import { MongoClient } from 'mongodb';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017';
const DB_NAME = process.env.DB_NAME || 'documentiDb';

const client = new MongoClient(MONGO_URI);
let db;

export async function connectToDb() {
  if (!db) {
    await client.connect();
    db = client.db(DB_NAME);
    console.log(`[MongoDB] Connessione stabilita a ${DB_NAME}`);
    
  }
  return db;
}

export async function getDocumentiCollection() {
  const db = await connectToDb();
  return db.collection('archivio_documenti');
}

