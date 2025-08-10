import express from 'express';
import documentsRouter from "../routes/documents.js";

export function createApp({ storage } = {}) {
  
  const app = express();
  app.use(express.json());
 
  // Monta la route con DI del servizio storage
  app.use("/documents", documentsRouter({ storage }));
  app.get("/healthz", (_req,res)=>res.json({ok:true}));

  return app;
}