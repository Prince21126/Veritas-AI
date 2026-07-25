import express from "express";
import multer from "multer";
import { IngestionPipeline } from "../knowledge_base/ingestion";
import { ExtractorService } from "../services/extractor";
import { SemanticChunker } from "../knowledge_base/chunker";
import { globalVectorStore } from "../engine";
import { requireAuth, requireRole } from "./auth";
import { KnowledgeCollector } from "../knowledge_base/collector";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const extractor = new ExtractorService();
const chunker = new SemanticChunker();
const ingestionPipeline = new IngestionPipeline(extractor, chunker, globalVectorStore);

export const collector = new KnowledgeCollector(ingestionPipeline);
collector.start(3600000); // 1 hour

router.post("/ingest", requireAuth, requireRole(["admin", "partner"]), upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ detail: "Aucun fichier fourni" });
    }

    const { originalname, buffer, mimetype } = req.file;
    const result = await ingestionPipeline.ingestFile(buffer, mimetype, originalname);
    
    if (!result) {
        return res.json({
            status: "skipped",
            message: `Fichier ${originalname} déjà ingéré.`
        });
    }

    res.json({
      status: "success",
      message: `Fichier ${originalname} ingéré avec succès.`,
      document_id: result.document_id,
      chunks_created: result.chunks_count
    });
  } catch (error: any) {
    console.error("Ingestion error:", error);
    res.status(500).json({ detail: error.message || "Erreur lors de l'ingestion du fichier" });
  }
});

router.get("/stats", requireAuth, requireRole(["admin", "partner"]), async (req, res) => {
  res.json({
    total_documents: 15, // mock
    total_chunks: 120, // mock
    sources: ["OMS", "Ministère de la Santé RDC", "Radio Okapi"]
  });
});

export default router;
