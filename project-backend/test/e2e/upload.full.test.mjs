import http from "node:http";
import request from "supertest";
import path from "node:path";
import fs from "node:fs/promises";
import { createApp } from "../../src/app.mjs";
import { makeStorachaClient } from "../../src/storage/storacha.mjs";

describe("E2E (Full) server + Storacha", function () {
  this.timeout(120000);

  let server, base;

  before(async () => {
    if (process.env.TEST_E2E !== "1") throw new Error("TEST_E2E=1 required");
    const app = createApp({ storage: makeStorachaClient() });
    server = http.createServer(app);
    await new Promise(res => server.listen(0, res));
    const { port } = server.address();
    base = `http://127.0.0.1:${port}`;
  });

  after(async () => {
    if (server) await new Promise(res => server.close(res));
  });

  it("uploads PDF and returns CID", async () => {
    const pdfPath = path.resolve("test/fixtures/sample.pdf");
    const res = await request(base)
      .post("/documents/upload")
      .attach("document", await fs.readFile(pdfPath), "sample.pdf")
      .expect(200);
    if (!res.body?.cid) throw new Error("CID missing");
  });
});
