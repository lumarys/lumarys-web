import { describe, expect, it } from "vitest";

import { LIMIAR_REVISAO, proximaAcao, type TemaRef } from "@/lib/proximaAcao";

const TEMAS: TemaRef[] = [
  { slug: "big-data", titulo: "O que é Big Data", modulo: "fundamentos", minutos: 25 },
  { slug: "olap", titulo: "OLAP, OLTP e ETL", modulo: "fundamentos", minutos: 35 },
  { slug: "mapreduce", titulo: "MapReduce", modulo: "hadoop", minutos: 30 },
];

const base = { temas: TEMAS, concluidos: {}, vencidos: 0 };

describe("próxima ação", () => {
  it("sem nada feito, começa pelo primeiro tema", () => {
    expect(proximaAcao(base)).toEqual({ tipo: "estudar", tema: TEMAS[0] });
  });

  it("tema aberto e não concluído ganha de tudo: é o laço em aberto", () => {
    const acao = proximaAcao({
      ...base,
      concluidos: { "big-data": 1 },
      ultimoTema: "olap",
      vencidos: 20,
    });
    expect(acao).toEqual({ tipo: "continuar", tema: TEMAS[1] });
  });

  it("tema já concluído não vira 'continuar'", () => {
    const acao = proximaAcao({ ...base, concluidos: { "big-data": 1 }, ultimoTema: "big-data" });
    expect(acao).toEqual({ tipo: "estudar", tema: TEMAS[1] });
  });

  it("dívida de revisão passa na frente do conteúdo novo", () => {
    expect(proximaAcao({ ...base, vencidos: LIMIAR_REVISAO })).toEqual({
      tipo: "revisar",
      vencidos: LIMIAR_REVISAO,
    });
    expect(proximaAcao({ ...base, vencidos: LIMIAR_REVISAO - 1 }).tipo).toBe("estudar");
  });

  it("com a trilha inteira concluída, sobra provar em voz alta", () => {
    const concluidos = Object.fromEntries(TEMAS.map((t) => [t.slug, 1]));
    expect(proximaAcao({ ...base, concluidos })).toEqual({ tipo: "simular" });
  });

  it("tema que saiu do conteúdo não trava a decisão", () => {
    // ultimoTema pode apontar para um slug que não existe mais na trilha.
    expect(proximaAcao({ ...base, ultimoTema: "tema-removido" }).tipo).toBe("estudar");
  });
});
