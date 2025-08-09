import { create as createClient } from "@storacha/client";
import { Readable } from "node:stream";

export function makeStorage() {
  const useReal = process.env.TEST_E2E === "1" || process.env.IPFS_USE_REAL === "1";
  if (useReal) return makeStorachaClient();
  return makeMockStorage();
}

function makeMockStorage() {
  return {
    async put(file) {
      console.log("[IPFS MOCK] file:", file.name);
      return { cid: "bafyMOCKcid", size: file.size };
    }
  };
}

function makeStorachaClient() {
  const {
    STORACHA_SPACE_DID,
    STORACHA_AGENT_SECRET,
    STORACHA_DATA_DIR,
    STORACHA_ENDPOINT
  } = process.env;

  if (!STORACHA_SPACE_DID || !STORACHA_AGENT_SECRET) {
    throw new Error("Missing Storacha env vars");
  }

  const client = createClient({
    space: STORACHA_SPACE_DID,
    agentSecret: STORACHA_AGENT_SECRET,
    dataDir: STORACHA_DATA_DIR,
    endpoint: STORACHA_ENDPOINT
  });

  return {
    async put(file) {
      const cid = await client.uploadFile({
        name: file.name,
        stream: () => bufferToStream(file.data),
        size: file.size,
        type: file.mimetype
      });
      return { cid, size: file.size };
    }
  };
}

function bufferToStream(buf) {
  const r = new Readable();
  r.push(buf);
  r.push(null);
  return r;
}
