import request from "supertest";
import assert from "node:assert/strict";
import path from "node:path";
import fs from "node:fs/promises";

import { createApp } from "../../src/app.mjs";

describe("E2E /documents/upload (Mock storage)", function () {
  this.timeout(30000);

  // Storage finto compatibile con la firma put({ name, data, size, mimetype })
  const mockStorage = {
    async put({ name, data, size, mimetype }) {
      if (!data || !size) throw new Error("invalid mock data");
      return { cid: "bafyMOCKcid", size };
    }
  };

  let app;

  before(() => {
    app = createApp({ storage: mockStorage });
  });

  it("returns a mock CID with a valid file", async () => {
    const pdfPath = path.resolve("test/fixtures/sample.pdf");
    const buf = await fs.readFile(pdfPath);

    const res = await request(app)
      .post("/documents/upload")
      .attach("file", buf, { filename: "sample.pdf", contentType: "application/pdf" })
      .expect(200);

    assert.equal(res.body.cid, "bafyMOCKcid");
  });

  it("rejects when missing file", async () => {
    const res = await request(app).post("/documents/upload").expect(400);
    assert.equal(res.body?.error, "Nessun file caricato");
  });
});
