import { describe, expect, it } from "vitest";

import { conquistaDaTrilha, faltaParaCertificado } from "@/lib/conquista";
import { progressoVazio, trilhaVazia, type Progresso } from "@/lib/storage";

const MODULOS = [{ slug: "m", temas: ["a", "b", "c", "d"] }];

function progresso(extra: Partial<ReturnType<typeof trilhaVazia>> = {}): Progresso {
  return {
    ...progressoVazio(),
    trilhas: { ed: { ...trilhaVazia(), ...extra } },
  };
}

const TODOS = { a: 1, b: 1, c: 1, d: 1 };
const bom = { em: 1, porModulo: { m: { nota: 16, maximo: 20 } } };
const ruim = { em: 1, porModulo: { m: { nota: 10, maximo: 20 } } };

describe("conquista da trilha", () => {
  it("sem progresso, tudo em zero e nada liberado", () => {
    const c = conquistaDaTrilha(progressoVazio(), "ed", MODULOS, 4);
    expect(c).toMatchObject({
      temasConcluidos: 0,
      notaSimulado: null,
      trilhaCompleta: false,
      podeCertificado: false,
    });
  });

  it("o certificado exige os dois critérios, não um", () => {
    // Trilha inteira, mas sem simulado: não sai.
    const soTemas = conquistaDaTrilha(progresso({ temasConcluidos: TODOS }), "ed", MODULOS, 4);
    expect(soTemas).toMatchObject({ trilhaCompleta: true, podeCertificado: false });

    // Simulado bom, mas metade dos temas: também não.
    const soSimulado = conquistaDaTrilha(
      progresso({ temasConcluidos: { a: 1, b: 1 }, simulados: [bom] }),
      "ed",
      MODULOS,
      4,
    );
    expect(soSimulado).toMatchObject({ simuladoAprovado: true, podeCertificado: false });

    const ambos = conquistaDaTrilha(
      progresso({ temasConcluidos: TODOS, simulados: [bom] }),
      "ed",
      MODULOS,
      4,
    );
    expect(ambos.podeCertificado).toBe(true);
  });

  it("usa o último simulado, não o melhor", () => {
    const c = conquistaDaTrilha(
      progresso({ temasConcluidos: TODOS, simulados: [bom, ruim] }),
      "ed",
      MODULOS,
      4,
    );
    expect(c.notaSimulado).toBe(50);
    expect(c.podeCertificado).toBe(false);
  });

  it("70% cravado passa", () => {
    const c = conquistaDaTrilha(
      progresso({
        temasConcluidos: TODOS,
        simulados: [{ em: 1, porModulo: { m: { nota: 14, maximo: 20 } } }],
      }),
      "ed",
      MODULOS,
      4,
    );
    expect(c.podeCertificado).toBe(true);
  });
});

describe("o que falta para o certificado", () => {
  it("com tudo cumprido, não diz nada", () => {
    const c = conquistaDaTrilha(
      progresso({ temasConcluidos: TODOS, simulados: [bom] }),
      "ed",
      MODULOS,
      4,
    );
    expect(faltaParaCertificado(c)).toBe("");
  });

  it("conta os temas que faltam", () => {
    const c = conquistaDaTrilha(
      progresso({ temasConcluidos: { a: 1 }, simulados: [bom] }),
      "ed",
      MODULOS,
      4,
    );
    expect(faltaParaCertificado(c)).toBe("Falta 3 temas.");
  });

  it("sem simulado nenhum, pede um", () => {
    const c = conquistaDaTrilha(progresso({ temasConcluidos: TODOS }), "ed", MODULOS, 4);
    expect(faltaParaCertificado(c)).toBe("Falta um simulado.");
  });

  it("com simulado abaixo do corte, diz a nota que saiu", () => {
    const c = conquistaDaTrilha(
      progresso({ temasConcluidos: TODOS, simulados: [ruim] }),
      "ed",
      MODULOS,
      4,
    );
    expect(faltaParaCertificado(c)).toContain("o último deu 50%");
  });
});
