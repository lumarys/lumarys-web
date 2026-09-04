#!/usr/bin/env node
/**
 * Dá extensão .png à imagem de compartilhamento que o export escreve sem
 * extensão (`/opengraph-image`), e corrige as referências nas páginas.
 *
 * Por que: a função de borda do CloudFront trata todo caminho sem ponto como
 * página e reescreve para `/caminho/index.html`; sem extensão, a imagem viraria
 * 404 em produção. E o S3 só adivinha o content-type pela extensão. Renomear
 * no build resolve os dois sem tocar na infra.
 */
import { readdirSync, readFileSync, renameSync, statSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";

const RAIZ = join(process.cwd(), "out");
const NOME = "opengraph-image";

function* arquivos(dir) {
  for (const nome of readdirSync(dir)) {
    const caminho = join(dir, nome);
    if (statSync(caminho).isDirectory()) yield* arquivos(caminho);
    else yield caminho;
  }
}

let imagens = 0;
let paginas = 0;
const textos = [];

for (const caminho of arquivos(RAIZ)) {
  if (basename(caminho) === NOME) {
    renameSync(caminho, `${caminho}.png`);
    imagens++;
  } else if (caminho.endsWith(".html") || caminho.endsWith(".txt")) {
    textos.push(caminho);
  }
}

// Só a referência à rota da imagem, seguida de query (o hash do build) ou do
// fim do atributo — nunca o texto de uma página.
const RE = new RegExp(`/${NOME}(?=[?"\\\\])`, "g");
for (const caminho of textos) {
  const antes = readFileSync(caminho, "utf8");
  const depois = antes.replace(RE, `/${NOME}.png`);
  if (antes !== depois) {
    writeFileSync(caminho, depois);
    paginas++;
  }
}

console.log(
  `og-extensao: ${imagens} imagem(ns) renomeada(s), ${paginas} arquivo(s) apontando para .png.`,
);
