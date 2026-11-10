import path from "path";

const externalPackages = new Set([
  "react",
  "next",
  "next-auth",
  "next/server",
  "next/navigation",
  "next/link",
  "@prisma/client",
  "typescript",
]);

export function isExternalImport(importPath: string): boolean {
  if (
    importPath.startsWith(".") ||
    importPath.startsWith("@/")
  ) {
    return false;
  }

  return (
    importPath.startsWith("npm:") ||
    !importPath.startsWith("/")
  );
}

export function resolveImportPath(
  sourceFile: string,
  importPath: string,
  repositoryFiles: string[]
): string | null {
  // External package
  if (isExternalImport(importPath)) {
    return null;
  }

  let resolvedPath: string;

  // @/ alias → repository root
  if (importPath.startsWith("@/")) {
    resolvedPath = importPath.slice(2);
  } else {
    // Relative import
    const sourceDirectory = path.posix.dirname(sourceFile);

    resolvedPath = path.posix.normalize(
      path.posix.join(sourceDirectory, importPath)
    );
  }

  // Remove leading "./"
  resolvedPath = resolvedPath.replace(/^\.\/+/, "");

  // Try exact path first
  if (repositoryFiles.includes(resolvedPath)) {
    return resolvedPath;
  }

  // Try common extensions
  const extensions = [".ts", ".tsx", ".js", ".jsx"];

  for (const extension of extensions) {
    const candidate = `${resolvedPath}${extension}`;

    if (repositoryFiles.includes(candidate)) {
      return candidate;
    }
  }

  // Try index files
  for (const extension of extensions) {
    const candidate = `${resolvedPath}/index${extension}`;

    if (repositoryFiles.includes(candidate)) {
      return candidate;
    }
  }

  return null;
}