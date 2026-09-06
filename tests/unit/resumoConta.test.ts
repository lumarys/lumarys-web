import { describe, expect, it } from "vitest";

import { desdeEntao, resumoDoAparelho } from "@/lib/resumoConta";
import { cardNovo } from "@/lib/srs";
import { progressoVazio, type Progresso, type ProgressoTrilha } from "@/lib/storage";

function trilha(extra: Partial<ProgressoTrilha> = {}): ProgressoTrilha {
  return {
    iniciadaEm: 0,
    temasConcluidos: {},
    quizzes: {},
    preTestes: {},
    simulados: [],
    atualizadoEm: 0,
    ...extra,
  };
}

function comCards(caixas: number[]): Progresso {
  const p = progressoVazio();
  caixas.forEach((caixa, i) => {
    p.cards[`t#${i}`] = { ...cardNovo("t", i), caixa };
  });
  return p;
}

describe("resumo do aparelho", () => {
  it("sem nada gravado se declara vazio", () => {
    expect(resumoDoAparelho(progressoVazio())).toMatchObject({
      temas: 0,
      emRevisao: 0,
      planoAte: null,
      vazio: true,
    });
  });

  it("separa cards novos, em revisão e memorizados", () => {
    // Caixa 0 é semeada ao abrir o tema e ninguém respondeu ainda; acima da
    // caixa 4 o card já não conta para a prontidão.
    const r = resumoDoAparelho(comCards([0, 0, 1, 3, 4, 5, 6]));
    expect(r).toMatchObject({ novos: 2, emRevisao: 3, memorizados: 2 });
  });

  it("conta temas concluídos de todas as trilhas", () => {
    const p = progressoVazio();
    p.trilhas.a = trilha({ temasConcluidos: { um: 1, dois: 2 } });
    p.trilhas.b = trilha({ temasConcluidos: { tres: 3 } });
    expect(resumoDoAparelho(p).temas).toBe(3);
  });

  it("mostra a prova mais próxima, não a última cadastrada", () => {
    const p = progressoVazio();
    p.trilhas.a = trilha({ dataProva: "2026-11-30" });
    p.trilhas.b = trilha({ dataProva: "2026-09-18" });
    expect(resumoDoAparelho(p).planoAte).toBe("18/09");
  });

  it("com sequência viva não é vazio, mesmo sem tema concluído", () => {
    const p = progressoVazio();
    p.streak = { atual: 2, recorde: 5, ultimoDia: "2026-09-06" };
    expect(resumoDoAparelho(p)).toMatchObject({ sequencia: 2, vazio: false });
  });
});

describe("desde então", () => {
  const agora = new Date("2026-09-06T12:00:00Z").getTime();
  const min = 60_000;

  it("menos de um minuto não vira número", () => {
    expect(desdeEntao(agora - 30_000, agora)).toBe("agora mesmo");
  });

  it("conta minutos, horas e dias", () => {
    expect(desdeEntao(agora - 3 * min, agora)).toBe("há 3 min");
    expect(desdeEntao(agora - 90 * min, agora)).toBe("há 1 h");
    expect(desdeEntao(agora - 26 * 60 * min, agora)).toBe("ontem");
    expect(desdeEntao(agora - 72 * 60 * min, agora)).toBe("há 3 dias");
  });
});
