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
