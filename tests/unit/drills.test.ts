import { describe, expect, it } from "vitest";

import { filaDeDrills, minutosDoDrill } from "@/lib/drills";
import { trilhaVazia, type ProgressoTrilha } from "@/lib/storage";

const TEMAS = ["big-data", "mapreduce", "olap"];

function trilha(extra: Partial<ProgressoTrilha>): ProgressoTrilha {
  return { ...trilhaVazia(), ...extra };
}

function quiz(acertos: number, total: number, atualizadoEm: number) {
  return { acertos, total, atualizadoEm };
}

describe("fila de drills", () => {
  it("sem progresso, não inventa fila", () => {
    expect(filaDeDrills(undefined, TEMAS)).toEqual([]);
    expect(filaDeDrills(trilha({}), TEMAS)).toEqual([]);
  });

  it("quiz abaixo de 70% entra; no corte, não", () => {
    const t = trilha({
      quizzes: { "big-data": quiz(6, 10, 100), mapreduce: quiz(7, 10, 100) },
    });
    expect(filaDeDrills(t, TEMAS).map((i) => i.temaSlug)).toEqual(["big-data"]);
  });

  it("erro de checkpoint entra e vem antes do erro de quiz", () => {
    // O checkpoint é evidência mais dura: foi respondido dias depois de ler.
    const t = trilha({
      quizzes: { "big-data": quiz(3, 10, 500) },
      checkpoints: {
        fundamentos: { acertos: 5, total: 10, atualizadoEm: 100, temasParaRevisar: ["mapreduce"] },
      },
    });
    expect(filaDeDrills(t, TEMAS).map((i) => [i.temaSlug, i.motivo])).toEqual([
      ["mapreduce", "checkpoint"],
      ["big-data", "quiz"],
    ]);
  });

  it("o mesmo tema não aparece duas vezes", () => {
    const t = trilha({
      quizzes: { mapreduce: quiz(2, 10, 500) },
      checkpoints: {
        fundamentos: { acertos: 5, total: 10, atualizadoEm: 100, temasParaRevisar: ["mapreduce"] },
      },
    });
    const fila = filaDeDrills(t, TEMAS);
    expect(fila).toHaveLength(1);
    expect(fila[0]!.motivo).toBe("checkpoint");
  });

  it("tema sem drill publicado fica de fora", () => {
    const t = trilha({ quizzes: { inexistente: quiz(1, 10, 100) } });
    expect(filaDeDrills(t, TEMAS)).toEqual([]);
  });

  it("refazer o drill depois do erro e ir bem tira o tema da fila", () => {
    const t = trilha({
      quizzes: { "big-data": quiz(3, 10, 100) },
      drills: { "big-data": quiz(5, 5, 200) },
    });
    expect(filaDeDrills(t, TEMAS)).toEqual([]);
  });

  it("drill feito antes do erro não conta", () => {
    const t = trilha({
      quizzes: { "big-data": quiz(3, 10, 300) },
      drills: { "big-data": quiz(5, 5, 100) },
    });
    expect(filaDeDrills(t, TEMAS)).toHaveLength(1);
  });

  it("refazer e ir mal de novo mantém o tema na fila", () => {
    const t = trilha({
      quizzes: { "big-data": quiz(3, 10, 100) },
      drills: { "big-data": quiz(1, 5, 200) },
    });
    expect(filaDeDrills(t, TEMAS)).toHaveLength(1);
  });

  it("entre dois erros do mesmo tipo, o mais recente vem primeiro", () => {
    const t = trilha({
      quizzes: { "big-data": quiz(1, 10, 100), mapreduce: quiz(1, 10, 900) },
    });
    expect(filaDeDrills(t, TEMAS).map((i) => i.temaSlug)).toEqual(["mapreduce", "big-data"]);
  });
});

describe("minutos do drill", () => {
  it("um minuto por item, com piso de três", () => {
    expect(minutosDoDrill(1)).toBe(3);
    expect(minutosDoDrill(5)).toBe(5);
    expect(minutosDoDrill(10)).toBe(10);
  });
});
