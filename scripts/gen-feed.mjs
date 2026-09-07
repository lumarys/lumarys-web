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
import { lerTrilhasNaOrdem } from "./_temas.mjs";

const RAIZ = process.cwd();
const SITE = "https://lumarys.com.br";
const LANCAMENTO = "2026-09-03";
const LIMITE = 50;

const temas = new Map();
for (const arquivo of readdirSync(join(RAIZ, "content", "temas")).filter((f) =>
  f.endsWith(".mdx"),
)) {
  const { data } = matter(readFileSync(join(RAIZ, "content", "temas", arquivo), "utf8"));
  temas.set(data.slug, data);
}

const entradas = [];
// Um tema compartilhado entra uma vez, pela trilha canônica — a primeira do
// catálogo que o contém. Duas URLs para o mesmo texto seriam duas entradas
// iguais no leitor de quem assina.
const vistos = new Set();

for (const trilha of lerTrilhasNaOrdem()) {
  for (const modulo of trilha.modulos) {
    for (const temaSlug of modulo.temas) {
      const tema = temas.get(temaSlug);
      if (!tema || vistos.has(temaSlug)) continue;
      vistos.add(temaSlug);
      entradas.push({
        titulo: tema.titulo,
        resumo: tema.resumo,
        url: `${SITE}/trilhas/${trilha.slug}/${modulo.slug}/${temaSlug}/`,
        data: tema.publicadoEm ?? LANCAMENTO,
        trilha: trilha.titulo,
      });
    }
  }
}

// Mais novo primeiro; empate desfeito pelo título, para a saída ser estável
// entre builds (feed que troca de ordem sozinho é feed que reaparece inteiro).
entradas.sort((a, b) => b.data.localeCompare(a.data) || a.titulo.localeCompare(b.titulo, "pt-BR"));
const recentes = entradas.slice(0, LIMITE);

// Aspas e apóstrofo entram na lista porque o mesmo escape serve a texto de
// elemento E a valor de atributo (`term="..."`): um título com aspas partiria
// o atributo e invalidaria o feed inteiro.
const escapar = (t) =>
  String(t)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
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
