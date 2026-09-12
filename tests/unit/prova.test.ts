import { describe, expect, it } from "vitest";

import {
  corrigirProva,
  cotasPorDominio,
  montarProva,
  segundosDeProva,
  type DominioDaProva,
  type QuestaoDeProva,
} from "@/lib/prova";

const SAA: DominioDaProva[] = [
  { slug: "seguras", titulo: "Seguras", peso: 30 },
  { slug: "resilientes", titulo: "Resilientes", peso: 26 },
  { slug: "desempenho", titulo: "Desempenho", peso: 24 },
  { slug: "custo", titulo: "Custo", peso: 20 },
];

function questao(id: string, modulo: string, corretas: number[], n = 4): QuestaoDeProva {
  return {
    id,
    moduloSlug: modulo,
    moduloTitulo: modulo,
    temaSlug: "t",
    temaTitulo: "T",
    href: "/",
    tipo: corretas.length > 1 ? "multipla" : "unica",
    enunciado: `q ${id}`,
    alternativas: Array.from({ length: n }, (_, i) => ({
      texto: `alt ${i}`,
      correta: corretas.includes(i),
      explicacao: "porque sim",
    })),
  };
}

describe("cotas por domínio", () => {
  it("respeita o peso e fecha exatamente no total", () => {
    const cotas = cotasPorDominio(SAA, 65);
    expect(Object.values(cotas).reduce((a, b) => a + b, 0)).toBe(65);
    // 30% de 65 = 19,5 → o resto do arredondamento vai para os maiores pesos.
    expect(cotas.seguras).toBe(20);
    expect(cotas.resilientes).toBe(17);
    expect(cotas.desempenho).toBe(15);
    expect(cotas.custo).toBe(13);
  });

  it("sem peso ou sem total, tudo zero", () => {
    expect(Object.values(cotasPorDominio(SAA, 0)).every((c) => c === 0)).toBe(true);
    expect(cotasPorDominio([{ slug: "x", titulo: "X", peso: 0 }], 10)).toEqual({ x: 0 });
  });
});

describe("montar prova", () => {
  const banco = [
    ...Array.from({ length: 30 }, (_, i) => questao(`s${i}`, "seguras", [0])),
    ...Array.from({ length: 30 }, (_, i) => questao(`r${i}`, "resilientes", [0])),
    ...Array.from({ length: 30 }, (_, i) => questao(`d${i}`, "desempenho", [0])),
    ...Array.from({ length: 30 }, (_, i) => questao(`c${i}`, "custo", [0])),
  ];

  it("sorteia pelo peso, sem repetir", () => {
    const prova = montarProva(banco, SAA, 65, 7);
    expect(prova).toHaveLength(65);
    expect(new Set(prova.map((q) => q.id)).size).toBe(65);
    expect(prova.filter((q) => q.moduloSlug === "seguras")).toHaveLength(20);
    expect(prova.filter((q) => q.moduloSlug === "custo")).toHaveLength(13);
  });

  it("com banco menor que a cota, a prova sai menor em vez de repetir", () => {
    const pouco = banco.filter((q) => q.moduloSlug !== "custo").concat(questao("c0", "custo", [0]));
    const prova = montarProva(pouco, SAA, 65, 7);
    expect(prova.filter((q) => q.moduloSlug === "custo")).toHaveLength(1);
    expect(prova).toHaveLength(65 - 13 + 1);
  });

  it("a mesma semente dá a mesma prova", () => {
    const a = montarProva(banco, SAA, 65, 42).map((q) => q.id);
    const b = montarProva(banco, SAA, 65, 42).map((q) => q.id);
    expect(a).toEqual(b);
  });
});

describe("corrigir prova", () => {
  const prova = [
    questao("a", "seguras", [1]),
    questao("b", "seguras", [0, 2], 5),
    questao("c", "custo", [3]),
  ];

  it("múltipla resposta só vale com o conjunto exato, sem crédito parcial", () => {
    const parcial = corrigirProva(prova, { a: [1], b: [0], c: [3] }, SAA, 720);
    expect(parcial.acertos).toBe(2);
    expect(parcial.erradas).toEqual(["b"]);

    const exato = corrigirProva(prova, { a: [1], b: [2, 0], c: [3] }, SAA, 720);
    expect(exato.acertos).toBe(3);
  });

  it("em branco conta errada e não conta como respondida", () => {
    const r = corrigirProva(prova, { a: [1] }, SAA, 720);
    expect(r).toMatchObject({ acertos: 1, respondidas: 1, total: 3 });
    expect(r.erradas).toEqual(["b", "c"]);
  });

  it("agrupa por domínio para a prontidão", () => {
    const r = corrigirProva(prova, { a: [1], b: [0, 2], c: [0] }, SAA, 720);
    expect(r.porDominio.find((d) => d.slug === "seguras")).toMatchObject({ acertos: 2, total: 2 });
    expect(r.porDominio.find((d) => d.slug === "custo")).toMatchObject({ acertos: 0, total: 1 });
    expect(r.porDominio.find((d) => d.slug === "resilientes")).toMatchObject({
      acertos: 0,
      total: 0,
    });
  });

  it("a escala vai de 100 a 1000 e o corte de 720 fica perto de 69%", () => {
    const tudo = corrigirProva(prova, { a: [1], b: [0, 2], c: [3] }, SAA, 720);
    expect(tudo.pontuacao).toBe(1000);
    expect(tudo.aprovado).toBe(true);
    const nada = corrigirProva(prova, {}, SAA, 720);
    expect(nada.pontuacao).toBe(100);
    expect(nada.aprovado).toBe(false);
    // 2 de 3 = 66,7% → 700, abaixo do corte.
    const doisTercos = corrigirProva(prova, { a: [1], b: [0, 2] }, SAA, 720);
    expect(doisTercos.pontuacao).toBe(700);
    expect(doisTercos.aprovado).toBe(false);
  });

  it("prova vazia não aprova ninguém", () => {
    expect(corrigirProva([], {}, SAA, 720)).toMatchObject({ pontuacao: 100, aprovado: false });
  });
});

describe("tempo de prova", () => {
  it("segue o ritmo do exame: 2 minutos por questão na SAA", () => {
    expect(segundosDeProva(65, 130, 65)).toBe(7800);
    expect(segundosDeProva(20, 130, 65)).toBe(2400);
  });
});
