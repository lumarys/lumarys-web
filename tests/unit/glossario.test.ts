import { describe, expect, it } from "vitest";

import { extrairTermos, montarGlossario } from "@/lib/glossario";

describe("extrair termos do MDX", () => {
  it("pega nome e definição", () => {
    const termos = extrairTermos(
      '<Termo nome="shuffle">A troca de dados entre executores.</Termo>',
    );
    expect(termos).toEqual([{ nome: "shuffle", definicao: "A troca de dados entre executores." }]);
  });

  it("aceita definição quebrada em várias linhas", () => {
    // É como o MDX é escrito de verdade: o parágrafo quebra em 80 colunas.
    const termos = extrairTermos(`<Termo nome="event time">O momento em que
o fato aconteceu.</Termo>`);
    expect(termos[0]!.definicao).toBe("O momento em que o fato aconteceu.");
  });

  it("tira a marcação inline: o glossário é lista, não cópia do tema", () => {
    const termos = extrairTermos(
      '<Termo nome="skew">quando uma **chave** concentra o `volume` e vira [gargalo](/x)</Termo>',
    );
    expect(termos[0]!.definicao).toBe("quando uma chave concentra o volume e vira gargalo");
  });

  it("pega vários termos do mesmo corpo, na ordem em que aparecem", () => {
    const corpo = `
texto
<Termo nome="a">primeira</Termo>
mais texto
<Termo nome="b">segunda</Termo>
`;
    expect(extrairTermos(corpo).map((t) => t.nome)).toEqual(["a", "b"]);
  });

  it("corpo sem termo nenhum devolve lista vazia", () => {
    expect(extrairTermos('só texto, com <Callout tipo="dica">algo</Callout>')).toEqual([]);
  });

  it("termo sem definição é descartado em vez de virar linha vazia", () => {
    expect(extrairTermos('<Termo nome="vazio">   </Termo>')).toEqual([]);
  });
});

describe("montar o glossário", () => {
  const modulos = [
    {
      slug: "fundamentos",
      temas: [
        { slug: "a", titulo: "A", corpo: '<Termo nome="zebra">bicho listrado</Termo>' },
        { slug: "b", titulo: "B", corpo: '<Termo nome="árvore">planta</Termo>' },
      ],
    },
    {
      slug: "spark",
      temas: [
        // Repete "zebra" e acrescenta um termo novo.
        {
          slug: "c",
          titulo: "C",
          corpo: '<Termo nome="Zebra">outra definição</Termo><Termo nome="banana">fruta</Termo>',
        },
      ],
    },
  ];

  it("ordena em português, com acento no lugar certo", () => {
    expect(montarGlossario(modulos).map((t) => t.nome)).toEqual(["árvore", "banana", "zebra"]);
  });

  it("termo repetido fica com quem definiu primeiro", () => {
    const zebra = montarGlossario(modulos).find((t) => t.nome === "zebra");
    expect(zebra).toMatchObject({ definicao: "bicho listrado", temaSlug: "a" });
  });

  it("guarda de onde o termo veio, para o glossário poder linkar", () => {
    const banana = montarGlossario(modulos).find((t) => t.nome === "banana");
    expect(banana).toMatchObject({ temaSlug: "c", moduloSlug: "spark" });
  });

  it("sem termo nenhum, devolve lista vazia", () => {
    expect(
      montarGlossario([{ slug: "m", temas: [{ slug: "x", titulo: "X", corpo: "" }] }]),
    ).toEqual([]);
  });
});
