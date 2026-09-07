import { describe, expect, it } from "vitest";

import { estadoDoTempo, formatarTempo, SEGUNDOS_SUGERIDOS } from "@/lib/cronometro";

describe("estado do tempo", () => {
  it("avisa antes de estourar, não depois", () => {
    expect(estadoDoTempo(0)).toBe("dentro");
    expect(estadoDoTempo(89)).toBe("dentro");
    expect(estadoDoTempo(90)).toBe("perto");
    expect(estadoDoTempo(SEGUNDOS_SUGERIDOS)).toBe("passou");
    expect(estadoDoTempo(500)).toBe("passou");
  });

  it("o tempo sugerido é um argumento, não uma constante escondida", () => {
    expect(estadoDoTempo(31, 30)).toBe("passou");
  });
});

describe("formatar tempo", () => {
  it("sempre dois dígitos de cada lado", () => {
    expect(formatarTempo(0)).toBe("00:00");
    expect(formatarTempo(9)).toBe("00:09");
    expect(formatarTempo(84)).toBe("01:24");
    expect(formatarTempo(3600)).toBe("60:00");
  });

  it("negativo vira zero em vez de imprimir sinal", () => {
    expect(formatarTempo(-5)).toBe("00:00");
  });
});
