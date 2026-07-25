import { RankedChunk } from "../knowledge_base/types";

export class ConfidenceAgent {
  async calculate(analysis: any, evidence: RankedChunk[]) {
    if (!evidence || evidence.length === 0) {
      return {
        confidence_score: 0,
        confidence_level: "Nulle",
        confidence_explanation: "Aucune source ou information pertinente n'a été trouvée pour confirmer ou infirmer cette requête.",
        confidence_factors: { official_sources: 0, multiple_agreement: 0, freshness: 0, credibility: 0, completeness: 0 }
      };
    }

    let officialScore = 0;
    let agreementScore = 0;
    let credibilityScore = 0;
    
    const uniqueSources = new Set(evidence.map(chunk => chunk.metadata.institution || "Unknown"));
    
    agreementScore = Math.min(uniqueSources.size * 10, 20);

    let hasOfficial = false;
    let totalReliability = 0;
    let avgFreshness = 0;

    for (const chunk of evidence) {
      if (chunk.metadata.authority_score > 0.8) hasOfficial = true;
      totalReliability += chunk.metadata.reliability_score;
      avgFreshness += chunk.freshness_score;
    }
    
    avgFreshness = avgFreshness / evidence.length;
    totalReliability = (totalReliability / evidence.length) * 15;

    if (hasOfficial) officialScore = 40;
    else if (uniqueSources.size > 0) officialScore = 15;

    credibilityScore = Math.min(Math.round(totalReliability), 15);
    const freshnessScore = Math.round(avgFreshness * 15); 
    const completenessScore = (analysis.missing_information && analysis.missing_information.trim().length > 0) || (analysis.contradictions && analysis.contradictions.length > 0) ? 5 : 10;

    const totalScore = officialScore + agreementScore + credibilityScore + freshnessScore + completenessScore;
    
    let level = "Faible";
    if (totalScore >= 80) level = "Très Élevée";
    else if (totalScore >= 60) level = "Élevée";
    else if (totalScore >= 40) level = "Moyenne";

    return {
      confidence_score: totalScore,
      confidence_level: level,
      confidence_explanation: `Le score de confiance (${totalScore}%) est calculé à partir de : présence de sources officielles (${officialScore}/40), concordance entre ${uniqueSources.size} source(s) (${agreementScore}/20), crédibilité des sources (${credibilityScore}/15), fraîcheur de l'information (${freshnessScore}/15) et exhaustivité du contexte (${completenessScore}/10).`,
      confidence_factors: {
        official_sources: officialScore,
        multiple_agreement: agreementScore,
        freshness: freshnessScore,
        credibility: credibilityScore,
        completeness: completenessScore
      }
    };
  }
}
