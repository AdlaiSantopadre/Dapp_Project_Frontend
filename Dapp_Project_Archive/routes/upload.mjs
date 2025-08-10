import { Router } from "express";

export function uploadRouter({ storage }) {
  const r = Router();

  r.post("/upload", async (req, res) => {
    try {
      if (!req.files?.document) {
        return res.status(400).json({ error: "document file missing" });
      }
      const doc = req.files.document; // da express-fileupload
      const { cid } = await storage.put(doc);

      // opzionale: on-chain registration qui...

      return res.status(200).json({ cid });
    } catch (err) {
      console.error("[/documents/upload] error", err);
      return res.status(500).json({ error: "upload failed" });
    }
  });

  return r;
}