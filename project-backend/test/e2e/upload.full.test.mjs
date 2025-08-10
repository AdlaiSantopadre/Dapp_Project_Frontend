import http from "node:http";
import path from "node:path";
import fs from "node:fs/promises";
import request from "supertest";
import assert from "node:assert/strict";



import { createApp } from "../../src/app.mjs";
import { makeStorage } from "../../services/ipfsService.js";

describe("E2E (Full) server.listen + Storacha", function () {
  this.timeout(120000);

  /** @type {import('http').Server} */
  let server;
  /** @type {string} */
  let base;

  before(async () => {
    if (process.env.TEST_E2E !== "1") {
        throw new Error("TEST_E2E=1 required for real IPFS");
   }
    const app = createApp({ storage: makeStorage() });
    server = http.createServer(app);
    await new Promise(res => server.listen(0, "127.0.0.1",  res));
    const { port } = /** @type {{port:number}} */ (server.address());
    
    base = `http://127.0.0.1:${port}`;
  });

  after(async () => {
    if (server) await new Promise(res => server.close(res));
  });

  it("uploads PDF and returns CID", async () => {
    const pdfPath = path.resolve("test/fixtures/sample.pdf");
    const buf = await fs.readFile(pdfPath);
    const res = await request(base)
      .post("/documents/upload")
      .attach("file", buf, "sample.pdf")
      .expect(200);
    assert.ok(res.body?.cid, "CID missing in response");
    assert.match(res.body.cid, /^bafy/i, "CID unexpected (does not start with 'bafy')");
  });

  it("rejects when file is missing", async () => {
    const res = await request(base)
      .post("/documents/upload")
      .expect(400);
    assert.equal(res.body?.error, "Nessun file caricato");
  });
});
