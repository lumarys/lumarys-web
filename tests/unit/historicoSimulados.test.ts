import { describe, expect, it } from "vitest";

import { historico, melhorPorModulo, percentual, tendencia } from "@/lib/historicoSimulados";
import type { ResultadoSimulado } from "@/lib/storage";

function simulado(em: number, porModulo: Record<string, [number, number]>): ResultadoSimulado {
  return {
    em,
    porModulo: Object.fromEntries(
      Object.entries(porModulo).map(([slug, [nota, maximo]]) => [slug, { nota, maximo }]),
    ),
  };
}

describe("percentual", () => {
  it("sem máximo não divide por zero", () => {
    expect(percentual(0, 0)).toBe(0);
  });
});

describe("histórico", () => {
  it("vem do mais recente para o mais antigo", () => {
    const registros = historico([
      simulado(100, { a: [10, 20] }),
      simulado(300, { a: [18, 20] }),
      simulado(200, { a: [14, 20] }),
    ]);
    expect(registros.map((r) => r.em)).toEqual([300, 200, 100]);
    expect(registros.map((r) => r.percentual)).toEqual([90, 70, 50]);
  });

  it("a variação é contra o simulado anterior, e o primeiro não tem", () => {
    const registros = historico([simulado(100, { a: [10, 20] }), simulado(200, { a: [14, 20] })]);
    expect(registros[0]!.variacao).toBe(20);
    expect(registros[1]!.variacao).toBeNull();
  });

  it("soma os módulos para chegar à nota geral", () => {
    const [registro] = historico([simulado(1, { a: [8, 10], b: [2, 10] })]);
    expect(registro).toMatchObject({ nota: 10, maximo: 20, percentual: 50 });
  });
});

describe("tendência", () => {
  it("com um simulado só não há linha para traçar", () => {
    expect(tendencia(historico([simulado(1, { a: [5, 10] })]))).toBeNull();
  });

  it("compara as pontas da janela de três", () => {
    const subindo = historico([
      simulado(1, { a: [10, 20] }),
      simulado(2, { a: [12, 20] }),
      simulado(3, { a: [18, 20] }),
    ]);
    expect(tendencia(subindo)).toBe("subindo");
    expect(tendencia(historico([simulado(1, { a: [18, 20] }), simulado(2, { a: [10, 20] })]))).toBe(
      "descendo",
    );
  });

  it("variação pequena não vira seta", () => {
    // 50% para 52%: dentro do ruído de oito autoavaliações de 0 a 5.
    const quase = historico([simulado(1, { a: [50, 100] }), simulado(2, { a: [52, 100] })]);
    expect(tendencia(quase)).toBe("estavel");
  });

  it("ignora o que ficou fora da janela", () => {
    const registros = historico([
      simulado(1, { a: [2, 20] }),
      simulado(2, { a: [18, 20] }),
      simulado(3, { a: [17, 20] }),
      simulado(4, { a: [18, 20] }),
    ]);
    // Os três últimos são 90, 85 e 90: estável, apesar do salto lá atrás.
    expect(tendencia(registros)).toBe("estavel");
  });
});

describe("melhor por módulo", () => {
  it("aponta o teto de cada módulo e em qual simulado ele foi feito", () => {
    const registros = historico([
      simulado(1, { a: [18, 20], b: [4, 20] }),
      simulado(2, { a: [10, 20], b: [16, 20] }),
    ]);
    expect(melhorPorModulo(registros)).toEqual({
      a: { percentual: 90, em: 1 },
      b: { percentual: 80, em: 2 },
    });
  });

  it("empate no topo fica com a tentativa mais recente, para marcar uma linha só", () => {
    const registros = historico([
      simulado(1, { a: [18, 20] }),
      simulado(2, { a: [10, 20] }),
      simulado(3, { a: [18, 20] }),
    ]);
    expect(melhorPorModulo(registros).a).toEqual({ percentual: 90, em: 3 });
  });

  it("módulo cuja nota nunca variou não tem recorde", () => {
    const registros = historico([simulado(1, { a: [10, 20] }), simulado(2, { a: [10, 20] })]);
    expect(melhorPorModulo(registros)).toEqual({});
  });
});
