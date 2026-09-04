import { expect, test } from "@playwright/test";

const TEMA = "/trilhas/engenharia-de-dados/fundamentos/big-data/";

test("o pré-teste exige alternativa e nível de certeza antes de responder", async ({ page }) => {
  await page.goto(TEMA);

  const responder = page.getByRole("button", { name: /responder|escolha uma alternativa/i });
  await expect(responder).toBeDisabled();

  await page.getByRole("button", { name: /não necessariamente/i }).click();
  await expect(responder).toBeDisabled(); // falta a certeza

  await page.getByRole("radio", { name: "alta" }).click();
  await expect(responder).toBeEnabled();
});

test("errar com certeza alta produz o aviso que importa", async ({ page }) => {
  await page.goto(TEMA);

  // Escolhe deliberadamente uma alternativa errada, com certeza alta.
  await page.getByRole("button", { name: /acima de centenas de gigabytes/i }).click();
  await page.getByRole("radio", { name: "alta" }).click();
  await page.getByRole("button", { name: /^responder$/i }).click();

  await expect(page.getByText(/tinha certeza e errou/i)).toBeVisible();
});

test("responder revela a explicação de cada alternativa", async ({ page }) => {
  await page.goto(TEMA);

  await page.getByRole("button", { name: /não necessariamente/i }).click();
  await page.getByRole("radio", { name: "baixa" }).click();
  await page.getByRole("button", { name: /^responder$/i }).click();

  await expect(page.getByText(/Os Vs andam juntos/i)).toBeVisible();
  await expect(page.getByText(/Volume sozinho não define/i)).toBeVisible();
});

test("o resultado fica gravado: reabrir o tema mostra o pré-teste concluído, e a trilha conta como iniciada", async ({
  page,
}) => {
  await page.goto(TEMA);
  await page.getByRole("button", { name: /não necessariamente/i }).click();
  await page.getByRole("radio", { name: "média" }).click();
  await page.getByRole("button", { name: /^responder$/i }).click();
  await page.getByRole("button", { name: /próxima pergunta/i }).click();
  await page.getByRole("button", { name: /veracidade e valor/i }).click();
  await page.getByRole("radio", { name: "alta" }).click();
  await page.getByRole("button", { name: /^responder$/i }).click();
  await page.getByRole("button", { name: /ir para o conteúdo/i }).click();
  await expect(page.getByText("Pré-teste concluído")).toBeVisible();

  await page.reload();
  await expect(page.getByText("Pré-teste concluído")).toBeVisible();
  await expect(page.getByText(/2 de 2, em/)).toBeVisible();
  await expect(page.getByText(/^Pré-teste · 1 de/)).toHaveCount(0);

  await page.getByRole("button", { name: /refazer o pré-teste/i }).click();
  await expect(page.getByText(/^Pré-teste · 1 de/)).toBeVisible();

  await page.goto("/trilhas/engenharia-de-dados/");
  await expect(page.getByText(/você ainda não começou/i)).toHaveCount(0);
  await expect(page.getByText(/1 pré-teste/)).toBeVisible();
});
