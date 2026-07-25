const fs = require('fs');
let code = fs.readFileSync('server/knowledge_base/vector_store.ts', 'utf8');

code = code.replace(/async addDocument\(doc: KnowledgeDocument\) \{[\s\S]*?async addChunk\(chunk/m, 'async addDocument(doc: KnowledgeDocument) {\n    this.documents.push(doc);\n  }\n\n  async addChunk(chunk');
fs.writeFileSync('server/knowledge_base/vector_store.ts', code);
