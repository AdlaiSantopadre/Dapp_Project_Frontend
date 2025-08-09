import express from 'express';
import fileUpload from "express-fileupload";
import documentsRouter from "../routes/documents.js";

export function createApp({ storage } = {}) {
  const app = express();
  app.use(express.json());
  app.use(fileUpload());
  // Monta la route con DI del servizio storage
  app.use("/documents", documentsRouter({ storage }));

  return app;
}