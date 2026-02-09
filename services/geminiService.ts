
import { GoogleGenAI, Type } from "@google/genai";
import { AUDIT_SYSTEM_PROMPT } from "../constants";
import { BeliefState } from "../types";

export class GeminiService {
  async auditInput(
    userMessage: string, 
    currentState: BeliefState, 
    imageBase64?: string
  ): Promise<BeliefState> {
    // Fixed: Create new instance right before call using process.env.API_KEY directly.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const parts: any[] = [
      { text: AUDIT_SYSTEM_PROMPT },
      { text: `[SYSTEM_STATE]: Domain: ${currentState.scenario}. Active Invariants: ${currentState.logicalInvariants.join(", ")}.` },
      { text: `[USER_DATA_INPUT]: "${userMessage || "Visual telemetry provided."}"` }
    ];

    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: imageBase64.split(",")[1] || imageBase64
        }
      });
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: { parts },
        config: {
          thinkingConfig: { thinkingBudget: 16000 },
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              scenario: { type: Type.STRING },
              text: { type: Type.STRING },
              hypothesis: { type: Type.STRING },
              internalMonologue: { type: Type.STRING },
              thinkingOutput: { type: Type.STRING },
              cognitiveDissonance: { type: Type.NUMBER },
              logicalInvariants: { type: Type.ARRAY, items: { type: Type.STRING } },
              logicChain: { type: Type.ARRAY, items: { type: Type.STRING } },
              physicalMetrics: {
                type: Type.OBJECT,
                properties: {
                  entropy: { type: Type.NUMBER },
                  symmetry: { type: Type.NUMBER },
                  density: { type: Type.NUMBER },
                  primaryGeometry: { type: Type.STRING }
                }
              },
              nextDirective: { type: Type.STRING },
              calibrationStage: {
                type: Type.OBJECT,
                properties: {
                  current: { type: Type.NUMBER },
                  total: { type: Type.NUMBER },
                  title: { type: Type.STRING },
                  objectives: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              },
              confidence: { type: Type.NUMBER }
            },
            required: ["scenario", "text", "cognitiveDissonance", "logicalInvariants"]
          }
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      
      const grounding = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const urls = grounding?.map((chunk: any) => ({
        title: chunk.web?.title || "Clinical Reference",
        uri: chunk.web?.uri
      })).filter((u: any) => u.uri) || [];

      return { ...parsed, groundingUrls: urls, lastUpdated: Date.now() };
    } catch (error: any) {
      console.error("Negotiation Critical Failure:", error);
      // Fixed: Handle key selection reset using aistudio interface casting for type safety
      if (error.message?.includes("Requested entity was not found")) {
        // @ts-ignore
        await window.aistudio.openSelectKey();
      }
      throw error;
    }
  }

  async rationalizeVisual(prompt: string, imageBase64: string, state: BeliefState): Promise<string> {
    // Fixed: Initializing instance with process.env.API_KEY directly
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const styleBias = state.cognitiveDissonance > 0.6 
      ? "Chaotic human-abstract, hand-drawn blueprint with emotional annotations" 
      : "Extreme clinical-industrial, blueprint for a high-precision machine";
    
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: imageBase64.split(",")[1] || imageBase64 } },
          { text: `RATIONALIZE REALITY: Current Scenario [${state.scenario}]. Dissonance Level [${state.cognitiveDissonance}]. Invariants [${state.logicalInvariants.join(", ")}]. Create a high-tech blueprint representing the AI's final belief. Style: ${styleBias}, Emerald Grid, Technical Callouts, Neon Accents.` }
        ]
      },
      config: { imageConfig: { aspectRatio: "16:9", imageSize: "1K" } }
    });

    for (const part of response.candidates?.[0]?.content.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("Visual rationalization failed.");
  }
}
