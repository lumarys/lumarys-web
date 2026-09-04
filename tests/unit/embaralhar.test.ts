import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

import { embaralhar, sementeDeTexto } from "@/lib/utils";

/**
 * Regressão de um defeito real: as alternativas eram exibidas na ordem em que
 * foram escritas, e quem escreveu tendia a pôr a certa em segundo lugar. Numa
 * auditoria dos 30 temas, a resposta certa estava na posição 2 em 62% dos
 * pré-testes e nunca depois da posição 2 nas questões de escolha única — dava
 * para acertar sem saber nada, e a prontidão subia sem motivo.
 */

type Alternativa = { texto: string; correta: boolean; explicacao: string };
type Pergunta = { tipo: string; enunciado: string; alternativas?: Alternativa[] };

function carregarQuestoes() {
  const dir = join(process.cwd(), "content", "temas");
  const questoes: Pergunta[] = [];

  for (const arquivo of readdirSync(dir).filter((f) => f.endsWith(".mdx"))) {
    const { data } = matter(readFileSync(join(dir, arquivo), "utf8"));
    for (const p of data.preTeste ?? []) questoes.push({ tipo: "preTeste", ...p });
    for (const p of data.perguntas ?? []) if (p.tipo !== "oral") questoes.push(p);
  }
  return questoes;
}

function distribuicao(questoes: Pergunta[], embaralhado: boolean) {
  const contagem = new Map<number, number>();
  let total = 0;

  for (const q of questoes) {
    const alts = q.alternativas ?? [];
    const corretas = alts.filter((a) => a.correta);
    if (corretas.length !== 1) continue; // múltipla escolha não tem "a posição"

    const ordenadas = embaralhado ? embaralhar(alts, sementeDeTexto(q.enunciado)) : alts;
    const pos = ordenadas.findIndex((a) => a.correta);
    contagem.set(pos, (contagem.get(pos) ?? 0) + 1);
    total++;
  }
  return { contagem, total };
}

describe("ordem das alternativas", () => {
  const questoes = carregarQuestoes();

  it("há conteúdo suficiente para a medida significar algo", () => {
    expect(questoes.length).toBeGreaterThan(50);
  });

  it("o conteúdo escrito TEM viés de posição — é por isso que embaralhamos", () => {
    const { contagem, total } = distribuicao(questoes, false);
    const maior = Math.max(...contagem.values());
    // Documenta o defeito: sem embaralhar, uma posição concentra bem mais que
    // o esperado. Se um dia isto falhar, o viés sumiu e o embaralhamento virou
    // opcional — o que seria uma boa notícia, não um erro.
    expect(maior / total).toBeGreaterThan(0.4);
  });

  it("depois de embaralhar, nenhuma posição concentra as respostas", () => {
    const { contagem, total } = distribuicao(questoes, true);
    const maior = Math.max(...contagem.values());
    const proporcao = maior / total;

    expect(
      proporcao,
      `distribuição após embaralhar: ${[...contagem.entries()]
        .sort()
        .map(([p, n]) => `pos ${p + 1}: ${n}`)
        .join(", ")}`,
    ).toBeLessThan(0.45);
  });

  it("a última posição deixa de ser praticamente inexistente", () => {
    const { contagem, total } = distribuicao(questoes, true);
    const ultimas = [...contagem.entries()].filter(([p]) => p >= 2);
    const soma = ultimas.reduce((a, [, n]) => a + n, 0);
    // Antes: 1 em 59 pré-testes tinha a certa na terceira posição.
    expect(soma / total).toBeGreaterThan(0.2);
  });

  it("embaralhar é estável: a mesma pergunta sempre sai na mesma ordem", () => {
    const alts = [
      { texto: "a", correta: false, explicacao: "" },
      { texto: "b", correta: true, explicacao: "" },
      { texto: "c", correta: false, explicacao: "" },
    ];
    const semente = sementeDeTexto("uma pergunta qualquer");

    expect(embaralhar(alts, semente)).toEqual(embaralhar(alts, semente));
  });

  it("embaralhar preserva todas as alternativas, sem perder nem duplicar", () => {
    for (const q of questoes) {
      const alts = q.alternativas ?? [];
      if (alts.length === 0) continue;
      const saida = embaralhar(alts, sementeDeTexto(q.enunciado));

      expect(saida).toHaveLength(alts.length);
      expect(new Set(saida.map((a) => a.texto))).toEqual(new Set(alts.map((a) => a.texto)));
      expect(saida.filter((a) => a.correta)).toHaveLength(alts.filter((a) => a.correta).length);
    }
  });
});
