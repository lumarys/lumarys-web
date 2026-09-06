import { describe, expect, it } from "vitest";

import {
  CHAVE,
  contarRespostas,
  marcarVisita,
  registrarQuiz,
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
    expect(contarRespostas(t)).toEqual({ preTestes: 1, quizzes: 0, simulados: 0, drills: 0 });
  });

  it("plano definido também conta", () => {
    expect(trilhaIniciada({ ...trilhaVazia(1), dataProva: "2026-09-18" })).toBe(true);
  });
});

describe("preferências do plano na mesclagem", () => {
  it("a edição mais recente vence, venha de que aparelho vier", () => {
    // Editar o plano no celular não pode ser desfeito ao abrir o computador.
    const antigo = comTrilha({ dataProva: "2026-09-19", minutosPorDia: 30, atualizadoEm: 10 });
    const novo = comTrilha({ dataProva: "2026-09-26", minutosPorDia: 60, atualizadoEm: 99 });

    expect(mesclar(antigo, novo).trilhas.ed).toMatchObject({
      dataProva: "2026-09-26",
      minutosPorDia: 60,
    });
    expect(mesclar(novo, antigo).trilhas.ed).toMatchObject({
      dataProva: "2026-09-26",
      minutosPorDia: 60,
    });
  });

  it("quem tem plano preenche quem não tem", () => {
    const semPlano = comTrilha({ atualizadoEm: 99 });
    const comPlano = comTrilha({ dataProva: "2026-09-19", modo: "manutencao", atualizadoEm: 10 });

    expect(mesclar(semPlano, comPlano).trilhas.ed).toMatchObject({
      dataProva: "2026-09-19",
      modo: "manutencao",
    });
  });
});

describe("marcar visita", () => {
  it("lembra o tema aberto, que é o que se quer retomar", () => {
    window.localStorage.clear();
    marcarVisita("ed", "spark-rdd");

    const p = JSON.parse(window.localStorage.getItem(CHAVE)!) as Progresso;
    expect(p.trilhas.ed?.ultimoTema).toBe("spark-rdd");
  });

  it("abrir o mesmo tema de novo não regrava nem agenda envio", () => {
    window.localStorage.clear();
    marcarVisita("ed", "spark-rdd");
    const antes = JSON.parse(window.localStorage.getItem(CHAVE)!) as Progresso;

    marcarVisita("ed", "spark-rdd");
    const depois = JSON.parse(window.localStorage.getItem(CHAVE)!) as Progresso;

    expect(depois.atualizadoEm).toBe(antes.atualizadoEm);
  });
});

describe("sinais do tema que antes eram descartados", () => {
  it("guarda os enganos de confiança alta do pré-teste", () => {
    window.localStorage.clear();
    registrarQuiz("ed", "big-data", 1, 3, "preTeste", { enganos: 2 });

    const p = JSON.parse(window.localStorage.getItem(CHAVE)!) as Progresso;
    expect(p.trilhas.ed?.preTestes["big-data"]).toMatchObject({ acertos: 1, enganos: 2 });
  });

  it("guarda quais perguntas do quiz foram erradas", () => {
    window.localStorage.clear();
    registrarQuiz("ed", "spark-rdd", 2, 4, "quiz", { erradas: [1, 3] });

    const p = JSON.parse(window.localStorage.getItem(CHAVE)!) as Progresso;
    expect(p.trilhas.ed?.quizzes["spark-rdd"]?.erradas).toEqual([1, 3]);
  });

  it("guarda o drill num campo próprio, sem se misturar ao quiz", () => {
    window.localStorage.clear();
    registrarQuiz("ed", "etl-vs-elt", 4, 5, "drill");

    const p = JSON.parse(window.localStorage.getItem(CHAVE)!) as Progresso;
    expect(p.trilhas.ed?.drills?.["etl-vs-elt"]).toMatchObject({ acertos: 4, total: 5 });
    expect(p.trilhas.ed?.quizzes["etl-vs-elt"]).toBeUndefined();
    expect(contarRespostas(p.trilhas.ed).drills).toBe(1);
  });

  it("mesclagem mantém o melhor drill e tolera o lado sem o campo", () => {
    const antigo = comTrilha({
      drills: { "etl-vs-elt": { acertos: 2, total: 5, atualizadoEm: 1 } },
    });
    const semCampo = comTrilha({ temasConcluidos: { "big-data": 9 } });

    expect(mesclar(antigo, semCampo).trilhas.ed?.drills?.["etl-vs-elt"]?.acertos).toBe(2);
    expect(mesclar(semCampo, antigo).trilhas.ed?.drills?.["etl-vs-elt"]?.acertos).toBe(2);
  });
});
