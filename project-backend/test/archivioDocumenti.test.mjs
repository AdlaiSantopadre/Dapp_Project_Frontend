import request from 'supertest';
import { strict as assert } from 'assert';
import { createApp } from '../src/app.mjs';
import { connectToDb } from '../db/mongo.js';

// mock storage per documentsRouter (non usato in questi test, ma necessario a createApp)
const storage = {
  put: async () => ({ cid: 'bafymockcid' })
};

let app;
let server;
let insertedId;

describe('API /archivio-documenti (CRUD senza auth)', function () {
  this.timeout(10000);

  before(async () => {
    await connectToDb();

    // crea app SENZA montare authMiddleware e roleMiddleware
    // qui invece di importare archivioDocumentiRouter dentro app.mjs,
    // possiamo montarci il router direttamente (bypass totale).
    const express = (await import('express')).default;
    app = express();
    app.use(express.json());

    const archivioDocumentiRouter = (await import('../routes/archivioDocumenti.js')).default;
    app.use('/archivio-documenti', archivioDocumentiRouter);

    server = app.listen(0);
  });

  after(() => {
    if (server) server.close();
  });

  it('POST /archivio-documenti → crea documento', async () => {
    const res = await request(server)
      .post('/archivio-documenti')
      .send({
        impiantoId: 'IMPIANTO-1234',
        pdfCid: 'bafybeigdyrqkmock...',
        txHash: '0x9af4a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0',
        certificatore: '0x1234abcd1234abcd1234abcd1234abcd1234abcd',
      })
      .expect(201);

    console.log("📌 Inserted ID:", res.body.id);
    assert.ok(res.body.id);
    assert.equal(res.body.impiantoId, 'IMPIANTO-1234');
    insertedId = res.body.id;
  });

  it('PATCH /archivio-documenti/:id/qr → aggiunge qrCid', async () => {
    const res = await request(server)
      .patch(`/archivio-documenti/${insertedId}/qr`)
      .send({ qrCid: 'bafybeif2y6kmock...' })
      .expect(200);

    console.log("📌 PATCH result:", res.body);
    assert.equal(res.body.documento.qrCid, 'bafybeif2y6kmock...');
  });

  it('GET /archivio-documenti/:id → recupera documento', async () => {
    const res = await request(server)
      .get(`/archivio-documenti/${insertedId}`)
      .expect(200);

    assert.equal(res.body.impiantoId, 'IMPIANTO-1234');
    assert.equal(res.body.qrCid, 'bafybeif2y6kmock...');
  });

  it('GET /archivio-documenti/impianto/IMPIANTO-1234 → lista documenti', async () => {
    const res = await request(server)
      .get('/archivio-documenti/impianto/IMPIANTO-1234')
      .expect(200);

    assert.ok(Array.isArray(res.body));
    assert.equal(res.body[0].impiantoId, 'IMPIANTO-1234');
  });
});
