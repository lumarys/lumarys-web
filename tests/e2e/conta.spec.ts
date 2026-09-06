import { expect, test } from "@playwright/test";

/**
 * A Conta dizia "1 tema concluído e 8 cards em revisão" e mais nada. Quem
 * chega ali quer saber uma coisa: se eu limpar este navegador, o que eu perco?
 * A resposta agora é item por item. E as duas ações destrutivas passavam pelo
 * window.confirm, que não explica o que some, o que fica, nem em português.
 */
const CHAVE = "lumarys.progresso.v1";

async function semearProgresso(page: import("@playwright/test").Page) {
  await page.addInitScript(
    ([chave]) => {
      window.localStorage.setItem(
        chave as string,
        JSON.stringify({
          versao: 1,
          trilhas: {
            "engenharia-de-dados": {
              iniciadaEm: 1,
              temasConcluidos: { "spark-introducao": 1, "modelagem-dimensional": 2 },
              quizzes: {},
              preTestes: {},
              simulados: [],
              dataProva: "2026-11-18",
              atualizadoEm: 2,
            },
          },
          cards: {
            "a#0": { id: "a#0", temaSlug: "a", caixa: 0, vencimento: "2026-01-01", acertos: 0, erros: 0, atualizadoEm: 1 },
            "a#1": { id: "a#1", temaSlug: "a", caixa: 2, vencimento: "2026-01-01", acertos: 1, erros: 0, atualizadoEm: 1 },
            "a#2": { id: "a#2", temaSlug: "a", caixa: 3, vencimento: "2026-01-01", acertos: 2, erros: 0, atualizadoEm: 1 },
            "a#3": { id: "a#3", temaSlug: "a", caixa: 6, vencimento: "2026-01-01", acertos: 6, erros: 0, atualizadoEm: 1 },
          },
          streak: { atual: 3, recorde: 9, ultimoDia: "2026-09-06" },
          minutosPorDia: {},
          atualizadoEm: 2,
        }),
      );
    },
    [CHAVE],
  );
}

test("o resumo diz o que se perde, em unidades que a pessoa reconhece", async ({ page }) => {
  await semearProgresso(page);
  await page.goto("/conta/");

  const resumo = page.getByText("Neste aparelho").locator("..");
  await expect(resumo.getByText("Temas concluídos")).toBeVisible();
  await expect(resumo.getByText("2", { exact: true })).toBeVisible();
  await expect(resumo.getByText("3 dias")).toBeVisible();
  // Duas caixas de 1 a 4, mais um card novo à parte e um já memorizado.
  await expect(resumo.getByText("2 (+1 novos)")).toBeVisible();
  await expect(resumo.getByText("Cards memorizados")).toBeVisible();
  await expect(resumo.getByText("18/11")).toBeVisible();
});

test("sem nada estudado, a Conta não inventa número", async ({ page }) => {
  await page.goto("/conta/");
  await expect(page.getByText(/nenhum progresso ainda/i)).toBeVisible();
  await expect(page.getByText("Temas concluídos")).toHaveCount(0);
});

test("o navegador que recusa guardar o progresso é denunciado na Conta", async ({ page }) => {
  await page.addInitScript(() => {
    // Janela privada de alguns navegadores: setItem existe e lança.
    Storage.prototype.setItem = () => {
      throw new DOMException("bloqueado", "QuotaExceededError");
    };
  });
  await page.goto("/conta/");
  await expect(page.getByText(/recusando guardar o progresso/i)).toBeVisible();
});
