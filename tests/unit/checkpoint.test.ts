import { describe, expect, it } from "vitest";

import { aprovado, montarCheckpoint, TAMANHO, temasParaRevisar } from "@/lib/checkpoint";
import type { Pergunta, Tema } from "@content/types";

function objetiva(enunciado: string): Pergunta {
  return {
    tipo: "unica",
    enunciado,
    alternativas: [
      { texto: "a", correta: true, explicacao: "porque sim, com detalhe" },
      { texto: "b", correta: false, explicacao: "porque não, com detalhe" },
      { texto: "c", correta: false, explicacao: "porque não, com detalhe" },
    ],
  };
}

function tema(slug: string, quantas: number): Pick<Tema, "slug" | "titulo" | "perguntas"> {
  return {
    slug,
    titulo: slug.toUpperCase(),
    perguntas: [
      // Uma oral no meio: ela não pode entrar num quiz objetivo.
      { tipo: "oral", enunciado: "fale sobre isso", respostaModelo: "x".repeat(41), rubrica: ["um critério", "outro critério"] },
      ...Array.from({ length: quantas }, (_, i) => objetiva(`${slug} ${i}`)),
    ],
  };
}

describe("montar checkpoint", () => {
  it("não passa do tamanho pedido e não repete pergunta", () => {
    const perguntas = montarCheckpoint([tema("a", 8), tema("b", 8), tema("c", 8)], 1);
    expect(perguntas).toHaveLength(TAMANHO);
    expect(new Set(perguntas.map((p) => p.enunciado)).size).toBe(TAMANHO);
  });

  it("descarta pergunta oral: o checkpoint é objetivo", () => {
    const perguntas = montarCheckpoint([tema("a", 8), tema("b", 8)], 1);
    expect(perguntas.every((p) => p.tipo === "unica" || p.tipo === "multipla")).toBe(true);
  });

  it("intercala os temas em vez de esvaziar um antes do próximo", () => {
    // Dez seguidas do mesmo tema medem memória da página, não do conceito.
    const perguntas = montarCheckpoint([tema("a", 8), tema("b", 8)], 7);
    const primeiros = perguntas.slice(0, 4).map((p) => p.temaSlug);
    expect(new Set(primeiros).size).toBe(2);
  });

  it("com menos perguntas que o tamanho, devolve o que existe", () => {
    expect(montarCheckpoint([tema("a", 2), tema("b", 1)], 1)).toHaveLength(3);
  });

  it("módulo sem pergunta objetiva devolve nada, em vez de quebrar", () => {
    expect(montarCheckpoint([tema("a", 0)], 1)).toEqual([]);
  });

  it("a mesma semente devolve o mesmo checkpoint", () => {
    const temas = [tema("a", 8), tema("b", 8)];
    const um = montarCheckpoint(temas, 42).map((p) => p.enunciado);
    const dois = montarCheckpoint(temas, 42).map((p) => p.enunciado);
    expect(um).toEqual(dois);
  });
});

describe("aprovação", () => {
  it("70% fecha o módulo, 69% não", () => {
    expect(aprovado(7, 10)).toBe(true);
    expect(aprovado(6, 10)).toBe(false);
    expect(aprovado(0, 0)).toBe(false);
  });
});

describe("temas para revisar", () => {
  it("não repete o tema quando a pessoa errou duas perguntas dele", () => {
    const perguntas = montarCheckpoint([tema("a", 8), tema("b", 8)], 3);
    const doTemaA = perguntas.flatMap((p, i) => (p.temaSlug === "a" ? [i] : []));
    expect(temasParaRevisar(perguntas, doTemaA.slice(0, 2))).toEqual(["a"]);
  });

  it("índice fora da lista é ignorado", () => {
    expect(temasParaRevisar([], [0, 5])).toEqual([]);
  });
});
