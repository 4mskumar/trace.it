export function isCodeFile(path: string) {
  const allowedExtensions = [
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".py",
    ".java",
    ".c",
    ".cpp",
    ".h",
    ".hpp",
    ".cs",
    ".go",
    ".rs",
    ".php",
    ".rb",
    ".sql",
    ".prisma",
    ".json",
    ".md",
    ".yml",
    ".yaml",
    ".css",
    ".scss",
    ".html",
  ];

  return allowedExtensions.some((extension) =>
    path.endsWith(extension)
  );
}