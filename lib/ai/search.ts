

import { GoogleGenAI } from "@google/genai";
import prisma from "../prisma";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function searchCodeChunks(
  repositoryId: string,
  question: string,
  limit = 5
) {
  const result = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: question,
    config: {
      taskType: "CODE_RETRIEVAL_QUERY",
      outputDimensionality: 768,
    },
  });

  const vector = result.embeddings?.[0]?.values;

  if (!vector?.length) {
    throw new Error("Failed to generate query embedding");
  }

  const vectorString = `[${vector.join(",")}]`;

  const safeLimit = Math.max(1, Math.min(limit, 10));

  const chunks = await prisma.$queryRaw<
    {
      id: string;
      content: string;
      filePath: string;
      startLine: number;
      endLine: number;
      similarity: number;
    }[]
  >`
    SELECT
      cc."id",
      cc."content",
      cc."filePath",
      cc."startLine",
      cc."endLine",
      1 - (ce.embedding <=> ${vectorString}::vector)
        AS similarity
    FROM "CodeChunkEmbedding" ce
    JOIN "CodeChunk" cc
      ON cc."id" = ce."chunkId"
    WHERE cc."repositoryId" = ${repositoryId}
    ORDER BY ce.embedding <=> ${vectorString}::vector
    LIMIT ${safeLimit}
  `;

  return chunks;
}
