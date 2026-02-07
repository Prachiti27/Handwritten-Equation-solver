
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { MathSolution } from "../types";

export const solveEquation = async (base64Image: string): Promise<MathSolution> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const imagePart = {
    inlineData: {
      mimeType: 'image/png',
      data: base64Image.split(',')[1], 
    },
  };

  const prompt = `Analyze this handwritten mathematical equation. 
  1. Transcribe it into clear text and LaTeX format.
  2. Solve it step-by-step.
  3. Provide the final result.
  Return the answer in a structured JSON format.`;

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [imagePart, { text: prompt }] },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          equation: { type: Type.STRING, description: "Plain text transcription" },
          latex: { type: Type.STRING, description: "LaTeX formatted equation" },
          result: { type: Type.STRING, description: "Final numerical or algebraic result" },
          steps: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Step-by-step solution process"
          },
          explanation: { type: Type.STRING, description: "A brief summary of the mathematical concepts used" }
        },
        required: ["equation", "latex", "result", "steps", "explanation"],
      }
    },
  });

  const resultText = response.text;
  if (!resultText) throw new Error("Failed to get response from AI");
  
  return JSON.parse(resultText) as MathSolution;
};
