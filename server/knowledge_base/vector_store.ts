import { KnowledgeDocument, KnowledgeChunk } from "./types";

export class VectorStore {
  private documents: KnowledgeDocument[] = [
    {
      id: "1",
      title: "Directives de traitement du choléra",
      source: "Manuel Clinique",
      institution: "OMS",
      publication_date: "2024-01-15T00:00:00Z",
      retrieval_date: "2024-06-25T00:00:00Z",
      category: "Santé",
      country: "Global",
      language: "fr",
      reliability_score: 1.0,
      authority_score: 1.0,
      url: "https://who.int/cholera/guidelines",
      content: "L'OMS confirme que boire de l'eau salée ne guérit pas le choléra. Le traitement nécessite des sels de réhydratation orale (SRO) et une supervision médicale.",
      keywords: ["cholera", "traitement", "eau salée", "sro", "remède", "choléra"],
      summary: "Directives de l'OMS sur le traitement du choléra."
    },
    {
      id: "2",
      title: "Communiqué Sécuritaire Provincial",
      source: "Communication Officielle",
      institution: "Ministère de l'Intérieur RDC",
      publication_date: "2024-05-20T10:00:00Z",
      retrieval_date: "2024-06-25T00:00:00Z",
      category: "Sécurité",
      country: "RDC",
      language: "fr",
      reliability_score: 0.95,
      authority_score: 1.0,
      url: "https://mininterieur.gouv.cd/communiques/2024-05-20",
      content: "Le gouvernement provincial du Sud-Kivu a démenti les rumeurs d'une attaque imminente sur Bukavu, appelant la population au calme. Les écoles fonctionneront normalement.",
      keywords: ["attaque", "bukavu", "rumeur", "écoles", "sécurité", "sud-kivu"],
      summary: "Démenti officiel d'attaque à Bukavu par le gouvernement provincial."
    },
    {
      id: "3",
      title: "Bulletin Epidémiologique Hebdomadaire",
      source: "Rapport Officiel",
      institution: "Ministère de la Santé RDC",
      publication_date: "2024-06-10T08:00:00Z",
      retrieval_date: "2024-06-25T00:00:00Z",
      category: "Santé",
      country: "RDC",
      language: "fr",
      reliability_score: 0.95,
      authority_score: 1.0,
      url: "https://minsante.gouv.cd/bulletin/2024-06-10",
      content: "Il n'y a aucun cas confirmé d'Ebola signalé récemment à Bukavu. Le système de surveillance épidémiologique n'a détecté aucune alerte.",
      keywords: ["ebola", "bukavu", "épidémie", "santé", "surveillance"],
      summary: "Aucun cas d'Ebola à Bukavu selon le Ministère de la Santé."
    },
    {
      id: "4",
      title: "Point de presse sur la sécurité urbaine",
      source: "Radio Okapi",
      institution: "Police Nationale Congolaise",
      publication_date: new Date().toISOString(),
      retrieval_date: new Date().toISOString(),
      category: "Sécurité",
      country: "RDC",
      language: "fr",
      reliability_score: 0.8,
      authority_score: 0.8,
      url: "https://radiookapi.net/news",
      content: "Le porte-parole de la police dément les fausses informations sur WhatsApp annonçant des fermetures d'écoles suite aux rumeurs d'épidémie.",
      keywords: ["police", "démenti", "écoles", "whatsapp", "rumeur"],
      summary: "Démenti de la PNC concernant la fermeture des écoles."
    }
  ];
  
  private chunks: KnowledgeChunk[] = [];

  constructor() {
    this.initializeFromDocs();
  }

  private initializeFromDocs() {
    this.chunks = [];
    for (const doc of this.documents) {
      this.chunks.push({
        id: `chunk_${doc.id}`,
        document_id: doc.id,
        content: doc.content,
        metadata: {
          title: doc.title,
          source: doc.source,
          institution: doc.institution,
          publication_date: doc.publication_date,
          category: doc.category,
          reliability_score: doc.reliability_score,
          authority_score: doc.authority_score
        }
      });
    }
  }

  async addDocument(doc: KnowledgeDocument) {
    this.documents.push(doc);
  }

  async addChunk(chunk: KnowledgeChunk) {
    this.chunks.push(chunk);
  }

  getDocuments() {
    return this.documents;
  }

  getStats() {
    return {
      total_documents: this.documents.length,
      total_chunks: this.chunks.length
    };
  }

  
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

    const lowerQuery = query.toLowerCase();
    
    // Hybrid keyword & semantic search logic simulation
    let results = this.chunks.map(chunk => {
      let score = 0;
      const lowerContent = chunk.content.toLowerCase();
      
      const queryWords = lowerQuery.split(/\s+/).filter(w => w.length > 3);
      for (const word of queryWords) {
        if (lowerContent.includes(word)) score += 0.5;
      }
      
      if (lowerQuery.includes(chunk.metadata.category.toLowerCase())) score += 1.0;
      if (lowerContent.includes("école") && (lowerQuery.includes("ecole") || lowerQuery.includes("école"))) score += 1.0;
      
      return { chunk, score };
    });

    let filtered = results.filter(r => r.score > 0).sort((a, b) => b.score - a.score);
    if (filtered.length === 0) filtered = results.sort((a, b) => b.score - a.score);

    return filtered.slice(0, topK).map(r => r.chunk);
  }
}
