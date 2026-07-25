const fs = require('fs');
let code = fs.readFileSync('server/knowledge_base/vector_store.ts', 'utf8');

const newMethods = `
  deleteDocument(id: string) {
    this.documents = this.documents.filter(d => d.id !== id);
    this.chunks = this.chunks.filter(c => c.document_id !== id);
  }

  updateDocument(id: string, updates: Partial<KnowledgeDocument>) {
    const idx = this.documents.findIndex(d => d.id === id);
    if (idx !== -1) {
      this.documents[idx] = { ...this.documents[idx], ...updates };
      // update chunks metadata
      this.chunks = this.chunks.map(c => {
        if (c.document_id === id) {
           return {
             ...c,
             metadata: {
                ...c.metadata,
                title: updates.title || c.metadata.title,
                source: updates.source || c.metadata.source,
                institution: updates.institution || c.metadata.institution,
                publication_date: updates.publication_date || c.metadata.publication_date,
                category: updates.category || c.metadata.category
             }
           }
        }
        return c;
      });
    }
  }

  async similaritySearch(query: string, topK: number = 10): Promise<KnowledgeChunk[]> {
`;

code = code.replace("async similaritySearch(query: string, topK: number = 10): Promise<KnowledgeChunk[]> {", newMethods);

fs.writeFileSync('server/knowledge_base/vector_store.ts', code);
