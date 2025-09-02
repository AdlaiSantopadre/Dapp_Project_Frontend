// test-mongo.mjs
// test-mongo-alt.mjs
import { MongoClient } from "mongodb";

const uri = "mongodb://host.docker.internal:27017";
const dbName = "documentiDb";

async function main() {
  console.log("🔎 Testo connessione diretta:");
  console.log(" URI:    ", uri);
  console.log(" DB_NAME:", dbName);

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("✅ Connesso a MongoDB via host.docker.internal");

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
