#!/usr/bin/env node
/**
 * Confere que a versão de cada exame de certificação ainda é a vigente.
 *
 * A AWS aposenta versões com data marcada e publica a substituta com outro
 * código (SOA-C02 → SOA-C03, MLA-C01 → MLA-C02). Uma trilha ancorada num
 * código aposentado ensina para uma prova que não existe mais. Este script
 * lê o índice oficial de guias e:
 *
 * - FALHA se o código da trilha não aparece mais no índice (aposentado ou
 *   renomeado);
 * - AVISA se aparece um código do mesmo exame com versão maior (a substituta
 *   já foi anunciada; hora de revisar a ementa).
 *
 * Roda no CI junto de verify-videos e verify-links: é conteúdo de terceiro
 * que muda sem avisar.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { lerTrilhasNaOrdem, sair } from "./_temas.mjs";

const INDICE =
  "https://docs.aws.amazon.com/aws-certification/latest/examguides/aws-certification-exam-guides.html";

const trilhas = lerTrilhasNaOrdem()
  .map((t) => {
    const fonte = readFileSync(join(process.cwd(), "content", "trilhas", t.arquivo), "utf8");
    const codigo = fonte.match(/codigo:\s*"([A-Z]{3}-C\d{2})"/)?.[1];
    return codigo ? { slug: t.slug, codigo } : null;
  })
  .filter(Boolean);

const erros = [];
const avisos = [];

if (trilhas.length > 0) {
  let indice = "";
  try {
    const resp = await fetch(INDICE, { signal: AbortSignal.timeout(20_000) });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    indice = await resp.text();
  } catch (e) {
    // Sem rede não dá para afirmar nada: aviso, não erro, para o build local
    // offline não quebrar por isso.
    avisos.push(`índice oficial de exames indisponível (${e.message}); versões não conferidas.`);
  }

  if (indice) {
    for (const { slug, codigo } of trilhas) {
      if (!indice.includes(codigo)) {
        erros.push(
          `${slug}: o exame ${codigo} não está mais no índice oficial da AWS. Aposentado ou renomeado; revisar a trilha.`,
        );
        continue;
      }
      const [prefixo, versao] = codigo.split("-C");
      const maisNovas = [...indice.matchAll(new RegExp(`\\b${prefixo}-C(\\d{2})\\b`, "g"))]
        .map((m) => Number(m[1]))
        .filter((v) => v > Number(versao));
      if (maisNovas.length > 0) {
        avisos.push(
          `${slug}: a AWS já lista ${prefixo}-C${String(Math.max(...maisNovas)).padStart(2, "0")}; a trilha está em ${codigo}. Revisar ementa e datas.`,
        );
      }
    }
  }
}

sair(erros, avisos, `verify-exames (${trilhas.length} exame(s))`);
