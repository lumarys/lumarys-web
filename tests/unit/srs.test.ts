import { describe, expect, it } from "vitest";

import {
  CAIXA_MAXIMA,
  cardNovo,
  estaVencido,
  filaDoDia,
  hojeISO,
  previsao,
  revisar,
  somarDias,
} from "@/lib/srs";

const AGORA = new Date("2026-09-03T10:00:00-03:00");

describe("datas", () => {
  it("roda com o fuso fixado, senão o teste abaixo não significa nada", () => {
    expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe("America/Sao_Paulo");
  });

  it("usa o fuso local, não UTC", () => {
    // Às 21h30 de Brasília já é o dia seguinte em UTC. Se o cálculo escorregar
    // para UTC, quem estuda à noite perde a sequência de dias e recebe a fila
    // de cards do dia errado.
    const noite = new Date("2026-09-03T21:30:00-03:00");
    expect(hojeISO(noite)).toBe("2026-09-03");
  });

  it("soma dias atravessando o mês", () => {
    expect(somarDias("2026-09-28", 7)).toBe("2026-10-05");
  });
});

describe("revisão", () => {
  it("sobe uma caixa a cada acerto e respeita os intervalos", () => {
    let card = cardNovo("spark-introducao", 0, AGORA);
    expect(card.caixa).toBe(0);

    card = revisar(card, true, AGORA);
    expect(card.caixa).toBe(1);
    expect(card.vencimento).toBe("2026-09-04");

    card = revisar(card, true, AGORA);
    expect(card.caixa).toBe(2);
    expect(card.vencimento).toBe("2026-09-06");

    card = revisar(card, true, AGORA);
    expect(card.vencimento).toBe("2026-09-10");

    card = revisar(card, true, AGORA);
    expect(card.caixa).toBe(CAIXA_MAXIMA);
    expect(card.vencimento).toBe("2026-09-15");
  });

  it("não passa da última caixa", () => {
    let card = cardNovo("spark-rdd", 0, AGORA);
    for (let i = 0; i < 10; i++) card = revisar(card, true, AGORA);
    expect(card.caixa).toBe(CAIXA_MAXIMA);
  });

  it("erro volta para a primeira caixa, não uma caixa atrás", () => {
    let card = cardNovo("mapreduce", 0, AGORA);
    card = revisar(card, true, AGORA);
    card = revisar(card, true, AGORA);
    card = revisar(card, false, AGORA);

    expect(card.caixa).toBe(1);
    expect(card.vencimento).toBe("2026-09-04");
    expect(card.erros).toBe(1);
    expect(card.acertos).toBe(2);
  });
});

describe("fila do dia", () => {
  it("só traz o que venceu", () => {
    const vencido = { ...cardNovo("a", 0, AGORA), vencimento: "2026-09-01" };
    const futuro = { ...cardNovo("b", 0, AGORA), vencimento: "2026-09-30" };

    expect(estaVencido(vencido, AGORA)).toBe(true);
    expect(estaVencido(futuro, AGORA)).toBe(false);
    expect(filaDoDia([vencido, futuro], AGORA).map((c) => c.id)).toEqual(["a#0"]);
  });

  it("intercala temas em vez de agrupar por assunto", () => {
    const cards = [
      ...[0, 1, 2].map((i) => cardNovo("spark", i, AGORA)),
      ...[0, 1, 2].map((i) => cardNovo("hadoop", i, AGORA)),
    ];

    const temas = filaDoDia(cards, AGORA).map((c) => c.temaSlug);

    // Nenhum tema aparece três vezes seguidas: é a intercalação que o método pede.
    expect(temas.slice(0, 2)).toEqual(["spark", "hadoop"]);
    expect(temas.filter((t) => t === "spark")).toHaveLength(3);
    expect(temas.filter((t) => t === "hadoop")).toHaveLength(3);
  });

  it("respeita o limite da sessão", () => {
    const cards = Array.from({ length: 100 }, (_, i) => cardNovo(`tema-${i % 5}`, i, AGORA));
    expect(filaDoDia(cards, AGORA, 12)).toHaveLength(12);
  });

  it("prioriza a caixa mais baixa dentro do mesmo tema", () => {
    const facil = { ...cardNovo("spark", 0, AGORA), caixa: 3 };
    const dificil = { ...cardNovo("spark", 1, AGORA), caixa: 1 };

    expect(filaDoDia([facil, dificil], AGORA)[0]?.id).toBe("spark#1");
  });
});

describe("previsão", () => {
  it("conta quantos cards vencem em cada dia", () => {
    const cards = [
      { ...cardNovo("a", 0, AGORA), vencimento: "2026-09-03" },
      { ...cardNovo("a", 1, AGORA), vencimento: "2026-09-03" },
      { ...cardNovo("a", 2, AGORA), vencimento: "2026-09-05" },
    ];

    const dias = previsao(cards, 3, AGORA);
    expect(dias).toEqual([
      { data: "2026-09-03", total: 2 },
      { data: "2026-09-04", total: 0 },
      { data: "2026-09-05", total: 1 },
    ]);
  });
});
