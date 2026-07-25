import { RankedChunk } from "./types";

export class ContextBuilder {
  build(chunks: RankedChunk[]): string {
    if (!chunks || chunks.length === 0) {
      return "Aucune information vérifiée disponible dans la base de données. Expliquez explicitement qu'aucun document officiel récent n'a été trouvé.";
    }
    
    const uniqueChunks: RankedChunk[] = [];
    const seenContents = new Set<string>();
    
    for (const chunk of chunks) {
      const simplifiedContent = chunk.content.substring(0, 50).toLowerCase();
      if (!seenContents.has(simplifiedContent)) {
        uniqueChunks.push(chunk);
        seenContents.add(simplifiedContent);
      }
    }
    
    let contextString = "INSTRUCTIONS IMPORTANTES: Vous devez utiliser les fragments de documents suivants comme unique source de vérité. Citez explicitement ces sources. Ne fabriquez aucune information. Si ces fragments ne permettent pas de répondre avec certitude, indiquez-le explicitement.\n\n";
    
    for (const chunk of uniqueChunks) {
      const source = chunk.metadata.institution || "Source Inconnue";
      const date = chunk.metadata.publication_date ? new Date(chunk.metadata.publication_date).toLocaleDateString('fr-FR') : "Date inconnue";
      const rel = chunk.metadata.reliability_score > 0.8 ? "Très Élevée" : "Moyenne";
      
      contextString += `[DOCUMENT ID: ${chunk.document_id} | CHUNK: ${chunk.id}]\n`;
      contextString += `Titre: ${chunk.metadata.title}\n`;
      contextString += `Institution: ${source} (Fiabilité: ${rel})\n`;
      contextString += `Date de publication: ${date}\n`;
      contextString += `Texte: ${chunk.content}\n`;
      contextString += `---\n`;
    }
    return contextString;
  }
}
