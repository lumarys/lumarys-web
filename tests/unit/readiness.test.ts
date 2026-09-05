import { describe, expect, it } from "vitest";

import { PESOS, prontidaoDaTrilha, prontidaoDoModulo, rotuloProntidao } from "@/lib/readiness";
import { progressoVazio, trilhaVazia, type Progresso } from "@/lib/storage";
import { cardNovo } from "@/lib/srs";

const MODULO = { slug: "spark", temas: ["spark-introducao", "spark-rdd"] };

describe("prontidão do módulo", () => {
  it("é zero sem nenhum dado", () => {
    const p = prontidaoDoModulo(MODULO, progressoVazio(), undefined);
    expect(p.score).toBe(0);
    expect(p.temasTotal).toBe(2);
  });

  it("marcar tema como concluído sozinho não faz a prontidão passar do peso de cobertura", () => {
    // É o ponto central: dar "concluído" em tudo sem responder nada não pode
    // gerar sensação de estar pronto.
    const progresso: Progresso = {
      ...progressoVazio(),
      trilhas: {
        ed: {
          ...trilhaVazia(),
          temasConcluidos: { "spark-introducao": 1, "spark-rdd": 1 },
        },
      },
    };

    const p = prontidaoDoModulo(MODULO, progresso, progresso.trilhas.ed);
    expect(p.cobertura).toBe(100);
    expect(p.score).toBe(Math.round(PESOS.cobertura * 100));
  });

  it("abrir o tema não mexe na prontidão: card nunca revisado fica fora da conta", () => {
    // O baralho nasce ao abrir a página do tema. Se esses cards entrassem no
    // denominador, só abrir o tema derrubaria a prontidão.
    const semCards = prontidaoDoModulo(MODULO, progressoVazio(), undefined);
    const comNovos: Progresso = {
      ...progressoVazio(),
      cards: Object.fromEntries(
        Array.from({ length: 12 }, (_, i) => {
          const card = cardNovo("spark-introducao", i);
          return [card.id, card];
        }),
      ),
    };

    const p = prontidaoDoModulo(MODULO, comNovos, undefined);
    expect(p.cards).toBe(0);
    expect(p.score).toBe(semCards.score);
  });

  it("simulado é o sinal de maior peso", () => {
    const progresso: Progresso = {
      ...progressoVazio(),
      trilhas: {
        ed: {
          ...trilhaVazia(),
          simulados: [{ em: 1, porModulo: { spark: { nota: 10, maximo: 10 } } }],
        },
      },
    };

    const p = prontidaoDoModulo(MODULO, progresso, progresso.trilhas.ed);
    expect(p.simulado).toBe(100);
    expect(p.score).toBe(Math.round(PESOS.simulado * 100));
  });

  it("quiz de um tema só vale proporcionalmente ao módulo", () => {
    const progresso: Progresso = {
      ...progressoVazio(),
      trilhas: {
        ed: {
          ...trilhaVazia(),
          quizzes: { "spark-introducao": { acertos: 4, total: 4, atualizadoEm: 1 } },
        },
      },
    };

    // Acertou tudo, mas em 1 de 2 temas: metade do sinal de quiz.
    expect(prontidaoDoModulo(MODULO, progresso, progresso.trilhas.ed).quiz).toBe(50);
  });

  it("cards contam pela caixa alcançada", () => {
    const progresso: Progresso = {
      ...progressoVazio(),
      cards: {
        "spark-introducao#0": { ...cardNovo("spark-introducao", 0), caixa: 4 },
        "spark-rdd#0": { ...cardNovo("spark-rdd", 0), caixa: 2 },
      },
      trilhas: { ed: trilhaVazia() },
    };

    expect(prontidaoDoModulo(MODULO, progresso, progresso.trilhas.ed).cards).toBe(75);
  });
});

describe("prontidão da trilha", () => {
  const modulos = [
    { slug: "fundamentos", temas: ["big-data"] },
    { slug: "alem", temas: ["a", "b", "c", "d", "e", "f"] },
  ];

  it("pondera pelo tamanho do módulo", () => {
    const progresso: Progresso = {
      ...progressoVazio(),
      trilhas: { ed: { ...trilhaVazia(), temasConcluidos: { "big-data": 1 } } },
    };

    const { geral } = prontidaoDaTrilha(modulos, progresso, "ed");
    // Um módulo de 1 tema não pode puxar a média como um de 6.
    expect(geral).toBeLessThan(Math.round(PESOS.cobertura * 100) / 2);
  });

  it("aponta o ponto fraco só entre módulos já iniciados", () => {
    const progresso: Progresso = {
      ...progressoVazio(),
      trilhas: { ed: { ...trilhaVazia(), temasConcluidos: { "big-data": 1 } } },
    };

    expect(prontidaoDaTrilha(modulos, progresso, "ed").pontoFraco?.moduloSlug).toBe("fundamentos");
  });

  it("não aponta ponto fraco quando nada foi iniciado", () => {
    expect(prontidaoDaTrilha(modulos, progressoVazio(), "ed").pontoFraco).toBeUndefined();
  });
});

describe("rótulo", () => {
  it("traduz o número em algo acionável", () => {
    expect(rotuloProntidao(0)).toBe("sem dados");
    expect(rotuloProntidao(20)).toBe("começando");
    expect(rotuloProntidao(50)).toBe("em construção");
    expect(rotuloProntidao(70)).toBe("quase lá");
    expect(rotuloProntidao(90)).toBe("pronto");
  });
});
