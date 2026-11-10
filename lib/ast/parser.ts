import ts from "typescript";

export type ParsedEntity = {
  type: string;
  name: string;
  startLine: number;
  endLine: number;
};

export type ParsedImport = {
    targetPath: string,
    importName ?: string
}



export function parseTypeScript(
  code: string
): ParsedEntity[] {
  const sourceFile = ts.createSourceFile(
    "file.ts",
    code,
    ts.ScriptTarget.Latest,
    true
  );

  const entities: ParsedEntity[] = [];

  function visit(node: ts.Node) {
    // Functions
    if (
      ts.isFunctionDeclaration(node) &&
      node.name
    ) {
      entities.push({
        type: "function",
        name: node.name.text,
        startLine:
          sourceFile.getLineAndCharacterOfPosition(
            node.getStart()
          ).line + 1,
        endLine:
          sourceFile.getLineAndCharacterOfPosition(
            node.getEnd()
          ).line + 1,
      });
    }

    // Classes
    if (
      ts.isClassDeclaration(node) &&
      node.name
    ) {
      entities.push({
        type: "class",
        name: node.name.text,
        startLine:
          sourceFile.getLineAndCharacterOfPosition(
            node.getStart()
          ).line + 1,
        endLine:
          sourceFile.getLineAndCharacterOfPosition(
            node.getEnd()
          ).line + 1,
      });
    }

    // Interfaces
    if (
      ts.isInterfaceDeclaration(node)
    ) {
      entities.push({
        type: "interface",
        name: node.name.text,
        startLine:
          sourceFile.getLineAndCharacterOfPosition(
            node.getStart()
          ).line + 1,
        endLine:
          sourceFile.getLineAndCharacterOfPosition(
            node.getEnd()
          ).line + 1,
      });
    }

    // Variables
    if (
      ts.isVariableStatement(node)
    ) {
      for (const declaration of node.declarationList
        .declarations) {
        if (ts.isIdentifier(declaration.name)) {
          entities.push({
            type: "variable",
            name: declaration.name.text,
            startLine:
              sourceFile.getLineAndCharacterOfPosition(
                declaration.getStart()
              ).line + 1,
            endLine:
              sourceFile.getLineAndCharacterOfPosition(
                declaration.getEnd()
              ).line + 1,
          });
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  return entities;
}

export function parseImports(code: string): ParsedImport[] {
  const sourceFile = ts.createSourceFile(
    "file.ts",
    code,
    ts.ScriptTarget.Latest,
    true
  );

  const imports: ParsedImport[] = [];

  function visit(node: ts.Node) {
    if (ts.isImportDeclaration(node)) {
      const targetPath = (node.moduleSpecifier as ts.StringLiteral).text;

      let importName: string | undefined;

      if (node.importClause) {
        if (node.importClause.name) {
          // default import
          importName = node.importClause.name.text;
        } else if (node.importClause.namedBindings) {
          if (ts.isNamedImports(node.importClause.namedBindings)) {
            importName = node.importClause.namedBindings.elements
              .map((element) => element.name.text)
              .join(", ");
          } else if (ts.isNamespaceImport(node.importClause.namedBindings)) {
            importName = node.importClause.namedBindings.name.text;
          }
        }
      }

      imports.push({
        targetPath,
        importName,
      });
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  return imports;
}