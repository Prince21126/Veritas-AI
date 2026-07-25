const fs = require('fs');
let code = fs.readFileSync('server/knowledge_base/ingestion.ts', 'utf8');

const newCode = `
    const docId = \`doc_\${Date.now()}\`;
    const pubDate = new Date().toISOString();

    const newDoc = {
      id: docId,
      title: metadata.title || filename,
      source: filename,
      institution: metadata.institution || "Source Inconnue",
      publication_date: pubDate,
      retrieval_date: pubDate,
      category: metadata.category || "General",
      country: "RDC",
      language: "fr",
      reliability_score: metadata.reliability_score || 0.8,
      authority_score: metadata.authority_score || 0.8,
      url: "",
      content: text,
      keywords: metadata.keywords || [],
      summary: metadata.summary || ""
    };
    await this.vectorStore.addDocument(newDoc);
`;

code = code.replace("const docId = `doc_${Date.now()}`;\n    const pubDate = new Date().toISOString();", newCode);

fs.writeFileSync('server/knowledge_base/ingestion.ts', code);
