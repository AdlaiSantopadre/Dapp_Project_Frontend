import { ObjectId } from 'mongodb';
import { getDocumentiCollection } from '../db/mongo.js';

export const documentiDb = {
  async createDocumento({ impiantoId, pdfCid, txHash, certificatore }) {
  const col = await getDocumentiCollection();

  const doc = {
    impiantoId,
    pdfCid,
    qrCid: null,
    txHash,
    certificatore,
    timestamp: new Date(),
  };

  try {
    const result = await col.insertOne(doc);
    if (!result.acknowledged) {
      throw new Error("Insert non confermato da MongoDB");
    }

    console.log("✅ Documento creato con _id:", result.insertedId, "tipo:", typeof result.insertedId);

    return { id: result.insertedId.toString(), ...doc };
  } catch (err) {
    console.error("❌ Errore in insertOne:", err.message);
    throw err;
  }

    
  },

    async setQrCid(id, qrCid) {
  const col = await getDocumentiCollection();
  const objectId = ObjectId.createFromHexString(id);

  const result = await col.findOneAndUpdate(
    { _id: objectId },
    { $set: { qrCid } },
    { returnDocument: 'after' }   // driver >=4.0 use 'returnDocument' instead of 'returnOriginal'
  );

  console.log(" [Repo] result:", result);

  return result 
    ? { id: result._id.toString(), ...result }
    : null;
},
  async listDocumentiAll() {
  const col = await getDocumentiCollection();
  const docs = await col.find({}).sort({ timestamp: -1 }).toArray();
  return docs.map(d => ({ id: d._id.toString(), ...d }));
  },  
  async getDocumentoById(id) {
    const col = await getDocumentiCollection();
    const doc = await col.findOne({ _id: ObjectId.createFromHexString(id)  });
    if (!doc) return null;
    return { id: doc._id.toString(), ...doc };
  },

  async listDocumentiByImpianto(impiantoId) {
    const col = await getDocumentiCollection();
    const docs = await col.find({ impiantoId }).sort({ timestamp: -1 }).toArray();
    return docs.map(d => ({ id: d._id.toString(), ...d }));
  }
};

