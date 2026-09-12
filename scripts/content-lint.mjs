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

const COMPONENTES = new Set(["Video", "Callout", "Comparativo", "Passos", "Termo", "Formula"]);

const temas = lerTemas();
const erros = [];
const avisos = [];
const vistos = new Set();
const termos = new Map();

for (const { arquivo, dados, corpo } of temas) {
  // O schema em content/types.ts limita o resumo a 320 caracteres (meta
  // description e llms.txt). O build já recusa; conferir aqui evita descobrir
  // depois de 40 segundos de build.
  if (typeof dados.resumo === "string" && (dados.resumo.length < 40 || dados.resumo.length > 320)) {
    erros.push(
      `${arquivo}: resumo com ${dados.resumo.length} caracteres; o schema exige entre 40 e 320.`,
    );
  }

  for (const [padrao, oque] of PROIBIDOS) {
    if (padrao.test(corpo)) erros.push(`${arquivo}: ${oque}.`);
  }

  for (const tag of corpo.matchAll(/<([A-Z][A-Za-z0-9]*)/g)) {
    if (!COMPONENTES.has(tag[1])) {
      erros.push(`${arquivo}: componente <${tag[1]}> fora da allowlist do MDX.`);
    }
  }

  // HTML cru (tag minúscula) não entra: o MDX executa o que estiver ali, e a
  // allowlist de componentes acima só olha para tags com inicial maiúscula.
  // Blocos e trechos de código ficam de fora da checagem — "<div>" dentro de
  // um exemplo de XML é conteúdo, não marcação.
  const semCodigo = corpo.replace(/```[\s\S]*?```/g, "").replace(/`[^`\n]*`/g, "");
  for (const tag of semCodigo.matchAll(/<([a-z][a-z0-9]*)(?=[\s>/])/g)) {
    erros.push(
      `${arquivo}: HTML cru <${tag[1]}> no corpo; use Markdown ou um componente da allowlist.`,
    );
  }

  // O glossário da trilha é montado destes termos: um termo sem definição, ou
  // com a mesma palavra definida de dois jeitos, vira verbete errado numa
  // página pública.
  for (const [, nome, definicao] of corpo.matchAll(
    /<Termo\s+nome="([^"]*)"\s*>([\s\S]*?)<\/Termo>/g,
  )) {
    if (!nome.trim()) erros.push(`${arquivo}: <Termo> sem nome.`);
    if (definicao.trim().length < 10) {
      erros.push(`${arquivo}: termo "${nome}" com definição vazia ou curta demais.`);
    }
    const chave = nome.trim().toLocaleLowerCase("pt-BR");
    const anterior = termos.get(chave);
    if (anterior && anterior.arquivo !== arquivo) {
      avisos.push(
        `${arquivo}: termo "${nome}" já definido em ${anterior.arquivo}; o glossário fica com o primeiro.`,
      );
    } else if (!anterior) {
      termos.set(chave, { arquivo });
    }
  }

  if (/<Termo[^>]*\/>/.test(corpo)) {
    erros.push(`${arquivo}: <Termo> autofechado não tem definição.`);
  }

  const palavras = corpo.split(/\s+/).filter(Boolean).length;
  if (palavras < 250) erros.push(`${arquivo}: corpo com ${palavras} palavras, mínimo 250.`);
  if (palavras > 1800)
    avisos.push(`${arquivo}: corpo com ${palavras} palavras, longo para 25 min.`);

  if (vistos.has(dados.slug)) erros.push(`${arquivo}: slug "${dados.slug}" duplicado.`);
  vistos.add(dados.slug);

  const orais = (dados.perguntas ?? []).filter((p) => p.tipo === "oral").length;
  const objetivas = (dados.perguntas ?? []).filter((p) => p.tipo !== "oral");
  if (dados.formato === "prova") {
    // Certificação: a prova é objetiva. Três cenários no estilo do exame é o
    // mínimo para o tema alimentar a prova simulada sem repetir pergunta.
    if (objetivas.length < 3) {
      erros.push(`${arquivo}: tema de prova precisa de ao menos 3 perguntas objetivas de cenário.`);
    }
  } else {
    if (orais < 2) erros.push(`${arquivo}: precisa de ao menos 2 perguntas orais com rubrica.`);
    if (objetivas.length < 1) erros.push(`${arquivo}: precisa de ao menos 1 pergunta objetiva.`);
  }
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
for (const arquivo of readdirSync(DIR_TRILHAS).filter(
  (f) => f.endsWith(".ts") && f !== "index.ts",
)) {
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
