#!/usr/bin/env node
/**
 * Injeta em cada página exportada uma Content-Security-Policy com o hash dos
 * scripts inline daquela página.
 *
 * Por que assim e não no CloudFront: o Next.js hidrata a página com scripts
 * inline (self.__next_f.push) cujo conteúdo muda por página e por build. Uma
 * política fixa no CDN só teria duas saídas: 'unsafe-inline', que joga fora a
 * proteção contra XSS justamente onde guardamos o token de sessão, ou uma
 * lista de hashes que não cabe no limite do cabeçalho. Como o site é estático,
 * dá para calcular os hashes no build e colocar a política numa <meta> no
 * topo do <head>. A política passa a viajar com o HTML, e os testes de tela
 * locais passam a exercitá-la — foi a ausência disso que deixou a produção
 * sem hidratação por um dia sem que nenhum teste percebesse.
 *
 * O CloudFront continua respondendo o que a <meta> não consegue expressar:
 * frame-ancestors, HSTS e os demais cabeçalhos.
 */
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const RAIZ = join(process.cwd(), "out");
const API = "https://api.lumarys.com.br";
const COGNITO = "https://cognito-idp.us-east-1.amazonaws.com";

const FIXAS = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "img-src 'self' data: https://i.ytimg.com",
  "media-src 'self' blob:",
  `connect-src 'self' ${API} ${COGNITO}`,
  "frame-src https://www.youtube-nocookie.com",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
];

function* htmls(dir) {
  for (const nome of readdirSync(dir)) {
    const caminho = join(dir, nome);
    if (statSync(caminho).isDirectory()) yield* htmls(caminho);
    else if (nome.endsWith(".html")) yield caminho;
  }
}

// Só scripts INLINE (sem src) precisam de hash; os externos passam por 'self'.
const RE_SCRIPT = /<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
const RE_TIPO = /\btype\s*=\s*["']([^"']+)["']/i;

let paginas = 0;
let hashesTotal = 0;

for (const arquivo of htmls(RAIZ)) {
  let html = readFileSync(arquivo, "utf8");
  // Reprocessar um build já processado não pode duplicar a meta.
  html = html.replace(/<meta http-equiv="Content-Security-Policy"[^>]*>/i, "");

  const hashes = new Set();
  for (const m of html.matchAll(RE_SCRIPT)) {
    const abertura = m[0].slice(0, m[0].indexOf(">") + 1);
    const tipo = RE_TIPO.exec(abertura)?.[1]?.toLowerCase();
    // JSON-LD e outros blocos de dados não executam; não entram na política.
    if (tipo && tipo !== "module" && tipo !== "text/javascript") continue;
    if (!m[1].trim()) continue;
    hashes.add(`'sha256-${createHash("sha256").update(m[1], "utf8").digest("base64")}'`);
  }

  const scriptSrc = ["script-src 'self'", ...hashes].join(" ");
  const politica = [...FIXAS, scriptSrc].join("; ");
  const meta = `<meta http-equiv="Content-Security-Policy" content="${politica}">`;

  if (!html.includes("<head>")) {
    console.error(`sem <head>: ${arquivo}`);
    process.exit(1);
  }
  html = html.replace("<head>", `<head>${meta}`);
  writeFileSync(arquivo, html, "utf8");

  paginas++;
  hashesTotal += hashes.size;
}

console.log(`csp: ${paginas} página(s), ${hashesTotal} hash(es) de script inline.`);
