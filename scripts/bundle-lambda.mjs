#!/usr/bin/env node
/**
 * Empacota um serviço em dist/lambda.zip com esbuild.
 *   node scripts/bundle-lambda.mjs services/progress-api
 * O SDK da AWS fica externo: já vem no runtime da Lambda.
 */
import { build } from "esbuild";
import AdmZip from "adm-zip";
import { statSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const dir = process.argv[2];
if (!dir) {
  console.error("uso: node scripts/bundle-lambda.mjs <diretorio-do-servico>");
  process.exit(1);
}

const saida = resolve(dir, "dist");
mkdirSync(saida, { recursive: true });
const arquivo = resolve(saida, "index.mjs");

await build({
  entryPoints: [resolve(dir, "src/index.ts")],
  outfile: arquivo,
  bundle: true,
  platform: "node",
  target: "node24",
  format: "esm",
  external: ["@aws-sdk/*"],
  banner: {
    js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
  },
  minify: false,
  sourcemap: false,
});

const zip = new AdmZip();
zip.addLocalFile(arquivo);
const caminhoZip = resolve(saida, "lambda.zip");
zip.writeZip(caminhoZip);

const mb = statSync(caminhoZip).size / (1024 * 1024);
console.log(`bundle: ${caminhoZip} (${mb.toFixed(2)} MB)`);
if (mb > 5) {
  console.error("bundle acima de 5 MB — revisar dependências");
  process.exit(1);
}
