import { expect, test, type Page } from "@playwright/test";

/**
 * O drill só existia dentro do corpo do tema, no meio de uma página de
 * milhares de pixels: acontecia por acaso, e quase nunca no tema em que teria
 * valido a pena. A fila dá endereço a ele — quem errou o quiz ou levou aponte
 * do checkpoint aparece no Hoje.
 */
const CHAVE = "lumarys.progresso.v1";

async function semear(page: Page, extra: Record<string, unknown>) {
  await page.addInitScript(
    ([chave, dados]) => window.localStorage.setItem(chave as string, JSON.stringify(dados)),
    [
      CHAVE,
      {
        versao: 1,
        trilhas: {
          "engenharia-de-dados": {
            iniciadaEm: 1,
            temasConcluidos: {},
            quizzes: {},
            preTestes: {},
            simulados: [],
            dataProva: "2026-11-18",
            atualizadoEm: 1,
            ...extra,
          },
        },
        cards: {},
        streak: { atual: 1, recorde: 1, ultimoDia: "2026-09-06" },
        minutosPorDia: {},
        atualizadoEm: 1,
      },
    ] as const,
  );
}

test("errar o quiz de um tema faz o Hoje oferecer o drill dele", async ({ page }) => {
  await semear(page, { quizzes: { "big-data": { acertos: 2, total: 10, atualizadoEm: 100 } } });
  await page.goto("/hoje/");

  const chip = page.getByRole("link", { name: /drill · \d+ min/i });
  await expect(chip).toBeVisible();
  await chip.click();

  await expect(page).toHaveURL(/\/big-data\/drill\/$/);
  await expect(page.getByRole("heading", { name: /big data/i })).toBeVisible();
  await expect(page.getByText(/drill · cerca de \d+ min/i)).toBeVisible();
});

test("sem erro nenhum, o Hoje não inventa drill", async ({ page }) => {
  await semear(page, {});
  await page.goto("/hoje/");
  await expect(page.getByRole("link", { name: /drill · \d+ min/i })).toHaveCount(0);
});

test("o drill isolado grava o resultado e tira o tema da fila", async ({ page }) => {
  await semear(page, { quizzes: { "big-data": { acertos: 2, total: 10, atualizadoEm: 100 } } });
  await page.goto("/trilhas/engenharia-de-dados/fundamentos/big-data/drill/");

  // Responde tudo com a primeira opção e confere: o que importa aqui é a
  // gravação, não a nota.
  const opcoes = page.getByRole("button").filter({ hasText: /^(?!Conferir|Reler).{2,}$/ });
  const quantas = await opcoes.count();
  for (let i = 0; i < quantas; i++) await opcoes.nth(i).click();
  await page.getByRole("button", { name: /conferir/i }).click();

  const gravado = await page.evaluate((chave) => {
    const p = JSON.parse(window.localStorage.getItem(chave)!);
    return p.trilhas["engenharia-de-dados"].drills?.["big-data"];
  }, CHAVE);
  expect(gravado.total).toBeGreaterThan(0);
});

test("erro apontado pelo checkpoint entra na fila antes do erro de quiz", async ({ page }) => {
  await semear(page, {
    quizzes: { "big-data": { acertos: 2, total: 10, atualizadoEm: 900 } },
    checkpoints: {
      fundamentos: {
        acertos: 4,
        total: 10,
        atualizadoEm: 100,
        temasParaRevisar: ["olap-oltp-etl"],
      },
    },
  });
  await page.goto("/hoje/");

  // Mesmo sendo mais antigo, o checkpoint vem primeiro: é evidência mais dura
  // que o quiz respondido logo depois de ler.
  await page.getByRole("link", { name: /drill · \d+ min/i }).click();
  await expect(page).toHaveURL(/\/olap-oltp-etl\/drill\/$/);
});
