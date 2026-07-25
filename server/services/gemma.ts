import { GoogleGenAI, Type, Schema } from "@google/genai";

export class GemmaService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  async generate(prompt: string, context?: string): Promise<string> {
    const fullPrompt = context ? `CONTEXT:\n${context}\n\nINSTRUCTIONS:\n${prompt}` : prompt;
    
    let retries = 5;
    let delay = 2000;
    while (retries > 0) {
      try {
        const response = await this.ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: fullPrompt,
          config: {
            temperature: 0.2,
          },
        });
        return response.text || "";
      } catch (e: any) {
        if (e?.status === 503 || e?.status === 429 || e?.message?.includes("503") || e?.message?.includes("429") || e?.message?.includes("RESOURCE_EXHAUSTED")) {
          retries--;
          if (retries === 0) throw e;

          // Try to extract retry delay from details
          let waitTime = delay;
          if (e.details) {
            const retryInfo = e.details.find((d: any) => d['@type']?.includes('RetryInfo'));
            if (retryInfo && retryInfo.retryDelay) {
              const seconds = parseInt(retryInfo.retryDelay);
              if (!isNaN(seconds)) waitTime = seconds * 1000;
            }
          }
          
          console.warn(`[Gemma] Rate limit / 503, retrying in ${waitTime}ms...`);
          await new Promise(r => setTimeout(r, waitTime));
          delay *= 2;
        } else {
          console.error("Gemma generation error:", e);
          throw e;
        }
      }
    }
    return "";
  }

  async generateJson(prompt: string, schema: Schema): Promise<any> {
    let retries = 5;
    let delay = 2000;
    while (retries > 0) {
      try {
        const response = await this.ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: prompt,
          config: {
            temperature: 0.1,
            responseMimeType: "application/json",
            responseSchema: schema,
          },
        });
        
        const text = response.text || "{}";
        return JSON.parse(text);
      } catch (e: any) {
        if (e?.status === 503 || e?.status === 429 || e?.message?.includes("503") || e?.message?.includes("429") || e?.message?.includes("RESOURCE_EXHAUSTED")) {
          retries--;
          if (retries === 0) {
            console.error("Gemma JSON generation error:", e);
            throw e;
          }

          // Try to extract retry delay from details
          let waitTime = delay;
          if (e.details) {
            const retryInfo = e.details.find((d: any) => d['@type']?.includes('RetryInfo'));
            if (retryInfo && retryInfo.retryDelay) {
              const seconds = parseInt(retryInfo.retryDelay);
              if (!isNaN(seconds)) waitTime = seconds * 1000;
            }
          }

          console.warn(`[Gemma] Rate limit / 503, retrying in ${waitTime}ms...`);
          await new Promise(r => setTimeout(r, waitTime));
          delay *= 2;
        } else {
          console.error("Gemma JSON generation error:", e);
          throw e;
        }
      }
    }
    return {};
  }
}

export const gemma = new GemmaService();





