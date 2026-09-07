#!/usr/bin/env node
/**
 * Gera `out/feed.xml` (Atom) com os temas publicados.
 *
 * Por que Atom e não RSS: `updated` é obrigatório e tem semântica definida, o
 * que evita o feed que muda de data a cada build — o jeito mais rápido de
 * fazer um leitor marcar tudo como novo de novo.
 *
 * Sobre as datas: os 30 primeiros temas entraram no mesmo dia, então é a data
 * de lançamento que aparece neles. É a verdade. Tema novo traz `publicadoEm`
 * no frontmatter e sobe para o topo sozinho.
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";

const RAIZ = process.cwd();
const SITE = "https://lumarys.com.br";
const LANCAMENTO = "2026-09-03";
const LIMITE = 50;

const temas = new Map();
for (const arquivo of readdirSync(join(RAIZ, "content", "temas")).filter((f) => f.endsWith(".mdx"))) {
  const { data } = matter(readFileSync(join(RAIZ, "content", "temas", arquivo), "utf8"));
  temas.set(data.slug, data);
}

const dirTrilhas = join(RAIZ, "content", "trilhas");
const entradas = [];

for (const arquivo of readdirSync(dirTrilhas).filter((f) => f.endsWith(".ts") && f !== "index.ts")) {
  const fonte = readFileSync(join(dirTrilhas, arquivo), "utf8");
  const trilhaSlug =
    fonte.match(/slug:\s*"([a-z0-9-]+)",\s*\n\s*tipo:/)?.[1] ?? arquivo.replace(".ts", "");
  const trilhaTitulo = fonte.match(/^\s{2}titulo:\s*"([^"]+)"/m)?.[1] ?? trilhaSlug;

  for (const bloco of fonte.matchAll(
    /\{\s*slug:\s*"([a-z0-9-]+)",\s*titulo:\s*"([^"]+)",[\s\S]*?temas:\s*\[([^\]]*)\]/g,
  )) {
    const moduloSlug = bloco[1];
    for (const [, temaSlug] of bloco[3].matchAll(/"([a-z0-9-]+)"/g)) {
      const tema = temas.get(temaSlug);
      if (!tema) continue;
      entradas.push({
        titulo: tema.titulo,
        resumo: tema.resumo,
        url: `${SITE}/trilhas/${trilhaSlug}/${moduloSlug}/${temaSlug}/`,
        data: tema.publicadoEm ?? LANCAMENTO,
        trilha: trilhaTitulo,
      });
    }
  }
}

// Mais novo primeiro; empate desfeito pelo título, para a saída ser estável
// entre builds (feed que troca de ordem sozinho é feed que reaparece inteiro).
entradas.sort((a, b) => b.data.localeCompare(a.data) || a.titulo.localeCompare(b.titulo, "pt-BR"));
const recentes = entradas.slice(0, LIMITE);

const escapar = (t) =>
  String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const instante = (d) => `${d}T12:00:00-03:00`;
const maisRecente = recentes[0]?.data ?? LANCAMENTO;

const xml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="pt-BR">
  <title>Lumarys — novos temas</title>
  <subtitle>Trilhas de estudo para provas, sabatinas e certificações.</subtitle>
  <link href="${SITE}/feed.xml" rel="self" type="application/atom+xml"/>
  <link href="${SITE}/" rel="alternate" type="text/html"/>
  <id>${SITE}/</id>
  <updated>${instante(maisRecente)}</updated>
  <author><name>Lumarys</name><uri>${SITE}/sobre/</uri></author>
${recentes
  .map(
    (e) => `  <entry>
    <title>${escapar(e.titulo)}</title>
    <link href="${e.url}" rel="alternate" type="text/html"/>
    <id>${e.url}</id>
    <updated>${instante(e.data)}</updated>
    <category term="${escapar(e.trilha)}"/>
    <summary>${escapar(e.resumo)}</summary>
  </entry>`,
  )
  .join("\n")}
</feed>
`;

writeFileSync(join(RAIZ, "out", "feed.xml"), xml);
console.log(`feed: ${recentes.length} entrada(s), mais recente em ${maisRecente}.`);
