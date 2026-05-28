import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const args = process.argv.slice(2);
const skipInstall = args.includes("--skip-install");
const skipE2e = args.includes("--skip-e2e");
const forceE2e = args.includes("--force-e2e");

function loadDotEnv() {
  if (!existsSync(".env")) return;

  for (const rawLine of readFileSync(".env", "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const separator = line.indexOf("=");
    if (separator <= 0) continue;

    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

function run(label, command, commandArgs = [], env = process.env) {
  console.log(`\n=== ${label} ===`);
  console.log(`> ${command} ${commandArgs.join(" ")}`);

  const result = spawnSync(command, commandArgs, {
    stdio: "inherit",
    shell: true,
    env,
  });

  if (result.status !== 0) {
    console.error(`\nFalhou em: ${label}`);
    process.exit(result.status ?? 1);
  }
}

function hasNeonKey() {
  return Boolean(process.env.NEON_API_KEY || process.env.DATABASE_URL);
}

loadDotEnv();

console.log("CI local — espelha .github/workflows/ci.yml");
console.log(`Node ${process.version}`);

run("Validar workflows", "node", ["scripts/validate-workflow.mjs"]);

if (!skipInstall) {
  run("Instalar dependências (npm ci)", "npm", ["ci"]);
}

run("Lint", "npm", ["run", "lint"]);
run("Testes unitários e integração", "npm", ["test"]);
run("Build", "npm", ["run", "build"]);

const neonConfigured = hasNeonKey();

if (skipE2e) {
  console.log("\nE2E pulado (--skip-e2e).");
  process.exit(0);
}

if (!neonConfigured && !forceE2e) {
  console.log(
    "\nNEON_API_KEY/DATABASE_URL não configurada; pulando API E2E e Playwright (igual ao CI)."
  );
  process.exit(0);
}

if (!neonConfigured && forceE2e) {
  console.error("\n--force-e2e exige NEON_API_KEY ou DATABASE_URL no ambiente/.env.");
  process.exit(1);
}

run("Testes API E2E", "npm", ["run", "test:api-e2e"]);
run("Instalar Chromium (Playwright)", "npx", [
  "playwright",
  "install",
  "chromium",
]);
run("Testes E2E (Playwright)", "npm", ["run", "test:e2e"], {
  ...process.env,
  CI: "true",
});

console.log("\nCI local concluído com sucesso.");
