#!/usr/bin/env node
/**
 * Regras de conteúdo que o schema zod não pega: segurança do MDX, tamanho do
 * corpo, duplicidade e coerência entre trilha e temas.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { lerTemas, sair } from "./_temas.mjs";

const PROIBIDOS = [
  [/<script/i, "tag de script no corpo"],
  [/javascript:/i, "URL com esquema javascript:"],
  [/\son[a-z]+\s*=\s*["']/i, "handler inline (onclick e afins)"],
  [/<iframe/i, "iframe cru (use o componente de vídeo)"],
  [/lorem ipsum/i, "texto de preenchimento"],
];

const COMPONENTES = new Set([
  "Video",
  "Callout",
  "Comparativo",
  "Passos",
  "Termo",
  "Formula",
]);

const temas = lerTemas();
const erros = [];
const avisos = [];
const vistos = new Set();

for (const { arquivo, dados, corpo } of temas) {
  for (const [padrao, oque] of PROIBIDOS) {
    if (padrao.test(corpo)) erros.push(`${arquivo}: ${oque}.`);
  }

  for (const tag of corpo.matchAll(/<([A-Z][A-Za-z0-9]*)/g)) {
    if (!COMPONENTES.has(tag[1])) {
      erros.push(`${arquivo}: componente <${tag[1]}> fora da allowlist do MDX.`);
    }
  }

  const palavras = corpo.split(/\s+/).filter(Boolean).length;
  if (palavras < 250) erros.push(`${arquivo}: corpo com ${palavras} palavras, mínimo 250.`);
  if (palavras > 1800) avisos.push(`${arquivo}: corpo com ${palavras} palavras, longo para 25 min.`);

  if (vistos.has(dados.slug)) erros.push(`${arquivo}: slug "${dados.slug}" duplicado.`);
  vistos.add(dados.slug);

  const orais = (dados.perguntas ?? []).filter((p) => p.tipo === "oral").length;
  if (orais < 2) erros.push(`${arquivo}: precisa de ao menos 2 perguntas orais com rubrica.`);

  const objetivas = (dados.perguntas ?? []).filter((p) => p.tipo !== "oral");
  if (objetivas.length < 1) erros.push(`${arquivo}: precisa de ao menos 1 pergunta objetiva.`);
  for (const p of objetivas) {
    const corretas = (p.alternativas ?? []).filter((a) => a.correta).length;
    if (p.tipo === "unica" && corretas !== 1) {
      erros.push(`${arquivo}: pergunta "única" com ${corretas} alternativas corretas.`);
    }
    if (p.tipo === "multipla" && corretas < 2) {
      erros.push(`${arquivo}: pergunta "múltipla" precisa de 2 ou mais corretas.`);
    }
  }
  for (const pt of dados.preTeste ?? []) {
    const corretas = (pt.alternativas ?? []).filter((a) => a.correta).length;
    if (corretas !== 1) erros.push(`${arquivo}: pré-teste com ${corretas} alternativas corretas.`);
  }
}

/**
 * Cruzamento trilha x temas. As trilhas são TypeScript e este script é JS puro,
 * então lemos os slugs do texto do arquivo em vez de importar o módulo: o lint
 * não precisa avaliar o TS, só saber quais temas a trilha promete.
 */
const DIR_TRILHAS = join(process.cwd(), "content", "trilhas");
for (const arquivo of readdirSync(DIR_TRILHAS).filter((f) => f.endsWith(".ts") && f !== "index.ts")) {
  const fonte = readFileSync(join(DIR_TRILHAS, arquivo), "utf8");
  for (const bloco of fonte.matchAll(/temas:\s*\[([^\]]*)\]/g)) {
    for (const slug of bloco[1].matchAll(/"([a-z0-9-]+)"/g)) {
      if (!vistos.has(slug[1])) {
        avisos.push(`trilha ${arquivo}: tema "${slug[1]}" declarado mas ainda não escrito.`);
      }
    }
  }
}

sair(erros, avisos, `content-lint (${temas.length} tema(s))`);
