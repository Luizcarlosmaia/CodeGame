import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const WORKFLOWS_DIR = ".github/workflows";

function collectWorkflowFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      files.push(...collectWorkflowFiles(fullPath));
      continue;
    }
    if (/\.(ya?ml)$/i.test(entry)) files.push(fullPath);
  }
  return files;
}

function lineNumberAt(content, index) {
  return content.slice(0, index).split("\n").length;
}

function validateWorkflowFile(filePath) {
  const content = readFileSync(filePath, "utf8");
  const errors = [];

  // GitHub não permite `secrets` em expressões `if` (job ou step).
  const secretIfPattern = /^\s*if:\s*\$\{\{\s*secrets\./gm;
  for (const match of content.matchAll(secretIfPattern)) {
    errors.push({
      file: filePath,
      line: lineNumberAt(content, match.index ?? 0),
      message:
        "GitHub não aceita secrets em condições if. Use variável de ambiente no shell ou vars.* no if.",
    });
  }

  // ${{ secrets.X }} em env/steps é permitido; só alertamos padrões inválidos comuns.
  if (content.includes("if: secrets.")) {
    errors.push({
      file: filePath,
      line: null,
      message:
        "Encontrado 'if: secrets.' sem ${{ }}. Verifique a sintaxe das condições.",
    });
  }

  return errors;
}

function main() {
  const files = collectWorkflowFiles(WORKFLOWS_DIR);
  const allErrors = files.flatMap(validateWorkflowFile);

  if (allErrors.length === 0) {
    console.log(`Workflows OK (${files.length} arquivo(s) verificados).`);
    return;
  }

  console.error("Workflow inválido para GitHub Actions:\n");
  for (const error of allErrors) {
    const location = error.line ? `${error.file}:${error.line}` : error.file;
    console.error(`  - ${location}: ${error.message}`);
  }
  process.exit(1);
}

main();
