import request from "supertest";
//import http from "node:http";
import path from "node:path";
import fs from "node:fs/promises";
import assert from "node:assert/strict";

import { createApp } from "../../src/app.mjs";
import { makeStorage } from "../../services/ipfsService.js";

describe("E2E documents/upload (Integration , real Storacha", function () {
  this.timeout(120000);

  let app

  /** @type {import('http').Server} */
  let server;
  /** @type {string} */
  let baseUrl;

  before(async () => {
    if (process.env.TEST_E2E !== "1") {
      throw new Error("TEST_E2E=1 richiesto per usare Storacha reale");
    }
    // App con storage reale
    app = createApp({ storage: makeStorage()}); 
  });



  it("carica un PDF su Storacha e ritorna un CID", async () => {
    const pdfPath = path.resolve("test/fixtures/sample.pdf");
    const buf = await fs.readFile(pdfPath);
    const res = await request(app)
      .post("/documents/upload")
      .attach("file", buf, { filename: "sample.pdf", contentType: "application/pdf" })
      .expect(200);

    assert.ok(res.body?.cid, "CID mancante nella risposta");
    assert.match(res.body.cid, /^bafy/i, "CID inatteso (non inizia con 'bafy')");
  });

  it("rifiuta la chiamata senza file", async () => {
    const res = await request(app)
      .post("/documents/upload")
      .expect(400);

    assert.equal(res.body?.error, "document file missing");
  });
});

