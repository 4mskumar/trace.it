import prisma from "../prisma";
import { generateCodeEmbedding } from "./embedding";



export async function embedRepositoryChunks(
  repositoryId: string
) {
  // Fetch chunks that do not have a stored embedding.
  const pendingChunks = await prisma.$queryRaw<
    { id: string; content: string }[]
  >`
    SELECT cc."id", cc."content"
    FROM "CodeChunk" cc
    LEFT JOIN "CodeChunkEmbedding" ce
      ON ce."chunkId" = cc."id"
    WHERE cc."repositoryId" = ${repositoryId}
      AND ce."chunkId" IS NULL
    ORDER BY cc."createdAt" ASC
    LIMIT 100
  `;

  let embeddedCount = 0;

  // Process sequentially to keep the first version simple.
  for (const chunk of pendingChunks) {
    try {
      const vector = await generateCodeEmbedding(
        chunk.content
      );

      const vectorString = `[${vector.join(",")}]`;

      await prisma.$executeRaw`
        INSERT INTO "CodeChunkEmbedding"
          ("chunkId", embedding, model)
        VALUES (
          ${chunk.id},
          ${vectorString}::vector,
          'gemini-embedding-001'
        )
        ON CONFLICT ("chunkId") DO NOTHING
      `;

      embeddedCount++;
    } catch (error) {
      console.error(
        `Failed to embed chunk ${chunk.id}:`,
        error
      );

      // Stop rather than silently skipping failures.
      throw error;
    }
  }

  return {
    embeddedCount,
    remainingBatchLimitReached:
      pendingChunks.length === 100,
  };
}
