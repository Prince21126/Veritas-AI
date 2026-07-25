import { GoogleGenAI } from "@google/genai";
async function list() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response: any = await ai.models.list();
  for (const m of response.models) {
    if (m.supportedActions?.includes("generateContent")) {
      console.log(m.name);
    }
  }
}
list().catch(console.error);
