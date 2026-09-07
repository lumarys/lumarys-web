import { expect, test } from "@playwright/test";

/**
 * Encerrar o simulado no meio precisa contar a verdade. Antes, a tela mostrava
 * um placar que nunca era registrado, e o máximo somava as perguntas que o
 * aluno nem tinha visto — quem parava na primeira via 4 de 40.
 */
const SIMULADO = "/simulado/?modulo=fundamentos";

test("encerrar depois de uma resposta registra o placar e não pune o que ficou para depois", async ({
  page,
}) => {
  await page.goto(SIMULADO);
  await page.getByRole("button", { name: /começar simulado/i }).click();

  await page.getByRole("button", { name: /já respondi/i }).click();
  await page.getByRole("button", { name: "4", exact: true }).click();

  await page.getByRole("button", { name: /encerrar/i }).click();

  await expect(page.getByText("Resultado", { exact: true })).toBeVisible();
  // Uma pergunta avaliada: 4 de 5, e não 4 de 40.
  await expect(page.getByText("/5", { exact: false }).first()).toBeVisible();
  await expect(page.getByText(/ficaram para outro dia/i)).toBeVisible();

  // O que a tela mostrou foi mesmo gravado: a prontidão da trilha se mexeu.
  await page.goto("/trilhas/engenharia-de-dados/");
  const prontidao = page.getByText(/prontidão \d+%/i);
  await expect(prontidao).toBeVisible();
  await expect(prontidao).not.toContainText("Prontidão 0%");
});

test("sair sem avaliar nada avisa antes, em vez de inventar uma nota", async ({ page }) => {
  await page.goto(SIMULADO);
  await page.getByRole("button", { name: /começar simulado/i }).click();
  await page.getByRole("button", { name: /encerrar/i }).click();

  await expect(page.getByText(/não avaliou nenhuma resposta/i)).toBeVisible();
  await page.getByRole("button", { name: /continuar respondendo/i }).click();
  await expect(page.getByText(/entrevistador/i)).toBeVisible();
});

test("a pergunta traz cronômetro, os quatro passos e a rubrica ao alcance", async ({ page }) => {
  await page.goto("/simulado/?modulo=fundamentos");
  await page.getByRole("button", { name: /começar simulado/i }).click();

  // Tempo desta pergunta e da sabatina inteira, lado a lado. É sugestão: nada
  // corta a resposta no meio.
  const tempo = page.getByLabel(/tempo nesta pergunta/i);
  await expect(tempo).toBeVisible();
  await expect(tempo).toContainText(/^00:0\d/);
  await expect(tempo).toContainText(/total 00:0\d/);

  for (const passo of ["Contexto", "Opções", "Trade-offs", "Recomendação"]) {
    await expect(page.getByText(passo, { exact: true })).toBeVisible();
  }

  // A rubrica fica antes de revelar a resposta-modelo, fechada: lê-la de
  // graça entregaria metade do exercício.
  // #rubrica: a amostra pública, no fim da página, também tem esse texto.
  const rubrica = page.locator("#rubrica");
  await expect(rubrica).toBeVisible();
  await expect(page.locator("#resposta-modelo")).toHaveCount(0);
  await rubrica.locator("summary").click();
  await expect(rubrica.locator("li").first()).toBeVisible();
});

test("o cronômetro da pergunta reinicia e o total continua", async ({ page }) => {
  await page.clock.install();
  await page.goto("/simulado/?modulo=fundamentos");
  await page.getByRole("button", { name: /começar simulado/i }).click();

  await page.clock.fastForward("03:00");
  const tempo = page.getByLabel(/tempo nesta pergunta/i);
  await expect(tempo).toContainText("03:00");

  await page.getByRole("button", { name: /já respondi/i }).click();
  await page.getByRole("button", { name: "4", exact: true }).click();

  await expect(tempo).toContainText(/^00:0\d/);
  await expect(tempo).toContainText("total 03:0");
});

test("ler a amostra pública não cria progresso no navegador", async ({ page }) => {
  await page.goto("/simulado/");

  const amostra = page.locator("details").first();
  await amostra.locator("summary").click();
  await expect(amostra.getByText("Resposta-modelo")).toBeVisible();
  await expect(amostra.getByText(/o que o avaliador espera/i)).toBeVisible();

  const guardado = await page.evaluate(() => window.localStorage.getItem("lumarys.progresso.v1"));
  expect(guardado).toBeNull();
});
