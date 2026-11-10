
import prisma from "../prisma";
import { parseTypeScript } from "./parser";

const supportedExtensions = new Set(["ts", "tsx", "js", "jsx"]);

export async function parseRepositoryFiles(repositoryId: string) {
  const files = await prisma.repositoryFiles.findMany({
    where: {
      repositoryId,
      content: {
        not: null,
      },
    },
  });

  let totalEntities = 0;

  for (const file of files) {
    if (!file.content || !file.extension) {
      continue;
    }

    if (!supportedExtensions.has(file.extension)) {
      continue;
    }

    const entities = parseTypeScript(file.content);

    if (entities.length === 0) {
      continue;
    }

    await prisma.codeEntity.createMany({
      data: entities.map((entity) => ({
        type: entity.type,
        name: entity.name,
        filePath: file.path,
        startLine: entity.startLine,
        endLine: entity.endLine,
        repositoryId,
      })),
      skipDuplicates: true,
    });

    totalEntities += entities.length;
  }

  return totalEntities;
}
