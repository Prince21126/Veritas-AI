import { Router } from "express";

const router = Router();

// Mock database for sources
const sourcesQueue: any[] = [];

router.post("/suggest", async (req, res) => {
  const { website, institution, category, language } = req.body;
  if (!website || !institution) {
    return res.status(400).json({ error: true, message: "Site web et institution requis." });
  }

  const newSource = {
    id: Date.now().toString(),
    website,
    institution,
    category,
    language,
    status: "pending",
    submitted_at: new Date().toISOString(),
  };

  sourcesQueue.push(newSource);
  res.status(201).json({ message: "Source suggérée avec succès. En attente de modération." });
});

router.get("/queue", async (req, res) => {
  // Simplified: only admin should access this
  res.json(sourcesQueue);
});

router.post("/approve/:id", async (req, res) => {
  const source = sourcesQueue.find(s => s.id === req.params.id);
  if (!source) return res.status(404).json({ error: true, message: "Source non trouvée." });
  
  source.status = "approved";
  // Here we would normally trigger the collector
  res.json({ message: "Source approuvée." });
});

export default router;
