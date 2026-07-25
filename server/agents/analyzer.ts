import { gemma } from "../services/gemma";
import { promptManager } from "../services/prompt_manager";
import { Type } from "@google/genai";

export class AnalyzerAgent {
  async process(userQuery: string, context: string) {
    const sys = promptManager.getSystemPrompt();
    const tpl = promptManager.getPrompt("analysis", { user_query: userQuery, context });
    
    return await gemma.generateJson(`${sys}\n\n${tpl}`, {
      type: Type.OBJECT,
      properties: {
        intent: { type: Type.STRING },
        category: { type: Type.STRING },
        extracted_entities: { type: Type.ARRAY, items: { type: Type.STRING } },
        risk_level: { type: Type.STRING },
        impact_level: { type: Type.STRING },
        verification_status: { type: Type.STRING },
        reasoning: { type: Type.STRING },
        supporting_evidence: { type: Type.ARRAY, items: { type: Type.STRING } },
        contradictions: { type: Type.ARRAY, items: { type: Type.STRING } },
        missing_information: { type: Type.STRING },
        responsible_advice: { type: Type.STRING },
        summary: { type: Type.STRING },
      }
    });
  }
}
