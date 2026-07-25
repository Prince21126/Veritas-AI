const fs = require('fs');
let code = fs.readFileSync('server/api/veritas.ts', 'utf8');

// Insert import
code = code.replace(
  "import { ExtractorService } from \"../services/extractor\";",
  "import { ExtractorService } from \"../services/extractor\";\nimport { globalStore } from \"../store\";"
);

// Add to history
code = code.replace(
  "queriesStore.set(queryId, {",
  `
    globalStore.addHistory({
      id: queryId,
      query: rawText,
      date: new Date().toISOString(),
      category: pipelineResult.analysis?.category || "Inconnue",
      verification_status: pipelineResult.analysis?.verification_status || "Inconnu",
      confidence: pipelineResult.confidence?.confidence_score || 0,
      time_taken_ms: 1200 // Mock time
    });
    queriesStore.set(queryId, {`
);

fs.writeFileSync('server/api/veritas.ts', code);
