import prisma from "../prisma";


export async function createRepositoryChunks(
  repositoryId: string
) {
  const files = await prisma.repositoryFiles.findMany({
    where: {
      repositoryId,
      content: {
        not: null,
      },
    },
  });

  const entities = await prisma.codeEntity.findMany({
    where: {
      repositoryId,
    },
  });

  let totalChunks = 0;

  for (const entity of entities) {
    const file = files.find(
      (file) => file.path === entity.filePath
    );

    if (!file?.content) continue;

    const lines = file.content.split("\n");

    const start = entity.startLine
      ? entity.startLine - 1
      : 0;

    const end = entity.endLine
      ? entity.endLine
      : lines.length;

    const content = lines
      .slice(start, end)
      .join("\n");

    if (!content.trim()) continue;

    await prisma.codeChunk.create({
      data: {
        content,
        filePath: entity.filePath,
        startLine: entity.startLine ?? 1,
        endLine: entity.endLine ?? lines.length,
        entityId: entity.id,
        repositoryId,
      },
    });

    totalChunks++;
  }

  return totalChunks;
}