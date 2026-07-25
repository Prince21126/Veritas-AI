export interface KnowledgeDocument {
  id: string;
  title: string;
  source: string;
  institution: string;
  publication_date: string;
  retrieval_date: string;
  category: string;
  country: string;
  language: string;
  reliability_score: number;
  authority_score: number;
  url: string;
  content: string;
  embedding?: number[];
  keywords: string[];
  summary: string;
}

export interface KnowledgeChunk {
  id: string;
  document_id: string;
  content: string;
  embedding?: number[];
  metadata: {
    title: string;
    source: string;
    institution: string;
    publication_date: string;
    category: string;
    reliability_score: number;
    authority_score: number;
  };
}

export interface RankedChunk extends KnowledgeChunk {
  relevance_score: number;
  freshness_score: number;
  consensus_score: number;
  final_score: number;
  selection_reason: string;
}
