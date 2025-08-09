import http from "node:http";
import path from "node:path";
import fs from "node:fs/promises";
import request from "supertest";
import assert from "node:assert/strict";

import { createApp } from "../../src/app.mjs";
import { makeStorachaClient } from "../../src/services/ipfsService.js";

describe("E2E (Full) server + Storacha", function () {
  this.timeout(120000);

  /** @type {import('http').Server} */
  let server;
  /** @type {string} */
  let baseUrl;

  before(async () => {
    if (process.env.TEST_E2E !== "1") {
      throw new Error("TEST_E2E=1 richiesto per usare Storacha reale");
    }

    // App con storage reale
    const app = createApp({ storage: makeStorachaClient() });

    // Server su porta effimera
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const { port } = /** @type {{port:number}} */ (server.address());
    baseUrl = `http://127.0.0.1:${port}`;
    // (facoltativo) console.log(`[test] server on ${baseUrl}`);
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
      // (facoltativo) console.log("[test] server closed");
    }
  });

  it("carica un PDF su Storacha e ritorna un CID", async () => {
    const pdfPath = path.resolve("test/fixtures/sample.pdf");
    const buf = await fs.readFile(pdfPath);

    const res = await request(baseUrl)
      .post("/documents/upload")
      .attach("document", buf, { filename: "sample.pdf", contentType: "application/pdf" })
      .expect(200);

    assert.ok(res.body?.cid, "CID mancante nella risposta");
    assert.match(res.body.cid, /^bafy/i, "CID inatteso (non inizia con 'bafy')");
  });

  it("rifiuta la chiamata senza file", async () => {
    const res = await request(baseUrl)
      .post("/documents/upload")
      .expect(400);

    assert.equal(res.body?.error, "document file missing");
  });
});

