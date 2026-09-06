import { expect, test } from "@playwright/test";

/**
 * Quem chega de uma busca tem dez minutos e uma prova marcada. A home dizia o
 * que fazia em geral, não para quem era, escondia o prazo depois de quatro
 * telas de rolagem, não mostrava nada do produto e oferecia cinco caminhos.
 */
test("acima da dobra: para quem é, em quanto tempo, e um caminho só", async ({ page }, info) => {
  await page.goto("/");

  const dobra = info.project.use.viewport?.height ?? 800;
  const acimaDaDobra = async (texto: string | RegExp) => {
    const caixa = await page.getByText(texto).first().boundingBox();
    return caixa !== null && caixa.y < dobra;
  };

  await expect(page.getByRole("heading", { level: 1 })).toContainText(/engenharia de dados/i);
  expect(await acimaDaDobra(/14 dias/)).toBe(true);
  expect(await acimaDaDobra(/30 temas/)).toBe(true);

  // Um único botão primário: o resto é secundário ou texto.
  await expect(page.getByRole("link", { name: /montar meu plano de 14 dias/i })).toBeVisible();
  await page.getByRole("link", { name: /montar meu plano de 14 dias/i }).click();
  await expect(page).toHaveURL(/\/trilhas\/engenharia-de-dados\/plano\/$/);
});

test("a home mostra conteúdo real, não só descreve", async ({ page }) => {
  await page.goto("/");

  const cartao = page
    .getByRole("button", { expanded: false })
    .filter({ hasText: /responda de cabeça/i });
  await expect(cartao).toBeVisible();
  await cartao.click();
  // Virar revela a resposta: é o flashcard de verdade, do primeiro tema.
  await expect(page.getByRole("button", { expanded: true })).toBeVisible();
  await expect(page.getByText(/responda de cabeça/i)).toHaveCount(0);

  await expect(page.getByText(/uma pergunta da sabatina/i)).toBeVisible();
  await page.getByRole("link", { name: /abrir o tema inteiro/i }).click();
  await expect(page).toHaveURL(/\/fundamentos\/big-data\/$/);
});

test("quem já estuda encontra o caminho de volta na home", async ({ page }) => {
  await page.goto("/trilhas/engenharia-de-dados/hadoop/mapreduce/");
  await page.getByText(/^Card 1 de \d+/).waitFor();

  await page.goto("/");
  const bloco = page.getByText(/você já começou/i);
  await expect(bloco).toBeVisible();
  await expect(page.getByRole("link", { name: /continuar: mapreduce/i })).toBeVisible();
});

test("a home não volta a crescer sem limite", async ({ page }, info) => {
  test.skip(info.project.name !== "pixel-7", "medida de altura só faz sentido em 390 px");

  // Teto de regressão, não meta de design: a página cresceu de propósito ao
  // ganhar a prévia do produto e as perguntas frequentes, que é justamente o
  // que faltava para alguém decidir. O que precisa caber acima da dobra está
  // coberto pelo primeiro teste deste arquivo.
  await page.goto("/");
  const altura = await page.evaluate(() => document.documentElement.scrollHeight);
  expect(altura).toBeLessThan(7_000);
});
