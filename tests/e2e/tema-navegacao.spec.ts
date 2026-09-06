import { expect, test } from "@playwright/test";

/**
 * A página do tema tinha 22.969 px de altura no celular, treze blocos em ordem
 * fixa, nenhum sumário, nenhuma âncora e nenhum caminho de volta. Este arquivo
 * guarda as três coisas que consertaram isso: dá para saltar, dá para voltar,
 * e a página cabe num tamanho que se lê rolando.
 */
const TEMA = "/trilhas/engenharia-de-dados/spark/spark-introducao/";
const PRIMEIRO = "/trilhas/engenharia-de-dados/fundamentos/big-data/";

test("o sumário salta para a seção escolhida", async ({ page }) => {
  await page.goto(TEMA);

  const sumario = page.getByRole("navigation", { name: /seções do tema/i });
  await expect(sumario).toBeVisible();

  await sumario.getByRole("link", { name: "Quiz" }).click();
  const quiz = page.locator("#quiz");
  await expect(quiz).toBeInViewport();
});

test("dá para ir ao tema anterior e ao próximo", async ({ page }) => {
  await page.goto(TEMA);

  const navegacao = page.getByRole("navigation", { name: /navegar entre temas/i });
  await expect(navegacao.getByRole("link", { name: /anterior/i })).toBeVisible();
  await navegacao.getByRole("link", { name: /próximo/i }).click();
  await expect(page).toHaveURL(/spark-rdd\/$/);

  // O primeiro tema da trilha não tem anterior, e isso não pode quebrar a barra.
  await page.goto(PRIMEIRO);
  const nav = page.getByRole("navigation", { name: /navegar entre temas/i });
  await expect(nav.getByRole("link", { name: /anterior/i })).toHaveCount(0);
  await expect(nav.getByRole("link", { name: /próximo/i })).toBeVisible();
});

test("o tema mais pesado cabe em altura de leitura no celular", async ({ page }, info) => {
  test.skip(info.project.name !== "pixel-7", "medida de altura só faz sentido em 390 px");

  // O material extra existe, mas fechado: quem quer só estudar não paga por ele.
  await page.goto("/trilhas/engenharia-de-dados/alem-da-ementa/sql-para-dados/");
  const altura = await page.evaluate(() => document.documentElement.scrollHeight);
  expect(altura).toBeLessThan(12_000);
});

test("voltar ao topo aparece só depois de rolar", async ({ page }) => {
  await page.goto(TEMA);
  const botao = page.getByRole("button", { name: /voltar ao topo/i });
  await expect(botao).toHaveCount(0);

  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2));
  await expect(botao).toBeVisible();

  // Clique de mouse na posição real: a checagem de acionabilidade do Playwright
  // rola a página antes de clicar, e para um elemento fixo isso a faz apontar
  // para o conteúdo que passou por baixo. O dedo do usuário acerta o botão.
  const caixa = await botao.boundingBox();
  await page.mouse.click(caixa!.x + caixa!.width / 2, caixa!.y + caixa!.height / 2);

  // O próprio botão some quando a página volta para a primeira tela.
  await expect(botao).toHaveCount(0);
});

test("a explicação escrita fica guardada e os pré-requisitos aparecem", async ({ page }) => {
  // spark-rdd declara spark-introducao como pré-requisito no conteúdo.
  await page.goto("/trilhas/engenharia-de-dados/spark/spark-rdd/");

  const antes = page.getByRole("navigation", { name: /pré-requisitos/i });
  await expect(antes).toBeVisible();
  await expect(antes.getByRole("link", { name: /spark: introdução/i })).toBeVisible();

  const campo = page.getByRole("textbox", { name: /sua explicação/i });
  await campo.fill("Spark é rápido porque mantém o dado em memória entre as etapas.");
  await expect(page.getByText(/guardado neste aparelho/i)).toBeVisible();

  await page.reload();
  await expect(page.getByRole("textbox", { name: /sua explicação/i })).toHaveValue(/em memória/);
});
