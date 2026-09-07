import { describe, expect, it } from "vitest";

import { progressoVazio, trilhaVazia, type Progresso } from "@/lib/storage";
import { trilhaAtiva } from "@/lib/trilhaAtiva";

const CANDIDATAS = ["ed", "an"];

function com(trilhas: Progresso["trilhas"]): Progresso {
  return { ...progressoVazio(), trilhas };
}

describe("trilha ativa", () => {
  it("sem progresso nenhum, é a primeira do catálogo", () => {
    expect(trilhaAtiva(progressoVazio(), CANDIDATAS)).toBe("ed");
  });

  it("é a trilha em que a pessoa mexeu por último", () => {
    const p = com({
      ed: { ...trilhaVazia(), temasConcluidos: { a: 1 }, atualizadoEm: 100 },
      an: { ...trilhaVazia(), temasConcluidos: { b: 1 }, atualizadoEm: 900 },
    });
    expect(trilhaAtiva(p, CANDIDATAS)).toBe("an");
  });

  it("trilha só criada, sem estudo, não conta", () => {
    // garantirTrilha cria a entrada ao espelhar progresso; isso não é "mexer".
    const p = com({
      ed: { ...trilhaVazia(), temasConcluidos: { a: 1 }, atualizadoEm: 100 },
      an: { ...trilhaVazia(), atualizadoEm: 900 },
    });
    expect(trilhaAtiva(p, CANDIDATAS)).toBe("ed");
  });

  it("a pedida na URL vence, se existir", () => {
    const p = com({ ed: { ...trilhaVazia(), temasConcluidos: { a: 1 }, atualizadoEm: 100 } });
    expect(trilhaAtiva(p, CANDIDATAS, "an")).toBe("an");
    expect(trilhaAtiva(p, CANDIDATAS, "inexistente")).toBe("ed");
  });

  it("sem candidata não há trilha", () => {
    expect(trilhaAtiva(progressoVazio(), [])).toBeUndefined();
  });
});
