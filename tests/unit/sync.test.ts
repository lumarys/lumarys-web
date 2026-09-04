import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CHAVE, progressoVazio, trilhaVazia, type Progresso } from "@/lib/storage";

/**
 * A sincronização ao abrir só manda de volta o que ficou diferente do
 * servidor. Sem isto, cada abertura de página seria dois PUTs por trilha.
 */
vi.mock("@/lib/auth", () => ({ tokenValido: async () => "token" }));

function servidor(itens: unknown[]) {
  const chamadas: { metodo: string; caminho: string }[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init: RequestInit = {}) => {
      chamadas.push({ metodo: init.method ?? "GET", caminho: new URL(url).pathname });
      if ((init.method ?? "GET") === "GET") return new Response(JSON.stringify({ itens }));
      return new Response("{}", { status: 200 });
    }),
  );
  return chamadas;
}

function gravarLocal(p: Progresso) {
  window.localStorage.setItem(CHAVE, JSON.stringify(p));
}

describe("sincronizarConta", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.teste");
    vi.resetModules();
    window.localStorage.clear();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("traz o que foi feito em outro aparelho e não reenvia nada quando são iguais", async () => {
    const remota = { ...trilhaVazia(1), temasConcluidos: { "big-data": 10 }, atualizadoEm: 10 };
    const chamadas = servidor([{ sk: "trilha#ed", ...remota }]);
    gravarLocal(progressoVazio());
    const { sincronizarConta } = await import("@/lib/sync");

    expect(await sincronizarConta()).toBe(true);

    const local = JSON.parse(window.localStorage.getItem(CHAVE)!) as Progresso;
    expect(local.trilhas.ed?.temasConcluidos).toEqual({ "big-data": 10 });
    expect(chamadas.map((c) => c.metodo)).toEqual(["GET"]);
  });

  it("manda de volta só a trilha que o aparelho tinha a mais", async () => {
    const chamadas = servidor([{ sk: "trilha#ed", ...trilhaVazia(1) }]);
    gravarLocal({
      ...progressoVazio(),
      trilhas: {
        ed: {
          ...trilhaVazia(1),
          preTestes: { "big-data": { acertos: 2, total: 2, atualizadoEm: 5 } },
        },
        outra: trilhaVazia(2),
      },
    });
    const { sincronizarConta } = await import("@/lib/sync");

    await sincronizarConta();

    const puts = chamadas.filter((c) => c.metodo === "PUT").map((c) => c.caminho);
    expect(puts).toEqual([
      "/me/progresso/ed",
      "/me/cards/ed",
      "/me/progresso/outra",
      "/me/cards/outra",
    ]);
  });

  it("sem token não faz nada", async () => {
    vi.doMock("@/lib/auth", () => ({ tokenValido: async () => null }));
    const chamadas = servidor([]);
    const { sincronizarConta } = await import("@/lib/sync");

    expect(await sincronizarConta()).toBe(false);
    expect(chamadas).toHaveLength(0);
  });
});
