import { beforeEach, describe, expect, it } from "vitest";

import { definirEscala, lerEscala, proximaEscala, assinarEscala } from "@/lib/preferencias";

describe("escala de leitura", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("anda um passo por vez e para nos extremos", () => {
    expect(proximaEscala(1, 1)).toBe(1.15);
    expect(proximaEscala(1.3, 1)).toBe(1.3);
    expect(proximaEscala(0.9, -1)).toBe(0.9);
  });

  it("guarda a escolha e avisa quem estiver ouvindo", () => {
    let avisos = 0;
    const parar = assinarEscala(() => avisos++);

    definirEscala(1.3);

    expect(lerEscala()).toBe(1.3);
    expect(avisos).toBe(1);
    expect(window.localStorage.getItem("lumarys.escala-leitura")).toBe("1.3");
    parar();
  });

  it("valor estranho no armazenamento cai no padrão, sem quebrar a página", () => {
    window.localStorage.setItem("lumarys.escala-leitura", "3");
    // Assinar é o que carrega, como em lib/store.ts.
    const parar = assinarEscala(() => {});
    definirEscala(1);
    expect(lerEscala()).toBe(1);
    parar();
  });
});
