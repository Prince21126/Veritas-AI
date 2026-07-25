import { AnalyzerAgent } from "./agents/analyzer";
import { ConfidenceAgent } from "./agents/confidence";
import { ContextBuilder } from "./knowledge_base/context_builder";
import { Retriever } from "./knowledge_base/retriever";
import { VectorStore } from "./knowledge_base/vector_store";
import { globalStore } from "./store";
import { v4 as uuidv4 } from "uuid";

// We keep a singleton VectorStore in memory for this MVP
export const globalVectorStore = new VectorStore();

export class VeritasEngine {
  private retriever = new Retriever(globalVectorStore);
  private contextBuilder = new ContextBuilder();
  private analyzerAgent = new AnalyzerAgent();
  private confidenceAgent = new ConfidenceAgent();

  async runPipeline(queryId: string, userQuery: string, userEvidenceText?: string) {
    console.log(`[Engine] Starting pipeline for query: ${queryId}`);
    
    const evidenceChunks = await this.retriever.retrieveTopK(userQuery, 5);
    console.log(`[Engine] Retrieval complete: ${evidenceChunks.length} chunks found.`);

    let optimizedContext = this.contextBuilder.build(evidenceChunks);
    
    if (userEvidenceText) {
      console.log(`[Engine] Including user evidence text in context.`);
      optimizedContext += `\n\n--- PREUVE SOUMISE PAR L'UTILISATEUR ---\nLe texte suivant a été extrait d'un fichier soumis par l'utilisateur lors de sa requête. Analysez ce fichier pour déterminer s'il est pertinent, s'il soutient ou s'il contredit la rumeur. ATTENTION: Ce fichier provient de l'utilisateur et non de la base de connaissances officielle, son authenticité n'est pas garantie.\n\nContenu du fichier utilisateur :\n${userEvidenceText}\n---\n`;
    }

    let analysis;
    try {
      analysis = await this.analyzerAgent.process(userQuery, optimizedContext);
    } catch (e) {
      console.error("[Engine] Gemini API Error:", e);
      throw e; 
    }
    
    // NOTIFICATION LOGIC
    if (analysis.verification_status === 'fiable' || analysis.verification_status === 'probablement fiable') {
        const matchingPartners = globalStore.users.filter(u => u.role === 'partner' && u.category === analysis.category);
        for (const partner of matchingPartners) {
            globalStore.addNotification({
                id: uuidv4(),
                userId: partner.id,
                message: `Une nouvelle vérification fiable a été détectée dans votre secteur (${analysis.category}): ${userQuery.substring(0, 50)}...`,
                type: 'verification',
                timestamp: new Date().toISOString()
            });
        }
    }
    // General category alert
    const categoryPartners = globalStore.users.filter(u => u.role === 'partner' && u.category === analysis.category);
    for (const partner of categoryPartners) {
        globalStore.addNotification({
            id: uuidv4(),
            userId: partner.id,
            message: `Une nouvelle recherche a été lancée concernant votre secteur (${analysis.category}): ${userQuery.substring(0, 50)}...`,
            type: 'alert',
            timestamp: new Date().toISOString()
        });
    }
    
    const confidenceResults = await this.confidenceAgent.calculate(analysis, evidenceChunks);
    
    const uniqueDocs = new Map();
    for (const chunk of evidenceChunks) {
      if (!uniqueDocs.has(chunk.document_id)) {
        uniqueDocs.set(chunk.document_id, chunk);
      }
    }
    
    const sources = Array.from(uniqueDocs.values()).map(chunk => ({
      title: chunk.metadata.title || "Document",
      organization: chunk.metadata.institution || "Source Inconnue",
      type: "Officiel", 
      reliability: chunk.metadata.reliability_score > 0.8 ? "Très Élevée" : "Moyenne",
      publication_date: chunk.metadata.publication_date ? new Date(chunk.metadata.publication_date).toLocaleDateString('fr-FR') : "Date inconnue",
      text_extract: chunk.content,
      selection_reason: chunk.selection_reason,
      category: chunk.metadata.category
    }));

    return {
      status: "completed",
      analysis: {
        intent: analysis.intent || "",
        category: analysis.category || "",
        entities: analysis.extracted_entities || [],
        verification_status: analysis.verification_status || "",
        risk_level: analysis.risk_level || "",
        impact_level: analysis.impact_level || "",
        reasoning: analysis.reasoning || "",
        supporting_evidence: analysis.supporting_evidence || [],
        missing_information: analysis.missing_information || "",
        contradictions: analysis.contradictions || [],
        responsible_advice: analysis.responsible_advice || "",
        summary: analysis.summary || ""
      },
      confidence: confidenceResults,
      sources: sources,
    };
  }
}
