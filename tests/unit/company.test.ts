import { describe, expect, it } from "vitest";

import { CONTATO_EMAIL, enderecoDeContato } from "@/lib/company";

describe("endereço de contato", () => {
  it("sem assunto, é só o mailto", () => {
    expect(enderecoDeContato()).toBe(`mailto:${CONTATO_EMAIL}`);
  });

  it("escapa espaço e acento no assunto", () => {
    // Um pedido de trilha chega classificado, e "Quero a trilha Engenharia de
    // Analytics" tem os dois problemas.
    const url = enderecoDeContato("Quero a trilha Engenharia de Análise");
    expect(url).toContain("?subject=");
    expect(url).not.toContain(" ");
    expect(decodeURIComponent(url)).toContain("Quero a trilha Engenharia de Análise");
  });
});
