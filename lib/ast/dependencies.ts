import prisma from "../prisma";
import { parseImports } from "./parser";
import { isExternalImport, resolveImportPath } from "./resolver";

export async function parseRepositoryDependencies(repositoryId: string) {
  const files = await prisma.repositoryFiles.findMany({
    where: {
      repositoryId,
      content: {
        not: null,
      },
    },
    select: {
      path: true,
      content: true,
    },
  });

  const repositoryFiles = files.map((file) => file.path);

  let totalDependencies = 0;

  for (const file of files) {
    if (!file.content) continue;

    const imports = parseImports(file.content);

    console.log("File:", file.path);
    console.log("Parsed imports:", imports);

    if (imports.length === 0) continue;

    const dependencies = imports.map((item) => {
      const external = isExternalImport(item.targetPath);

      const resolvedPath = external
        ? null
        : resolveImportPath(file.path, item.targetPath, repositoryFiles);

      return {
        sourceFile: file.path,
        targetPath: item.targetPath,
        resolvedPath,
        importName: item.importName,
        isExternal: external,
        repositoryId,
      };
    });

    await prisma.codeDependency.createMany({
      data: dependencies,
      skipDuplicates: true,
    });

    totalDependencies += dependencies.length;
  }

  return totalDependencies;
}
