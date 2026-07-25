import { VectorStore } from "./vector_store";
import { KnowledgeChunk, RankedChunk } from "./types";

export class Retriever {
  constructor(private vectorStore: VectorStore) {}

  async retrieveTopK(query: string, topK: number = 3): Promise<RankedChunk[]> {
    const rawChunks = await this.vectorStore.similaritySearch(query, 10);
    const rankedChunks = this.rankChunks(query, rawChunks);
    return rankedChunks.slice(0, topK);
  }

  private rankChunks(query: string, chunks: KnowledgeChunk[]): RankedChunk[] {
    const lowerQuery = query.toLowerCase();
    const isCritical = lowerQuery.includes("ebola") || lowerQuery.includes("choléra") || lowerQuery.includes("cholera") || lowerQuery.includes("attaque") || lowerQuery.includes("guerre");
    
    const ranked = chunks.map(chunk => {
      // 1. Relevance Score (40%)
      let relScore = 0;
      const queryWords = lowerQuery.split(/\s+/).filter(w => w.length > 3);
      queryWords.forEach(w => {
        if (chunk.content.toLowerCase().includes(w)) relScore += 0.2;
      });
      relScore = Math.min(1.0, relScore + 0.3);
      
      // 2. Freshness Score (20%)
      const now = new Date();
      const pubDate = new Date(chunk.metadata.publication_date);
      const daysOld = Math.max(0, (now.getTime() - pubDate.getTime()) / (1000 * 3600 * 24));
      
      let freshScore = 1.0;
      if (isCritical) {
        if (daysOld <= 7) freshScore = 1.0;
        else if (daysOld <= 30) freshScore = 0.8;
        else if (daysOld <= 90) freshScore = 0.5;
        else freshScore = 0.1;
      } else {
        if (daysOld <= 30) freshScore = 1.0;
        else if (daysOld <= 180) freshScore = 0.8;
        else freshScore = 0.4;
      }

      // 3. Authority Score (25%)
      const authScore = chunk.metadata.authority_score * chunk.metadata.reliability_score;

      // 4. Semantic Completeness (10%)
      const completenessScore = Math.min(1.0, chunk.content.length / 300);

      // 5. Consensus Score (5%)
      let consensus = 0;
      chunks.forEach(other => {
        if (other.id !== chunk.id && other.metadata.category === chunk.metadata.category) {
            consensus += 0.2;
        }
      });
      const consScore = Math.min(1.0, consensus + 0.1);

      const finalScore = (relScore * 0.40) + (authScore * 0.25) + (freshScore * 0.20) + (completenessScore * 0.10) + (consScore * 0.05);
      
      let reason = `Pertinence sémantique: ${(relScore*100).toFixed(0)}%. `;
      if (freshScore > 0.8) reason += "Très récent. ";
      if (authScore > 0.8) reason += "Source officielle. ";

      return {
        ...chunk,
        relevance_score: relScore,
        freshness_score: freshScore,
        consensus_score: consScore,
        final_score: finalScore,
        selection_reason: reason.trim()
      };
    });

    return ranked.sort((a, b) => b.final_score - a.final_score);
  }
}
