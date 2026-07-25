import { Router } from "express";
import { z } from "zod";
import { VeritasEngine } from "../engine";
import multer from "multer";
import { ExtractorService } from "../services/extractor";
import { globalStore } from "../store";

const router = Router();
const engine = new VeritasEngine();
const extractor = new ExtractorService();
const upload = multer({ storage: multer.memoryStorage() });

// In-memory store to simulate database for hackathon MVP
const queriesStore = new Map<string, any>();

const sendError = (res: any, status: number, message: string, code: string) => {
  res.status(status).json({ error: true, code, message });
};

router.post("/submit", upload.single("file"), async (req, res) => {
  const rawText = req.body.raw_text;
  if (!rawText || rawText.length < 5) {
    return sendError(res, 400, "L'information à vérifier doit contenir au moins 5 caractères.", "INVALID_INPUT");
  }

  const queryId = Date.now().toString(); // Mock ID
  
  // Create pending query
  queriesStore.set(queryId, {
    id: queryId,
    raw_text: rawText,
    status: "processing",
    created_at: new Date().toISOString(),
  });

  try {
    let userEvidenceText = "";
    if (req.file) {
      console.log(`[Veritas API] User uploaded evidence: ${req.file.originalname}`);
      try {
        userEvidenceText = await extractor.extractText(req.file.buffer, req.file.mimetype);
      } catch (e) {
        return sendError(res, 500, "Impossible d'extraire le texte du fichier fourni.", "FILE_EXTRACTION_ERROR");
      }
    }

    const pipelineResult = await engine.runPipeline(queryId, rawText, userEvidenceText);

    globalStore.addHistory({
      id: queryId,
      query: rawText,
      date: new Date().toISOString(),
      category: pipelineResult.analysis?.category || "Inconnue",
      verification_status: pipelineResult.analysis?.verification_status || "Inconnu",
      confidence: pipelineResult.confidence?.confidence_score || 0,
      time_taken_ms: 1200 // Mock time
    });
    
    // Update store
    queriesStore.set(queryId, {
      ...queriesStore.get(queryId),
      status: pipelineResult.status,
      result: pipelineResult,
    });
    
    res.json({ id: queryId, status: "completed" });
  } catch (error: any) {
    console.error("Veritas Submit Error:", error);
    queriesStore.set(queryId, {
      ...queriesStore.get(queryId),
      status: "error",
      error: error.message,
    });
    return sendError(res, 500, "Une erreur inattendue est survenue lors de la vérification. Veuillez réessayer plus tard.", "INTERNAL_VERIFICATION_ERROR");
  }
});

router.get("/result/:id", (req, res) => {
  const query = queriesStore.get(req.params.id);
  if (!query) {
    return sendError(res, 404, "La vérification demandée n'a pas été trouvée.", "QUERY_NOT_FOUND");
  }
  
  if (query.status === "processing") {
    return res.json({ status: "processing" });
  }
  
  // Return the result format expected by the frontend
  res.json({
    id: query.id,
    query_id: query.id,
    confidence: query.result?.confidence || {},
    risk_level: query.result?.analysis?.risk_level || "low",
    analysis_json: query.result?.analysis || {},
    sources: query.result?.sources || [],
    created_at: query.created_at,
  });
});


router.get("/history", (req, res) => {
  res.json(globalStore.history.slice(0, 5));
});

export default router;
