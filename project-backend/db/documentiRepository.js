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

    const { insertedId } = await col.insertOne(doc);
    console.log("📌 Documento creato con _id:", insertedId, "tipo:", typeof insertedId);
    return { id: insertedId.toString(), ...doc };
  },

    async setQrCid(id, qrCid) {
  const col = await getDocumentiCollection();
  const objectId = ObjectId.createFromHexString(id);

  const result = await col.findOneAndUpdate(
    { _id: objectId },
    { $set: { qrCid } },
    { returnDocument: 'after' }   // driver >=4.0 use 'returnDocument' instead of 'returnOriginal'
  );

  console.log("📌 [Repo] result:", result);

  return result 
    ? { id: result._id.toString(), ...result }
    : null;
},

  async getDocumentoById(id) {
    const col = await getDocumentiCollection();
    const doc = await col.findOne({ _id: new ObjectId(id) });
    if (!doc) return null;
    return { id: doc._id.toString(), ...doc };
  },

  async listDocumentiByImpianto(impiantoId) {
    const col = await getDocumentiCollection();
    const docs = await col.find({ impiantoId }).sort({ timestamp: -1 }).toArray();
    return docs.map(d => ({ id: d._id.toString(), ...d }));
  }
};

