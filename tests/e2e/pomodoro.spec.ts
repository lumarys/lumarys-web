import { expect, test } from "@playwright/test";

/**
 * O cronômetro de foco vivia em memória de componente: sair do tema para ver um
 * card e voltar apagava a contagem, o que na prática significava nunca terminar
 * um ciclo. E ao zerar ele terminava em silêncio.
 */
const TEMA = "/trilhas/engenharia-de-dados/spark/spark-introducao/";

test("o cronômetro continua depois de navegar e voltar", async ({ page }) => {
  await page.clock.install();
  await page.goto(TEMA);

  const relogio = page.getByRole("button", { name: /iniciar o cronômetro de foco/i });
  await relogio.click();

  await page.clock.fastForward("02:00");
  await expect(page.getByRole("button", { name: /pausar o cronômetro/i })).toContainText("23:00");

  // Sai do tema e volta: o ciclo tem de estar de pé.
  await page.goto("/cards/");
  await page.goto(TEMA);
  await expect(page.getByRole("button", { name: /pausar o cronômetro/i })).toContainText(/2[0-3]:/);
});

test("ao zerar, o título da aba avisa", async ({ page }) => {
  await page.clock.install();
  await page.goto(TEMA);

  await page.getByRole("button", { name: /iniciar o cronômetro de foco/i }).click();
  await page.clock.fastForward("25:01");

  await expect.poll(() => page.title()).toContain("Tempo!");
});
