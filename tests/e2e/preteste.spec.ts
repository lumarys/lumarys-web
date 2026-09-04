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
