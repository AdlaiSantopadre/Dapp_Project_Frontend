import request from "supertest";
import path from "node:path";
import fs from "node:fs/promises";
import { createApp } from "../../src/app.mjs";
import { makeStorachaClient } from "../../src/storage/storacha.mjs";
import assert from "node:assert/strict";

describe("E2E /documents/upload (Integration, real Storacha)", function () {
  this.timeout(120000);

  let app;

  before(async () => {
    if (process.env.TEST_E2E !== "1") {
      throw new Error("Run with TEST_E2E=1 to use real Storacha");
    }
    const storage = makeStorachaClient();
    app = createApp({ storage });
  });

  it("uploads a real PDF to Storacha and returns a CID", async () => {
    const pdfPath = path.resolve("test/fixtures/sample.pdf");
    const buf = await fs.readFile(pdfPath);
    const res = await request(app)
      .post("/documents/upload")
      .attach("document", buf, { filename: "sample.pdf", contentType: "application/pdf" })
      .expect(200);

    assert.match(res.body.cid, /^bafy/i, "Expected a CID like bafy...");
  });
});
