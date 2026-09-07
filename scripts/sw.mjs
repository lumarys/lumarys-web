#!/usr/bin/env node
/**
 * Gera `out/sw.js` no postbuild.
 *
 * Por que um service worker escrito à mão e não uma biblioteca: o site é
 * estático e a política de conteúdo não admite script de terceiro, então
 * qualquer runtime de PWA teria de ser embutido e auditado. O que precisamos
 * cabe em cem linhas.
 *
 * Estratégia, e o motivo de cada escolha:
 *
 * - **Navegação (HTML): rede primeiro, cache como rede reserva.** O contrário
 *   — cache primeiro — deixaria a pessoa vendo um deploy antigo por tempo
 *   indeterminado, que é o modo clássico de um PWA estragar um site.
 * - **Estáticos do Next (`/_next/static/...`): cache primeiro.** O nome já
 *   carrega o hash do conteúdo, então um arquivo com aquele nome nunca muda.
 * - **Nada de API.** Progresso e conta passam por `connect-src`; guardar
 *   resposta de API aqui criaria uma segunda fonte de verdade do progresso,
 *   que é exatamente o que `storage.mesclar` existe para evitar.
 *
 * A versão do cache vem do conteúdo do build: um deploy novo troca o nome do
 * cache, e o `activate` apaga os antigos.
 */
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const RAIZ = join(process.cwd(), "out");

/** Casca mínima: o que precisa existir para o app abrir sem rede. */
const CASCA = ["/", "/hoje/", "/cards/", "/simulado/", "/offline/", "/manifest.webmanifest"];

function arquivosDe(dir) {
  const saida = [];
  for (const nome of readdirSync(dir)) {
    const caminho = join(dir, nome);
    if (statSync(caminho).isDirectory()) saida.push(...arquivosDe(caminho));
    else saida.push(caminho);
  }
  return saida;
}

// A versão muda quando qualquer HTML ou estático muda.
const digestor = createHash("sha256");
for (const caminho of arquivosDe(RAIZ).sort()) {
  if (caminho.endsWith(".html") || caminho.includes("/_next/static/")) {
    digestor.update(readFileSync(caminho));
  }
}
const versao = digestor.digest("hex").slice(0, 12);

const sw = `/* Gerado por scripts/sw.mjs. Não edite à mão. */
const VERSAO = ${JSON.stringify(versao)};
const CACHE = "lumarys-" + VERSAO;
const CASCA = ${JSON.stringify(CASCA)};

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches.open(CACHE).then((cache) =>
      // addAll falha inteiro se um item falhar; aqui cada item é opcional,
      // porque uma casca incompleta é melhor que nenhuma.
      Promise.all(CASCA.map((url) => cache.add(url).catch(() => null))),
    ),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((nomes) => Promise.all(nomes.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (evento) => {
  const pedido = evento.request;
  if (pedido.method !== "GET") return;

  const url = new URL(pedido.url);
  if (url.origin !== self.location.origin) return;

  // Estático com hash no nome: o conteúdo daquele nome nunca muda.
  if (url.pathname.startsWith("/_next/static/")) {
    evento.respondWith(
      caches.match(pedido).then(
        (guardado) =>
          guardado ||
          fetch(pedido).then((resposta) => {
            if (resposta.ok) guardar(pedido, resposta.clone());
            return resposta;
          }),
      ),
    );
    return;
  }

  if (pedido.mode === "navigate") {
    evento.respondWith(
      fetch(pedido)
        .then((resposta) => {
          if (resposta.ok) guardar(pedido, resposta.clone());
          return resposta;
        })
        .catch(() =>
          caches
            .match(pedido)
            .then((guardado) => guardado || caches.match("/offline/"))
            .then((resposta) => resposta || Response.error()),
        ),
    );
  }
});

function guardar(pedido, resposta) {
  caches.open(CACHE).then((cache) => cache.put(pedido, resposta)).catch(() => {});
}
`;

writeFileSync(join(RAIZ, "sw.js"), sw);
console.log(`sw: versão ${versao}, casca com ${CASCA.length} entrada(s).`);
