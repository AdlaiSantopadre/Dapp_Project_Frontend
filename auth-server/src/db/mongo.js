// db/mongo.js
import { MongoClient } from 'mongodb';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = 'authServer';

const client = new MongoClient(MONGO_URI);
let db;

export async function connectToDb() {
  if (!db) {
    await client.connect();
    db = client.db(DB_NAME);
    console.log('[MongoDB] Connessione stabilita');
  }
  return db;
}

export async function getUsersCollection() {
  const db = await connectToDb();
  return db.collection('users');
}
