import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult } from '../types';

// Initialize Gemini
// NOTE: process.env.API_KEY is assumed to be present as per instructions.
// If running locally without env, this will throw. We handle errors gracefully in components.
const apiKey = process.env.API_KEY || "mock-api-key"; 
const ai = new GoogleGenAI({ apiKey });

/**
 * Analyzes an image to generate title, description, and metadata.
 */
export const analyzeImageWithGemini = async (base64Data: string): Promise<AIAnalysisResult> => {
  if (apiKey === "mock-api-key") {
    // Mock response for demo purposes if no key provided
    return new Promise(resolve => setTimeout(() => resolve({
      title: "Detected Object",
      description: "A detailed description of the object found in the image. It appears to be a personal item.",
      category: "Other",
      keywords: ["object", "item", "lost"]
    }), 1500));
  }

  try {
    // Clean base64 string if it has the data prefix
    const cleanBase64 = base64Data.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', // Capable multimodal model
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64
            }
          },
          {
            text: `Analyze this image of a lost/found item. 
            Provide a JSON response with:
            - title: A short, concise title (max 5 words).
            - description: A visual description (color, brand, distinguishing features).
            - category: Best fit from [Electronics, Clothing, Keys, Wallet/Purse, ID/Cards, Books/Notes, Accessories, Other].
            - keywords: Array of 5 strings for search matching.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            category: { type: Type.STRING },
            keywords: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as AIAnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Fallback
    return {
      title: "Unknown Item",
      description: "Could not analyze image.",
      category: "Other",
      keywords: []
    };
  }
};

/**
 * Checks for potential matches between a new item and existing items.
 * This is a simplified client-side check. In production, this would be a vector search.
 */
export const findSmartMatches = async (newItem: AIAnalysisResult, existingItems: any[]): Promise<string[]> => {
  // Simple filter logic first
  const candidates = existingItems.filter(item => 
    item.category === newItem.category || 
    newItem.keywords.some(k => item.description.toLowerCase().includes(k.toLowerCase()))
  ).slice(0, 10); // Take top 10 candidates

  if (candidates.length === 0) return [];
  if (apiKey === "mock-api-key") return candidates.map(c => c.id);

  // Use Gemini to rank/validate matches
  try {
    const prompt = `
      I have a new item: ${JSON.stringify(newItem)}.
      Here is a list of existing items: ${JSON.stringify(candidates.map(c => ({ id: c.id, title: c.title, desc: c.description })))}.
      Return a JSON array of IDs from the existing items list that are highly likely to be the same item based on description.
      If none match, return empty array.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Match error", e);
    return [];
  }
};
