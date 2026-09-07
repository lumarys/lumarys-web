import { expect, test, type Page } from "@playwright/test";

/**
 * A fila é a ação mais clara do app e a que menos devolvia: sem placar
 * durante a sessão, com a previsão dos próximos dias escondida até a fila
 * acabar, sem volta se a pessoa errasse o botão, e com o layout saltando uns
 * 60 px a cada virada porque os botões nasciam junto com a resposta.
 */
const CHAVE = "lumarys.progresso.v1";
const TEMA = "big-data";

/** Um tema concluído e seus cards vencidos: o estado em que a fila tem o que mostrar. */
async function semearFila(page: Page) {
  await page.addInitScript(
    ([chave, tema]) => {
      const cards: Record<string, unknown> = {};
      for (let i = 0; i < 4; i++) {
        cards[`${tema}#${i}`] = {
          id: `${tema}#${i}`,
          temaSlug: tema,
          caixa: 1,
          vencimento: "2020-01-01",
          acertos: 1,
          erros: 0,
          atualizadoEm: 1,
        };
      }
      window.localStorage.setItem(
        chave as string,
        JSON.stringify({
          versao: 1,
          trilhas: {
            "engenharia-de-dados": {
              iniciadaEm: 1,
              temasConcluidos: { [tema as string]: 1 },
              quizzes: {},
              preTestes: {},
              simulados: [],
              atualizadoEm: 1,
            },
          },
          cards,
          streak: { atual: 1, recorde: 1, ultimoDia: "2026-09-06" },
          minutosPorDia: {},
          atualizadoEm: 1,
        }),
      );
    },
    [CHAVE, TEMA],
  );
}

test("a previsão dos próximos dias fica visível durante a sessão", async ({ page }) => {
  await semearFila(page);
  await page.goto("/cards/");

  await expect(page.getByText(/próximos 7 dias/i)).toBeVisible();
  await expect(page.getByText("1 de 4")).toBeVisible();
  await expect(page.getByText(/4 para revisar/i)).toBeVisible();
});

test("o card não muda de altura ao virar", async ({ page }) => {
  await semearFila(page);
  await page.goto("/cards/");

  // #card e não getByRole: o botão do menu no cabeçalho também tem
  // aria-expanded, e é ele que vinha primeiro.
  const cartao = page.locator("#card");
  const antes = await cartao.boundingBox();
  await cartao.click();
  const depois = await cartao.boundingBox();

  // A frente cresce ao revelar a resposta; o que não pode é a linha de botões
  // aparecer do nada e empurrar tudo. A altura mínima do card absorve a
  // resposta curta, e a linha de ação já ocupava o lugar dela.
  expect(Math.abs(depois!.height - antes!.height)).toBeLessThanOrEqual(2);
  expect(antes!.y).toBeCloseTo(depois!.y, 0);
});

test("desfazer devolve o contador, o placar e o card à caixa anterior", async ({ page }) => {
  await semearFila(page);
  await page.goto("/cards/");

  await page.locator("#card").click();
  await page.getByRole("button", { name: "Sabia", exact: true }).click();

  await expect(page.getByText("2 de 4")).toBeVisible();
  await expect(page.getByText(/1 certo · 0 para rever/)).toBeVisible();

  const depoisDeAvaliar = await page.evaluate((chave) => {
    const p = JSON.parse(window.localStorage.getItem(chave)!);
    return p.cards["big-data#0"].caixa;
  }, CHAVE);
  expect(depoisDeAvaliar).toBe(2);

  await page.getByRole("button", { name: /desfazer a última/i }).click();

  await expect(page.getByText("1 de 4")).toBeVisible();
  await expect(page.getByText(/4 para revisar/i)).toBeVisible();

  const depoisDeDesfazer = await page.evaluate((chave) => {
    const p = JSON.parse(window.localStorage.getItem(chave)!);
    return p.cards["big-data#0"];
  }, CHAVE);
  expect(depoisDeDesfazer.caixa).toBe(1);
  expect(depoisDeDesfazer.vencimento).toBe("2020-01-01");

  // Uma só: desfazer o desfeito seria adivinhar até onde voltar.
  await expect(page.getByRole("button", { name: /desfazer a última/i })).toHaveCount(0);
});
