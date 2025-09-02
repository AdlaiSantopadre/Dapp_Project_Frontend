// test-mongo-auth.mjs
import 'dotenv/config';             // carica le variabili da .env
import { MongoClient } from 'mongodb';

async function main() {
  const uri = process.env.MONGO_URI;
  const dbName = process.env.DB_NAME;

  console.log("🔎 Uso configurazione:");
  console.log(" MONGO_URI:", uri);
  console.log(" DB_NAME: ", dbName);

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("✅ Connesso a MongoDB");

    const db = client.db(dbName);
    const stats = await db.stats();
    console.log("📊 Stats DB:", stats);
  } catch (err) {
    console.error("❌ Errore di connessione:", err.message);
  } finally {
    await client.close();
  }
}

main();
