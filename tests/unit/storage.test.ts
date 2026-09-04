import { describe, expect, it } from "vitest";

import {
  contarRespostas,
  mesclar,
  progressoVazio,
  trilhaIniciada,
  trilhaVazia,
  type Progresso,
} from "@/lib/storage";
import { cardNovo } from "@/lib/srs";

/**
 * A mesclagem é o ponto onde dá para perder progresso de verdade: o aluno
 * estudou no celular sem conta, entra no computador e espera achar tudo.
 */
function comTrilha(parcial: Partial<Progresso["trilhas"][string]>, cards = {}): Progresso {
  return {
    ...progressoVazio(),
    trilhas: { ed: { ...trilhaVazia(1000), ...parcial } },
    cards,
  };
}

describe("mesclar", () => {
  it("une temas concluídos dos dois lados", () => {
    const local = comTrilha({ temasConcluidos: { "big-data": 10 } });
    const remoto = comTrilha({ temasConcluidos: { mapreduce: 20 } });

    const fim = mesclar(local, remoto);
    expect(Object.keys(fim.trilhas.ed!.temasConcluidos).sort()).toEqual(["big-data", "mapreduce"]);
  });

  it("nunca desfaz um tema concluído", () => {
    const local = comTrilha({ temasConcluidos: { "big-data": 10 }, atualizadoEm: 1 });
    const remoto = comTrilha({ temasConcluidos: {}, atualizadoEm: 999 });

    expect(mesclar(local, remoto).trilhas.ed!.temasConcluidos["big-data"]).toBe(10);
  });

  it("guarda o melhor resultado de quiz, não o mais recente", () => {
    const local = comTrilha({
      quizzes: { spark: { acertos: 4, total: 4, atualizadoEm: 10 } },
    });
    const remoto = comTrilha({
      quizzes: { spark: { acertos: 1, total: 4, atualizadoEm: 999 } },
    });

    expect(mesclar(local, remoto).trilhas.ed!.quizzes.spark!.acertos).toBe(4);
  });

  it("mantém o card na caixa mais avançada", () => {
    const avancado = { ...cardNovo("spark", 0), caixa: 3, atualizadoEm: 10 };
    const atrasado = { ...cardNovo("spark", 0), caixa: 1, atualizadoEm: 999 };

    const fim = mesclar(
      comTrilha({}, { "spark#0": avancado }),
      comTrilha({}, { "spark#0": atrasado }),
    );
    expect(fim.cards["spark#0"]!.caixa).toBe(3);
  });

  it("não duplica simulados que já existem nos dois lados", () => {
    const simulado = { em: 500, porModulo: { spark: { nota: 4, maximo: 5 } } };
    const local = comTrilha({ simulados: [simulado] });
    const remoto = comTrilha({ simulados: [simulado, { em: 600, porModulo: {} }] });

    expect(mesclar(local, remoto).trilhas.ed!.simulados).toHaveLength(2);
  });

  it("soma minutos pelo maior valor do dia, sem dobrar", () => {
    const local = { ...progressoVazio(), minutosPorDia: { "2026-09-03": 25 } };
    const remoto = { ...progressoVazio(), minutosPorDia: { "2026-09-03": 40 } };

    expect(mesclar(local, remoto).minutosPorDia["2026-09-03"]).toBe(40);
  });

  it("preserva a trilha que só existe de um lado", () => {
    const local = comTrilha({ temasConcluidos: { "big-data": 1 } });
    const remoto = progressoVazio();

    expect(mesclar(local, remoto).trilhas.ed).toBeDefined();
  });
});

describe("trilha iniciada", () => {
  it("sem nada gravado, não começou", () => {
    expect(trilhaIniciada(undefined)).toBe(false);
    expect(trilhaIniciada(trilhaVazia(1))).toBe(false);
  });

  it("pré-teste respondido já conta como início, mesmo sem tema concluído", () => {
    const t = {
      ...trilhaVazia(1),
      preTestes: { "big-data": { acertos: 1, total: 2, atualizadoEm: 5 } },
    };
    expect(trilhaIniciada(t)).toBe(true);
    expect(contarRespostas(t)).toEqual({ preTestes: 1, quizzes: 0, simulados: 0 });
  });

  it("plano definido também conta", () => {
    expect(trilhaIniciada({ ...trilhaVazia(1), dataProva: "2026-09-18" })).toBe(true);
  });
});
