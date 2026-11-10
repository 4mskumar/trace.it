import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function generateCodeEmbedding(
  code: string
): Promise<number[]> {
  const result = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: code,
    config: {
      taskType: "RETRIEVAL_DOCUMENT",
      outputDimensionality: 768,
    },
  });

  const values = result.embeddings?.[0]?.values;

  if (!values?.length) {
    throw new Error("Gemini returned an empty embedding");
  }

  return values;
}