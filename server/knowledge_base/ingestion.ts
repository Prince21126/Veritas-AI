import { ExtractorService } from "../services/extractor";
import { GemmaService } from "../services/gemma";
import { SemanticChunker } from "./chunker";
import { VectorStore } from "./vector_store";
import { KnowledgeChunk } from "./types";
import { Type } from "@google/genai";
import * as crypto from "crypto";

export class IngestionPipeline {
  constructor(
    private extractor: ExtractorService,
    private chunker: SemanticChunker,
    private vectorStore: VectorStore
  ) {}

  private processedHashes: Set<string> = new Set();

  async ingestFile(fileBuffer: Buffer, mimeType: string, filename: string) {
    console.log(`[Ingestion] Starting ingestion for ${filename}`);
    
    // 1. Extract text
    const text = await this.extractor.extractText(fileBuffer, mimeType);
    
    // Simple deduplication cache based on text hash
    const textHash = crypto.createHash('md5').update(text).digest('hex');
    if (this.processedHashes.has(textHash)) {
      console.log(`[Ingestion] Document ${filename} already ingested, skipping analysis.`);
      return null;
    }
    
    // 2. Analyze document to generate metadata locally (Deterministic)
    console.log(`[Ingestion] Analyzing metadata locally...`);
    
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    const title = lines[0]?.substring(0, 50) || filename;
    
    // Simple heuristic-based extraction
    let institution = "Source Inconnue";
    let category = "General";
    if (text.toLowerCase().includes("santé") || text.toLowerCase().includes("who") || text.toLowerCase().includes("oms")) {
        institution = "Organisation Mondiale de la Santé";
        category = "Health";
    } else if (text.toLowerCase().includes("gouvernement") || text.toLowerCase().includes("ministère")) {
        institution = "Gouvernement";
        category = "Politics";
    }
    
    const metadata = {
        title: title,
        institution: institution,
        category: category,
        summary: text.substring(0, 200) + "...",
        keywords: text.toLowerCase().split(/\s+/).slice(0, 5), // Very naive
        reliability_score: 0.7,
        authority_score: 0.7
    };
    
    this.processedHashes.add(textHash);
    
    const docId = `doc_${Date.now()}`;
    const pubDate = new Date().toISOString();

    const newDoc = {
      id: docId,
      title: metadata.title,
      source: filename,
      institution: metadata.institution,
      publication_date: pubDate,
      retrieval_date: pubDate,
      category: metadata.category,
      country: "RDC",
      language: "fr",
      reliability_score: metadata.reliability_score,
      authority_score: metadata.authority_score,
      url: "",
      content: text,
      keywords: metadata.keywords,
      summary: metadata.summary
    };
    await this.vectorStore.addDocument(newDoc);

    
    // 3. Chunking
    console.log(`[Ingestion] Chunking document...`);
    const textChunks = this.chunker.chunk(text);
    
    // 4. Embedding & Indexing
    console.log(`[Ingestion] Indexing ${textChunks.length} chunks...`);
    for (let i = 0; i < textChunks.length; i++) {
      const chunkText = textChunks[i];
      
      const chunk: KnowledgeChunk = {
        id: `${docId}_chunk_${i}`,
        document_id: docId,
        content: chunkText,
        metadata: {
          title: metadata.title,
          source: filename,
          institution: metadata.institution,
          publication_date: pubDate,
          category: metadata.category,
          reliability_score: metadata.reliability_score,
          authority_score: metadata.authority_score
        }
      };
      
      await this.vectorStore.addChunk(chunk);
    }
    
    console.log(`[Ingestion] Successfully ingested ${filename}`);
    return { document_id: docId, chunks_count: textChunks.length };
  }
}
