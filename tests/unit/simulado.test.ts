import { describe, expect, it } from "vitest";

import { NOTA_MAXIMA, calcularResultado, paraProgresso } from "@/lib/simulado";

/**
 * O defeito que motivou este arquivo: "Encerrar" no meio do simulado mostrava
 * uma nota que nunca era registrada, e o máximo somava as perguntas que o
 * aluno nem chegou a ver.
 */
const PERGUNTAS = [
  { id: "a", moduloSlug: "spark", moduloTitulo: "Spark" },
  { id: "b", moduloSlug: "spark", moduloTitulo: "Spark" },
  { id: "c", moduloSlug: "hadoop", moduloTitulo: "Hadoop" },
  { id: "d", moduloSlug: "hadoop", moduloTitulo: "Hadoop" },
  { id: "e", moduloSlug: "hadoop", moduloTitulo: "Hadoop" },
];

describe("resultado do simulado", () => {
  it("o máximo conta só as perguntas avaliadas", () => {
    const r = calcularResultado(PERGUNTAS, { a: 4, b: 3, c: 5 });

    expect(r.avaliadas).toBe(3);
    expect(r.puladas).toBe(2);
    expect(r.nota).toBe(12);
    expect(r.maximo).toBe(3 * NOTA_MAXIMA);
  });

  it("nota zero é uma avaliação, pergunta sem nota é pulada", () => {
    const r = calcularResultado(PERGUNTAS, { a: 0 });

    expect(r.avaliadas).toBe(1);
    expect(r.nota).toBe(0);
    expect(r.maximo).toBe(NOTA_MAXIMA);
  });

  it("módulo sem nenhuma resposta fica fora, para não virar barra de 0 de 0", () => {
    const r = calcularResultado(PERGUNTAS, { a: 4 });

    expect(r.porModulo.map((m) => m.slug)).toEqual(["spark"]);
    expect(paraProgresso(r)).toEqual({ spark: { nota: 4, maximo: NOTA_MAXIMA } });
  });

  it("encerrar no meio dá o mesmo placar que chegar ao fim com as mesmas notas", () => {
    const notas = { a: 4, b: 3 };
    const encerrado = calcularResultado(PERGUNTAS, notas);
    const completo = calcularResultado(PERGUNTAS.slice(0, 2), notas);

    expect(encerrado.nota).toBe(completo.nota);
    expect(encerrado.maximo).toBe(completo.maximo);
  });

  it("sem nenhuma avaliação não há o que registrar", () => {
    const r = calcularResultado(PERGUNTAS, {});

    expect(r.avaliadas).toBe(0);
    expect(r.maximo).toBe(0);
    expect(paraProgresso(r)).toEqual({});
  });
});
