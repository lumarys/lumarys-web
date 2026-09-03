#!/usr/bin/env node
/**
 * Gera os arquivos que agentes de IA leem (llms.txt, llms-full.txt) e uma
 * versão Markdown de cada tema. Roda antes do build, para que tudo saia em
 * public/ e seja copiado para o export estático.
 */
import { mkdirSync, writeFileSync, readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import matter from "gray-matter";

const RAIZ = process.cwd();
const SITE = "https://lumarys.com.br";
const PUBLICO = join(RAIZ, "public");

const temas = new Map();
const dirTemas = join(RAIZ, "content", "temas");
if (existsSync(dirTemas)) {
  for (const arquivo of readdirSync(dirTemas).filter((f) => f.endsWith(".mdx")).sort()) {
    const { data, content } = matter(readFileSync(join(dirTemas, arquivo), "utf8"));
    temas.set(data.slug, { ...data, corpo: content.trim() });
  }
}

// As trilhas são TypeScript; extraímos o que precisamos do texto do arquivo.
const dirTrilhas = join(RAIZ, "content", "trilhas");
const trilhas = [];
for (const arquivo of readdirSync(dirTrilhas).filter((f) => f.endsWith(".ts") && f !== "index.ts")) {
  const fonte = readFileSync(join(dirTrilhas, arquivo), "utf8");
  const campo = (nome) => fonte.match(new RegExp(`^\\s{2}${nome}:\\s*\\n?\\s*"([^"]+)"`, "m"))?.[1]
    ?? fonte.match(new RegExp(`${nome}:\\s*"([^"]+)"`))?.[1] ?? "";
  const modulos = [];
  for (const bloco of fonte.matchAll(/\{\s*slug:\s*"([a-z0-9-]+)",\s*titulo:\s*"([^"]+)",[\s\S]*?temas:\s*\[([^\]]*)\]/g)) {
    modulos.push({
      slug: bloco[1],
      titulo: bloco[2],
      temas: [...bloco[3].matchAll(/"([a-z0-9-]+)"/g)].map((m) => m[1]),
    });
  }
  trilhas.push({
    slug: fonte.match(/slug:\s*"([a-z0-9-]+)",\s*\n\s*tipo:/)?.[1] ?? arquivo.replace(".ts", ""),
    titulo: campo("titulo"),
    origem: campo("origem"),
    resumo: campo("resumo"),
    modulos,
  });
}

function urlTema(trilha, modulo, tema) {
  return `/trilhas/${trilha}/${modulo}/${tema}/`;
}

/* ------------------------------- llms.txt -------------------------------- */

const indice = [
  "# Lumarys",
  "",
  "> Trilhas de estudo para as provas, sabatinas e certificações que as empresas pedem.",
  "> Cada trilha parte de uma ementa oficial e vira estudo ativo: vídeo em português,",
  "> explicação própria, repetição espaçada e simulado no formato real da prova.",
  "> Lumarys é uma marca da Cernyn (cernyn.com), Joinville-SC, CNPJ 65.962.788/0001-62.",
  "",
  "Conteúdo em português do Brasil. Licença do conteúdo: CC BY-NC-SA 4.0.",
  "Ao citar, atribua a Lumarys e linke a página do tema.",
  "",
];

for (const trilha of trilhas) {
  indice.push(`## ${trilha.titulo}`, "");
  if (trilha.resumo) indice.push(`${trilha.resumo}`, "");
  indice.push(`Origem da ementa: ${trilha.origem}`, `Página: ${SITE}/trilhas/${trilha.slug}/`, "");
  for (const modulo of trilha.modulos) {
    const disponiveis = modulo.temas.filter((t) => temas.has(t));
    if (disponiveis.length === 0) continue;
    indice.push(`### ${modulo.titulo}`, "");
    for (const slug of disponiveis) {
      const tema = temas.get(slug);
      indice.push(`- [${tema.titulo}](${SITE}${urlTema(trilha.slug, modulo.slug, slug)}): ${tema.resumo}`);
    }
    indice.push("");
  }
}

indice.push("## Páginas", "");
indice.push(`- [O método](${SITE}/metodo/): os nove princípios de Ultraaprendizado aplicados ao site.`);
indice.push(`- [Sobre](${SITE}/sobre/): quem publica, política editorial e como corrigir um erro.`);
indice.push(`- [Privacidade](${SITE}/privacidade/) · [Termos](${SITE}/termos/)`);
indice.push("");

writeFileSync(join(PUBLICO, "llms.txt"), indice.join("\n"), "utf8");

/* ----------------------------- llms-full.txt ------------------------------ */

const completo = [...indice, "---", ""];

for (const trilha of trilhas) {
  for (const modulo of trilha.modulos) {
    for (const slug of modulo.temas.filter((t) => temas.has(t))) {
      const tema = temas.get(slug);
      completo.push(
        `# ${tema.titulo}`,
        "",
        `Trilha: ${trilha.titulo} · Módulo: ${modulo.titulo}`,
        `URL: ${SITE}${urlTema(trilha.slug, modulo.slug, slug)}`,
        `Tempo estimado: ${tema.minutos} minutos · Nível: ${tema.nivel}`,
        "",
        `**Resumo.** ${tema.resumo}`,
        "",
        `**Por que cai na prova.** ${tema.porQue}`,
        "",
        `**Como o entrevistador pergunta.** "${tema.comoCai}"`,
        "",
        tema.corpo,
        "",
        "## Erros comuns",
        "",
        ...(tema.errosComuns ?? []).map((e) => `- ${e}`),
        "",
        "## Perguntas de sabatina e respostas-modelo",
        "",
      );
      for (const p of tema.perguntas ?? []) {
        if (p.tipo !== "oral") continue;
        completo.push(`### ${p.enunciado}`, "", p.respostaModelo, "");
      }
      completo.push("---", "");
    }
  }
}

writeFileSync(join(PUBLICO, "llms-full.txt"), completo.join("\n"), "utf8");

/* --------------------- versão Markdown de cada tema ----------------------- */

let markdowns = 0;
for (const trilha of trilhas) {
  for (const modulo of trilha.modulos) {
    for (const slug of modulo.temas.filter((t) => temas.has(t))) {
      const tema = temas.get(slug);
      const destino = join(PUBLICO, "trilhas", trilha.slug, modulo.slug, slug, "index.md");
      mkdirSync(dirname(destino), { recursive: true });
      writeFileSync(
        destino,
        [
          `# ${tema.titulo}`,
          "",
          `> ${tema.resumo}`,
          "",
          `Fonte: ${SITE}${urlTema(trilha.slug, modulo.slug, slug)} · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0`,
          "",
          tema.corpo,
          "",
        ].join("\n"),
        "utf8",
      );
      markdowns++;
    }
  }
}

console.log(
  `gen-seo: llms.txt e llms-full.txt (${temas.size} temas, ${trilhas.length} trilha(s)), ${markdowns} markdown(s).`,
);
