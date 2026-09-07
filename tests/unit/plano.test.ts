import { describe, expect, it } from "vitest";

import { datasDoPlano, estadoDoPlano, ritmoDoPlano } from "@/lib/plano";

const AGORA = new Date("2026-09-05T10:00:00-03:00");
const TOTAL = 14;

describe("estado do plano", () => {
  it("sem data da prova não há plano", () => {
    expect(estadoDoPlano(undefined, TOTAL, AGORA).situacao).toBe("sem-plano");
  });

  it("prova daqui a 14 dias começa hoje, no dia 1", () => {
    const e = estadoDoPlano("2026-09-19", TOTAL, AGORA);
    expect(e).toMatchObject({ situacao: "em-curso", dia: 1, faltam: 14 });
  });

  it("no meio do caminho aponta o dia certo", () => {
    // Faltando 11 dias de um plano de 14, hoje é o quarto dia.
    expect(estadoDoPlano("2026-09-16", TOTAL, AGORA).dia).toBe(4);
  });

  it("véspera é o dia 14", () => {
    expect(estadoDoPlano("2026-09-06", TOTAL, AGORA).dia).toBe(14);
  });

  it("prova distante não finge que hoje é o dia 1", () => {
    // Faltando 60 dias, dizer "dia 1 de 14" apagava a noção de folga.
    const e = estadoDoPlano("2026-11-04", TOTAL, AGORA);
    expect(e.situacao).toBe("aguardando");
    expect(e.dia).toBe(0);
    expect(e.comecaEm).toBe("2026-10-22");
  });

  it("no dia da prova o plano acabou", () => {
    expect(estadoDoPlano("2026-09-05", TOTAL, AGORA).situacao).toBe("prova-hoje");
  });

  it("data no passado é estado normal de quem já fez a prova, não erro", () => {
    const e = estadoDoPlano("2026-09-01", TOTAL, AGORA);
    expect(e.situacao).toBe("vencido");
    expect(e.faltam).toBe(-4);
  });
});

describe("ritmo do plano", () => {
  it("compara o que o cronograma esperava com o que foi feito", () => {
    const e = estadoDoPlano("2026-09-16", TOTAL, AGORA); // dia 4 de 14
    expect(ritmoDoPlano(e, 8, 30)).toEqual({ esperado: 9, atraso: 1 });
    expect(ritmoDoPlano(e, 12, 30)).toEqual({ esperado: 9, atraso: 0 });
  });

  it("fora do cronograma não inventa atraso", () => {
    expect(ritmoDoPlano(estadoDoPlano(undefined, TOTAL, AGORA), 0, 30).atraso).toBe(0);
  });
});

describe("datas do plano", () => {
  it("o último dia é a véspera da prova, e o primeiro fica `total-1` dias antes", () => {
    // O plano é ancorado no fim, não no começo: é assim que estadoDoPlano conta.
    const datas = datasDoPlano("2026-09-19", 14);
    expect(datas).toHaveLength(14);
    expect(datas[13]).toBe("2026-09-19");
    expect(datas[0]).toBe("2026-09-06");
  });

  it("plano de um dia é o próprio dia da prova", () => {
    expect(datasDoPlano("2026-09-19", 1)).toEqual(["2026-09-19"]);
  });

  it("total inválido não devolve data nenhuma", () => {
    expect(datasDoPlano("2026-09-19", 0)).toEqual([]);
  });
});
