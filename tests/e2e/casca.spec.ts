import { expect, test } from "@playwright/test";

/**
 * A casca era decidida página a página, e por isso: a home não tinha barra de
 * abas, a página da trilha não tinha cabeçalho — o clique principal do site
 * jogava o visitante numa tela sem marca e sem menu — e /sobre oferecia
 * "Cards" e "Simulado" a quem nunca tinha estudado. A regra agora é uma só.
 */
const PUBLICAS = ["/", "/trilhas/", "/metodo/", "/sobre/", "/contato/"];
const DE_ESTADO = ["/hoje/", "/cards/", "/simulado/", "/trilhas/engenharia-de-dados/"];

for (const rota of [...PUBLICAS, ...DE_ESTADO]) {
  test(`cabeçalho presente em ${rota}`, async ({ page }) => {
    await page.goto(rota);
    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Principal", exact: true })).toBeVisible();
  });
}

test("abas só onde existe progresso do aluno", async ({ page }) => {
  const abas = page.getByRole("navigation", { name: "Estudo", exact: true });

  await page.goto("/sobre/");
  await expect(abas).toHaveCount(0);

  await page.goto("/hoje/");
  await expect(abas).toBeVisible();

  await page.goto("/trilhas/");
  await expect(abas).toHaveCount(0);

  await page.goto("/trilhas/engenharia-de-dados/");
  await expect(abas).toBeVisible();
});

test("no celular o menu abre e lista o site inteiro", async ({ page }, info) => {
  test.skip(info.project.name === "desktop", "o menu existe para telas estreitas");

  await page.goto("/");
  await page.getByRole("button", { name: /abrir o menu/i }).click();

  const menu = page.getByRole("dialog", { name: "Menu" });
  await expect(menu).toBeVisible();
  for (const item of ["Trilhas", "Método", "Sobre", "Contato", "Minha conta"]) {
    await expect(menu.getByRole("link", { name: item })).toBeVisible();
  }

  await menu.getByRole("link", { name: "Sobre" }).click();
  await expect(page).toHaveURL(/\/sobre\/$/);
});

test("o 404 oferece a home e a trilha, não só a tela de estudo", async ({ page }) => {
  // A página em si: quem mapeia rota inexistente para cá é a função de borda do
  // CloudFront (infra/site.tf), que o servidor estático dos testes não imita.
  await page.goto("/404.html");

  await expect(page.getByRole("link", { name: /voltar para a página inicial/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /ver a trilha de/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /estudar hoje/i })).toBeVisible();
});

test("o método termina com um caminho para começar", async ({ page }) => {
  await page.goto("/metodo/");
  await page.getByRole("link", { name: /começar pelo plano/i }).click();
  await expect(page).toHaveURL(/\/plano\/$/);
});
